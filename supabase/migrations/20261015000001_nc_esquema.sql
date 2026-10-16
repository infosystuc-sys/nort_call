-- Nort Monitor · esquema base. Todas las tablas llevan el prefijo nc_.

create type public.nc_rol as enum ('admin', 'supervisor', 'vendedor');
create type public.nc_canal as enum ('whatsapp', 'instagram');
create type public.nc_autor_mensaje as enum ('cliente', 'vendedor');
create type public.nc_origen_estado as enum ('ia', 'manual');
create type public.nc_motivo_analisis as enum ('tiempo', 'mensajes', 'manual');
create type public.nc_tipo_alerta as enum ('espera', 'intervencion');
create type public.nc_nivel_alerta as enum ('advertencia', 'critico');
create type public.nc_estado_alerta as enum ('abierta', 'atendida');

-- Usuarios de la app. Se vinculan con auth.users por email (ver trigger en la migración de seguridad).
create table public.nc_usuarios (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete set null,
  nombre text not null,
  email text not null,
  rol public.nc_rol not null default 'vendedor',
  activo boolean not null default true,
  creado_at timestamptz not null default now()
);
create unique index nc_usuarios_email_key on public.nc_usuarios (lower(email));

create table public.nc_canales (
  id public.nc_canal primary key,
  nombre text not null,
  proveedor text not null,
  identificador text not null
);

create table public.nc_estados_venta (
  id text primary key default gen_random_uuid()::text,
  nombre text not null,
  color text not null,
  orden int not null,
  activo boolean not null default true
);

create table public.nc_clientes (
  id uuid primary key default gen_random_uuid(),
  canal_id public.nc_canal not null references public.nc_canales (id),
  nombre text not null,
  usuario text not null, -- teléfono o @usuario de Instagram
  empresa text,
  creado_at timestamptz not null default now(),
  unique (canal_id, usuario)
);

create table public.nc_conversaciones (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.nc_clientes (id) on delete cascade,
  canal_id public.nc_canal not null references public.nc_canales (id),
  vendedor_id uuid references public.nc_usuarios (id) on delete set null,
  estado_id text not null references public.nc_estados_venta (id),
  creada_at timestamptz not null default now()
);
create index nc_conversaciones_cliente_idx on public.nc_conversaciones (cliente_id);
create index nc_conversaciones_vendedor_idx on public.nc_conversaciones (vendedor_id);
create index nc_conversaciones_estado_idx on public.nc_conversaciones (estado_id);
create index nc_conversaciones_canal_idx on public.nc_conversaciones (canal_id);

create table public.nc_mensajes (
  id uuid primary key default gen_random_uuid(),
  conversacion_id uuid not null references public.nc_conversaciones (id) on delete cascade,
  autor public.nc_autor_mensaje not null,
  texto text not null,
  enviado_at timestamptz not null default now(),
  id_externo text unique -- id del mensaje en Evolution API / Meta, para evitar duplicados
);
create index nc_mensajes_conversacion_idx on public.nc_mensajes (conversacion_id, enviado_at);

create table public.nc_historial_estados (
  id uuid primary key default gen_random_uuid(),
  conversacion_id uuid not null references public.nc_conversaciones (id) on delete cascade,
  estado_id text not null references public.nc_estados_venta (id),
  origen public.nc_origen_estado not null default 'ia',
  cambiado_por uuid references public.nc_usuarios (id) on delete set null,
  creado_at timestamptz not null default now()
);
create index nc_historial_estados_conversacion_idx on public.nc_historial_estados (conversacion_id);
create index nc_historial_estados_cambiado_por_idx on public.nc_historial_estados (cambiado_por);
create index nc_historial_estados_estado_idx on public.nc_historial_estados (estado_id);

create table public.nc_analisis (
  id uuid primary key default gen_random_uuid(),
  conversacion_id uuid not null references public.nc_conversaciones (id) on delete cascade,
  resumen text not null,
  intencion text not null,
  productos text[] not null default '{}',
  objeciones text[] not null default '{}',
  proximo_paso text not null,
  -- { respuesta|atencion|tecnica|seguimiento: { puntaje: number|null, comentario: text } }
  puntajes jsonb not null default '{}',
  motivo public.nc_motivo_analisis not null,
  solicitado_por uuid references public.nc_usuarios (id) on delete set null,
  creado_at timestamptz not null default now()
);
create index nc_analisis_conversacion_idx on public.nc_analisis (conversacion_id, creado_at desc);
create index nc_analisis_solicitado_por_idx on public.nc_analisis (solicitado_por);

create table public.nc_alertas (
  id uuid primary key default gen_random_uuid(),
  conversacion_id uuid not null references public.nc_conversaciones (id) on delete cascade,
  tipo public.nc_tipo_alerta not null,
  situacion_id text,
  nivel public.nc_nivel_alerta not null,
  titulo text not null,
  motivo text,
  fragmento text,
  estado public.nc_estado_alerta not null default 'abierta',
  creada_at timestamptz not null default now(),
  atendida_por uuid references public.nc_usuarios (id) on delete set null,
  atendida_at timestamptz,
  comentario text
);
create index nc_alertas_conversacion_idx on public.nc_alertas (conversacion_id);
create index nc_alertas_abiertas_idx on public.nc_alertas (creada_at) where estado = 'abierta';
create index nc_alertas_atendida_por_idx on public.nc_alertas (atendida_por);

create table public.nc_notas (
  id uuid primary key default gen_random_uuid(),
  conversacion_id uuid not null references public.nc_conversaciones (id) on delete cascade,
  autor_id uuid references public.nc_usuarios (id) on delete set null,
  texto text not null,
  creado_at timestamptz not null default now()
);
create index nc_notas_conversacion_idx on public.nc_notas (conversacion_id);
create index nc_notas_autor_idx on public.nc_notas (autor_id);

create table public.nc_metricas_diarias (
  fecha date not null,
  canal_id public.nc_canal not null references public.nc_canales (id),
  puntaje numeric(4, 1) not null,
  tiempo_respuesta_min int not null,
  conversaciones int not null,
  ganadas int not null,
  primary key (fecha, canal_id)
);
create index nc_metricas_diarias_canal_idx on public.nc_metricas_diarias (canal_id);

create table public.nc_resumen_desempeno (
  id uuid primary key default gen_random_uuid(),
  vendedor_id uuid not null references public.nc_usuarios (id) on delete cascade,
  fortalezas text[] not null default '{}',
  mejoras text[] not null default '{}',
  generado_at timestamptz not null default now()
);
create index nc_resumen_desempeno_vendedor_idx on public.nc_resumen_desempeno (vendedor_id, generado_at desc);

-- Configuración no sensible, una fila por sección (whatsapp, instagram, ia, alertas).
create table public.nc_configuracion (
  seccion text primary key,
  valores jsonb not null default '{}',
  actualizado_at timestamptz not null default now(),
  actualizado_por uuid references public.nc_usuarios (id) on delete set null
);
create index nc_configuracion_actualizado_por_idx on public.nc_configuracion (actualizado_por);

-- Credenciales (API keys, tokens). Solo administradores.
create table public.nc_credenciales (
  seccion text primary key references public.nc_configuracion (seccion) on delete cascade,
  valores jsonb not null default '{}',
  actualizado_at timestamptz not null default now()
);
