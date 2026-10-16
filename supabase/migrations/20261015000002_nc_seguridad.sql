-- Nort Monitor · vínculo con Supabase Auth, funciones auxiliares y RLS.
--
-- Modelo de acceso:
--   admin      → todo, incluida la configuración, credenciales, estados y usuarios.
--   supervisor → todas las conversaciones, alertas y notas; corrige estados.
--   vendedor   → solo sus conversaciones (mensajes, análisis, historial) y su desempeño.
-- Un usuario de auth sin fila activa en nc_usuarios no ve nada.

create schema if not exists private;
grant usage on schema private to authenticated;

-- Id de nc_usuarios del usuario logueado (solo si está activo).
create function private.nc_usuario_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select u.id from public.nc_usuarios u
  where u.auth_user_id = (select auth.uid()) and u.activo
$$;

-- Rol del usuario logueado (null si no tiene acceso).
create function private.nc_rol()
returns public.nc_rol
language sql
stable
security definer
set search_path = ''
as $$
  select u.rol from public.nc_usuarios u
  where u.auth_user_id = (select auth.uid()) and u.activo
$$;

revoke all on function private.nc_usuario_id() from public, anon;
revoke all on function private.nc_rol() from public, anon;
grant execute on function private.nc_usuario_id() to authenticated;
grant execute on function private.nc_rol() to authenticated;

-- Al crear (o cambiar el email de) un usuario en Auth, se vincula con su fila de nc_usuarios por email.
create function private.nc_vincular_usuario_auth()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.nc_usuarios
     set auth_user_id = new.id
   where lower(email) = lower(new.email)
     and (auth_user_id is null or auth_user_id = new.id);
  return new;
end;
$$;
revoke all on function private.nc_vincular_usuario_auth() from public, anon, authenticated;

create trigger nc_vincular_usuario_auth
after insert or update of email on auth.users
for each row execute function private.nc_vincular_usuario_auth();

-- Al crear o cambiar el email de una fila de nc_usuarios, se vincula con un usuario de Auth existente.
create function private.nc_vincular_desde_nc_usuarios()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.auth_user_id is null or (tg_op = 'UPDATE' and lower(new.email) <> lower(old.email)) then
    new.auth_user_id := (select a.id from auth.users a where lower(a.email) = lower(new.email) limit 1);
  end if;
  return new;
end;
$$;
revoke all on function private.nc_vincular_desde_nc_usuarios() from public, anon, authenticated;

create trigger nc_vincular_desde_nc_usuarios
before insert or update of email on public.nc_usuarios
for each row execute function private.nc_vincular_desde_nc_usuarios();

-- Cambio manual de estado de venta: actualiza la conversación y deja registro en el historial.
-- security invoker: las políticas RLS de ambas tablas se aplican.
create function public.nc_cambiar_estado(p_conversacion_id uuid, p_estado_id text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.nc_conversaciones set estado_id = p_estado_id where id = p_conversacion_id;
  if not found then
    raise exception 'Conversación no encontrada o sin permiso';
  end if;
  insert into public.nc_historial_estados (conversacion_id, estado_id, origen, cambiado_por)
  values (p_conversacion_id, p_estado_id, 'manual', private.nc_usuario_id());
end;
$$;
revoke all on function public.nc_cambiar_estado(uuid, text) from public, anon;
grant execute on function public.nc_cambiar_estado(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Permisos de tabla (la Data API no expone tablas nuevas a anon/authenticated
-- en todos los proyectos) + RLS en todas.
-- ---------------------------------------------------------------------------
revoke all on public.nc_usuarios, public.nc_canales, public.nc_estados_venta, public.nc_clientes,
  public.nc_conversaciones, public.nc_mensajes, public.nc_historial_estados, public.nc_analisis,
  public.nc_alertas, public.nc_notas, public.nc_metricas_diarias, public.nc_resumen_desempeno,
  public.nc_configuracion, public.nc_credenciales from anon, authenticated;

grant select on public.nc_usuarios, public.nc_canales, public.nc_estados_venta, public.nc_clientes,
  public.nc_conversaciones, public.nc_mensajes, public.nc_historial_estados, public.nc_analisis,
  public.nc_alertas, public.nc_notas, public.nc_metricas_diarias, public.nc_resumen_desempeno,
  public.nc_configuracion, public.nc_credenciales to authenticated;
grant insert, update, delete on public.nc_usuarios, public.nc_estados_venta to authenticated;
grant update on public.nc_conversaciones, public.nc_alertas to authenticated;
grant insert on public.nc_historial_estados, public.nc_analisis, public.nc_notas to authenticated;
grant insert, update on public.nc_configuracion, public.nc_credenciales to authenticated;

alter table public.nc_usuarios enable row level security;
alter table public.nc_canales enable row level security;
alter table public.nc_estados_venta enable row level security;
alter table public.nc_clientes enable row level security;
alter table public.nc_conversaciones enable row level security;
alter table public.nc_mensajes enable row level security;
alter table public.nc_historial_estados enable row level security;
alter table public.nc_analisis enable row level security;
alter table public.nc_alertas enable row level security;
alter table public.nc_notas enable row level security;
alter table public.nc_metricas_diarias enable row level security;
alter table public.nc_resumen_desempeno enable row level security;
alter table public.nc_configuracion enable row level security;
alter table public.nc_credenciales enable row level security;

-- nc_usuarios
create policy "nc_usuarios: ver propio o con acceso" on public.nc_usuarios for select to authenticated
  using (auth_user_id = (select auth.uid()) or (select private.nc_rol()) is not null);
create policy "nc_usuarios: admin crea" on public.nc_usuarios for insert to authenticated
  with check ((select private.nc_rol()) = 'admin');
create policy "nc_usuarios: admin edita" on public.nc_usuarios for update to authenticated
  using ((select private.nc_rol()) = 'admin')
  with check ((select private.nc_rol()) = 'admin');
create policy "nc_usuarios: admin elimina" on public.nc_usuarios for delete to authenticated
  using ((select private.nc_rol()) = 'admin' and id <> (select private.nc_usuario_id()));

-- Catálogos y métricas: lectura para cualquier usuario con acceso.
create policy "nc_canales: leer" on public.nc_canales for select to authenticated
  using ((select private.nc_rol()) is not null);
create policy "nc_metricas_diarias: leer" on public.nc_metricas_diarias for select to authenticated
  using ((select private.nc_rol()) is not null);
create policy "nc_configuracion: leer" on public.nc_configuracion for select to authenticated
  using ((select private.nc_rol()) is not null);
create policy "nc_configuracion: admin crea" on public.nc_configuracion for insert to authenticated
  with check ((select private.nc_rol()) = 'admin');
create policy "nc_configuracion: admin edita" on public.nc_configuracion for update to authenticated
  using ((select private.nc_rol()) = 'admin')
  with check ((select private.nc_rol()) = 'admin');

-- nc_credenciales: solo admin.
create policy "nc_credenciales: admin lee" on public.nc_credenciales for select to authenticated
  using ((select private.nc_rol()) = 'admin');
create policy "nc_credenciales: admin crea" on public.nc_credenciales for insert to authenticated
  with check ((select private.nc_rol()) = 'admin');
create policy "nc_credenciales: admin edita" on public.nc_credenciales for update to authenticated
  using ((select private.nc_rol()) = 'admin')
  with check ((select private.nc_rol()) = 'admin');

-- nc_estados_venta
create policy "nc_estados_venta: leer" on public.nc_estados_venta for select to authenticated
  using ((select private.nc_rol()) is not null);
create policy "nc_estados_venta: admin crea" on public.nc_estados_venta for insert to authenticated
  with check ((select private.nc_rol()) = 'admin');
create policy "nc_estados_venta: admin edita" on public.nc_estados_venta for update to authenticated
  using ((select private.nc_rol()) = 'admin')
  with check ((select private.nc_rol()) = 'admin');
create policy "nc_estados_venta: admin elimina" on public.nc_estados_venta for delete to authenticated
  using ((select private.nc_rol()) = 'admin');

-- nc_conversaciones
create policy "nc_conversaciones: leer" on public.nc_conversaciones for select to authenticated
  using (
    (select private.nc_rol()) in ('admin', 'supervisor')
    or vendedor_id = (select private.nc_usuario_id())
  );
create policy "nc_conversaciones: supervisor edita" on public.nc_conversaciones for update to authenticated
  using ((select private.nc_rol()) in ('admin', 'supervisor'))
  with check ((select private.nc_rol()) in ('admin', 'supervisor'));

-- Tablas hijas de una conversación: visibles si la conversación es visible (su RLS se aplica en el exists).
create policy "nc_clientes: leer" on public.nc_clientes for select to authenticated
  using (
    (select private.nc_rol()) in ('admin', 'supervisor')
    or exists (select 1 from public.nc_conversaciones c where c.cliente_id = nc_clientes.id)
  );
create policy "nc_mensajes: leer" on public.nc_mensajes for select to authenticated
  using (exists (select 1 from public.nc_conversaciones c where c.id = nc_mensajes.conversacion_id));
create policy "nc_historial_estados: leer" on public.nc_historial_estados for select to authenticated
  using (exists (select 1 from public.nc_conversaciones c where c.id = nc_historial_estados.conversacion_id));
create policy "nc_historial_estados: supervisor registra" on public.nc_historial_estados for insert to authenticated
  with check (
    (select private.nc_rol()) in ('admin', 'supervisor')
    and origen = 'manual'
    and cambiado_por = (select private.nc_usuario_id())
  );
create policy "nc_analisis: leer" on public.nc_analisis for select to authenticated
  using (exists (select 1 from public.nc_conversaciones c where c.id = nc_analisis.conversacion_id));
create policy "nc_analisis: solicitar manual" on public.nc_analisis for insert to authenticated
  with check (
    motivo = 'manual'
    and solicitado_por = (select private.nc_usuario_id())
    and exists (select 1 from public.nc_conversaciones c where c.id = nc_analisis.conversacion_id)
  );

-- nc_alertas y nc_notas: solo supervisión.
create policy "nc_alertas: supervisor lee" on public.nc_alertas for select to authenticated
  using ((select private.nc_rol()) in ('admin', 'supervisor'));
create policy "nc_alertas: supervisor atiende" on public.nc_alertas for update to authenticated
  using ((select private.nc_rol()) in ('admin', 'supervisor'))
  with check ((select private.nc_rol()) in ('admin', 'supervisor'));
create policy "nc_notas: supervisor lee" on public.nc_notas for select to authenticated
  using ((select private.nc_rol()) in ('admin', 'supervisor'));
create policy "nc_notas: supervisor escribe" on public.nc_notas for insert to authenticated
  with check (
    (select private.nc_rol()) in ('admin', 'supervisor')
    and autor_id = (select private.nc_usuario_id())
  );

-- nc_resumen_desempeno
create policy "nc_resumen_desempeno: leer" on public.nc_resumen_desempeno for select to authenticated
  using (
    (select private.nc_rol()) in ('admin', 'supervisor')
    or vendedor_id = (select private.nc_usuario_id())
  );
