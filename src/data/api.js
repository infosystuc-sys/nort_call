// Capa de acceso a datos.
// Con VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY definidas usa Supabase (tablas nc_*);
// sin ellas funciona en modo demo con los datos de ejemplo en memoria.
import { createClient } from '@supabase/supabase-js';
import { createMockData } from './mockData';

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const usaSupabase = !!(URL && KEY);
export const supabase = usaSupabase ? createClient(URL, KEY) : null;

// Campos de configuración que se guardan en nc_credenciales (solo admin) en lugar de nc_configuracion.
const SECRETOS = {
  whatsapp: ['apiKey', 'webhookToken'],
  instagram: ['appSecret', 'accessToken', 'verifyToken'],
  ia: ['apiKey', 'groqApiKey'],
  alertas: [],
};

function ok({ data, error }) {
  if (error) throw error;
  return data;
}

// Lee una tabla completa paginando (PostgREST devuelve como máximo 1000 filas por pedido).
async function todo(tabla, orden) {
  const filas = [];
  for (let desde = 0; ; desde += 1000) {
    let q = supabase
      .from(tabla)
      .select('*')
      .range(desde, desde + 999);
    if (orden) q = q.order(orden);
    const lote = ok(await q);
    filas.push(...lote);
    if (lote.length < 1000) return filas;
  }
}

// ---------------------------------------------------------------------------
// Sesión
// ---------------------------------------------------------------------------

export async function sesionActual() {
  if (!usaSupabase) return null;
  return ok(await supabase.auth.getSession()).session;
}

export async function iniciarSesion(email, password) {
  return ok(await supabase.auth.signInWithPassword({ email, password })).session;
}

export async function cerrarSesion() {
  if (usaSupabase) await supabase.auth.signOut();
}

// ---------------------------------------------------------------------------
// Conversión de filas de Supabase (snake_case) al formato de la app, por tabla.
// clave = propiedad del objeto db donde vive la tabla.
// ---------------------------------------------------------------------------
const FILAS = {
  nc_usuarios: {
    clave: 'usuarios',
    mapear: u => ({
      id: u.id,
      authUserId: u.auth_user_id,
      nombre: u.nombre,
      email: u.email,
      rol: u.rol,
      activo: u.activo,
      creadoAt: u.creado_at,
    }),
  },
  nc_estados_venta: {
    clave: 'estadosVenta',
    mapear: e => ({ id: e.id, nombre: e.nombre, color: e.color, orden: e.orden, activo: e.activo }),
  },
  nc_clientes: {
    clave: 'clientes',
    mapear: c => ({ id: c.id, canalId: c.canal_id, nombre: c.nombre, usuario: c.usuario, empresa: c.empresa || undefined }),
  },
  nc_conversaciones: {
    clave: 'conversaciones',
    mapear: c => ({
      id: c.id,
      clienteId: c.cliente_id,
      canalId: c.canal_id,
      vendedorId: c.vendedor_id,
      estadoId: c.estado_id,
      interna: !!c.interna,
      creadaAt: c.creada_at,
    }),
  },
  nc_mensajes: {
    clave: 'mensajes',
    mapear: m => ({ id: m.id, conversacionId: m.conversacion_id, autor: m.autor, texto: m.texto, enviadoAt: m.enviado_at }),
  },
  nc_historial_estados: {
    clave: 'historialEstados',
    mapear: h => ({
      id: h.id,
      conversacionId: h.conversacion_id,
      estadoId: h.estado_id,
      origen: h.origen,
      cambiadoPor: h.cambiado_por,
      creadoAt: h.creado_at,
    }),
  },
  nc_analisis: {
    clave: 'analisis',
    mapear: a => ({
      id: a.id,
      conversacionId: a.conversacion_id,
      creadoAt: a.creado_at,
      motivo: a.motivo,
      solicitadoPor: a.solicitado_por,
      resumen: a.resumen,
      intencion: a.intencion,
      productos: a.productos,
      objeciones: a.objeciones,
      proximoPaso: a.proximo_paso,
      puntajes: a.puntajes,
      modelo: a.modelo || null, // quién lo hizo, p. ej. "groq/openai/gpt-oss-120b"
    }),
  },
  nc_alertas: {
    clave: 'alertas',
    mapear: a => ({
      id: a.id,
      conversacionId: a.conversacion_id,
      tipo: a.tipo,
      situacionId: a.situacion_id,
      nivel: a.nivel,
      titulo: a.titulo,
      motivo: a.motivo,
      fragmento: a.fragmento,
      estado: a.estado,
      creadaAt: a.creada_at,
      atendidaPor: a.atendida_por,
      atendidaAt: a.atendida_at,
      comentario: a.comentario,
    }),
  },
  nc_notas: {
    clave: 'notas',
    mapear: n => ({ id: n.id, conversacionId: n.conversacion_id, autorId: n.autor_id, texto: n.texto, creadoAt: n.creado_at }),
  },
};

// ---------------------------------------------------------------------------
// Lectura: arma el mismo objeto que createMockData() a partir de las tablas nc_*.
// ---------------------------------------------------------------------------

export async function loadDatabase() {
  if (!usaSupabase) {
    return new Promise(resolve => setTimeout(() => resolve(createMockData()), 350));
  }
  const [
    usuarios,
    canales,
    estados,
    clientes,
    conversaciones,
    mensajes,
    historial,
    analisis,
    alertas,
    notas,
    metricas,
    resumenes,
    configuracion,
    credenciales,
  ] = await Promise.all([
    todo('nc_usuarios', 'creado_at'),
    todo('nc_canales'),
    todo('nc_estados_venta', 'orden'),
    todo('nc_clientes'),
    todo('nc_conversaciones'),
    todo('nc_mensajes', 'enviado_at'),
    todo('nc_historial_estados'),
    todo('nc_analisis'),
    todo('nc_alertas'),
    todo('nc_notas'),
    todo('nc_metricas_diarias', 'fecha'),
    todo('nc_resumen_desempeno', 'generado_at'),
    todo('nc_configuracion'),
    todo('nc_credenciales'), // vacío para quien no es admin (RLS)
  ]);

  const cfg = {};
  configuracion.forEach(c => (cfg[c.seccion] = { ...c.valores }));
  credenciales.forEach(c => Object.assign(cfg[c.seccion] || (cfg[c.seccion] = {}), c.valores));
  // La URL del webhook incluye el token secreto: solo la ve el admin (único que lee nc_credenciales).
  if (cfg.whatsapp) {
    cfg.whatsapp.webhookUrl = cfg.whatsapp.webhookToken
      ? `${URL}/functions/v1/nc-webhook-evolution?token=${cfg.whatsapp.webhookToken}`
      : '';
  }
  const resumen = resumenes[resumenes.length - 1];

  return {
    ahora: new Date().toISOString(),
    usuarios: usuarios.map(FILAS.nc_usuarios.mapear),
    canales,
    estadosVenta: estados.map(FILAS.nc_estados_venta.mapear),
    clientes: clientes.map(FILAS.nc_clientes.mapear),
    conversaciones: conversaciones.map(FILAS.nc_conversaciones.mapear),
    mensajes: mensajes.map(FILAS.nc_mensajes.mapear),
    historialEstados: historial.map(FILAS.nc_historial_estados.mapear),
    analisis: analisis.map(FILAS.nc_analisis.mapear),
    alertas: alertas.map(FILAS.nc_alertas.mapear),
    notas: notas.map(FILAS.nc_notas.mapear),
    metricasDiarias: metricas.map(m => ({
      fecha: m.fecha,
      canalId: m.canal_id,
      puntaje: Number(m.puntaje),
      tiempoRespuestaMin: m.tiempo_respuesta_min,
      conversaciones: m.conversaciones,
      ganadas: m.ganadas,
    })),
    resumenDesempeno: resumen
      ? { vendedorId: resumen.vendedor_id, generadoAt: resumen.generado_at, fortalezas: resumen.fortalezas, mejoras: resumen.mejoras }
      : { vendedorId: null, generadoAt: new Date().toISOString(), fortalezas: [], mejoras: [] },
    configuracion: cfg,
  };
}

// ---------------------------------------------------------------------------
// Escritura. En modo demo no hacen nada (el estado vive en memoria).
// ---------------------------------------------------------------------------

const enSupabase =
  fn =>
  (...args) =>
    usaSupabase ? fn(...args) : Promise.resolve();

export const eliminarConversacion = enSupabase(async conversacionId =>
  ok(await supabase.rpc('nc_eliminar_conversacion', { p_conversacion_id: conversacionId })),
);

export const cambiarEstado = enSupabase(async (conversacionId, estadoId) =>
  ok(await supabase.rpc('nc_cambiar_estado', { p_conversacion_id: conversacionId, p_estado_id: estadoId })),
);

export const marcarInterna = enSupabase(async (conversacionId, interna) =>
  ok(await supabase.from('nc_conversaciones').update({ interna }).eq('id', conversacionId)),
);

export const crearAnalisis = enSupabase(async a =>
  ok(
    await supabase.from('nc_analisis').insert({
      id: a.id,
      conversacion_id: a.conversacionId,
      resumen: a.resumen,
      intencion: a.intencion,
      productos: a.productos,
      objeciones: a.objeciones,
      proximo_paso: a.proximoPaso,
      puntajes: a.puntajes,
      motivo: 'manual',
      solicitado_por: a.solicitadoPor,
    }),
  ),
);

export const crearNota = enSupabase(async n =>
  ok(await supabase.from('nc_notas').insert({ id: n.id, conversacion_id: n.conversacionId, autor_id: n.autorId, texto: n.texto })),
);

export const atenderAlerta = enSupabase(async (id, usuarioId, comentario) =>
  ok(
    await supabase
      .from('nc_alertas')
      .update({ estado: 'atendida', atendida_por: usuarioId, atendida_at: new Date().toISOString(), comentario })
      .eq('id', id),
  ),
);

export const guardarConfiguracion = enSupabase(async (configuracion, usuarioId) => {
  const ahora = new Date().toISOString();
  const publicas = [],
    secretas = [];
  Object.entries(SECRETOS).forEach(([seccion, claves]) => {
    const valores = { ...(configuracion[seccion] || {}) };
    delete valores.webhookUrl; // se calcula al cargar; no se guarda
    const sec = {};
    claves.forEach(k => {
      sec[k] = valores[k] ?? '';
      delete valores[k];
    });
    publicas.push({ seccion, valores, actualizado_at: ahora, actualizado_por: usuarioId });
    if (claves.length) secretas.push({ seccion, valores: sec, actualizado_at: ahora });
  });
  ok(await supabase.from('nc_configuracion').upsert(publicas));
  ok(await supabase.from('nc_credenciales').upsert(secretas));
});

export const guardarEstadoVenta = enSupabase(async e =>
  ok(await supabase.from('nc_estados_venta').upsert({ id: e.id, nombre: e.nombre, color: e.color, orden: e.orden, activo: e.activo })),
);

export const guardarEstadosVenta = enSupabase(async estados =>
  ok(
    await supabase
      .from('nc_estados_venta')
      .upsert(estados.map(e => ({ id: e.id, nombre: e.nombre, color: e.color, orden: e.orden, activo: e.activo }))),
  ),
);

export const eliminarEstadoVenta = enSupabase(async id => ok(await supabase.from('nc_estados_venta').delete().eq('id', id)));

export const guardarUsuario = enSupabase(async u =>
  ok(await supabase.from('nc_usuarios').upsert({ id: u.id, nombre: u.nombre, email: u.email, rol: u.rol, activo: u.activo })),
);

export const eliminarUsuario = enSupabase(async id => ok(await supabase.from('nc_usuarios').delete().eq('id', id)));

// Analiza una conversación con IA (Edge Function nc-analizar: Groq y, si falla, Claude).
// Devuelve { ok, modelo, respaldo, motivoRespaldo, estadoCambiado, alertasNuevas } o { ok: false, mensaje, limiteGroq }.
// Con soloGroq no pasa a Claude si Groq falla (la cola pregunta antes de gastar en Claude).
export async function analizarConversacion(conversacionId, { soloGroq = false } = {}) {
  const { data, error } = await supabase.functions.invoke('nc-analizar', { body: { conversacionId, soloGroq } });
  if (error) {
    const cuerpo = await error.context?.json?.().catch(() => null);
    throw new Error(cuerpo?.error || cuerpo?.mensaje || 'No se pudo analizar la conversación.');
  }
  return data;
}

// Consulta Evolution API a través de la Edge Function nc-evolution (solo admin).
// accion: 'estado' | 'qr'. Devuelve { ok, estado?, mensaje?, qr? }.
export async function consultarEvolution(accion, parametros = {}) {
  const { data, error } = await supabase.functions.invoke('nc-evolution', { body: { accion, ...parametros } });
  if (error) {
    const cuerpo = await error.context?.json?.().catch(() => null);
    throw new Error(cuerpo?.error || cuerpo?.mensaje || 'No se pudo consultar Evolution API.');
  }
  return data;
}

// ---------------------------------------------------------------------------
// Realtime: avisa cada cambio de las tablas nc_* ya convertido al formato de la app.
// onCambio({ clave, tipo: 'INSERT' | 'UPDATE' | 'DELETE', fila, id })
//   - clave 'configuracion': fila = { seccion, valores } (sin secretos).
//   - en DELETE solo llega la clave primaria (id).
// onEstado(estado): 'SUBSCRIBED', 'CHANNEL_ERROR', 'TIMED_OUT' o 'CLOSED'.
// Devuelve una función para cancelar la suscripción. En modo demo no hace nada.
// ---------------------------------------------------------------------------
export function suscribirCambios(onCambio, onEstado) {
  if (!usaSupabase) return () => {};
  let canal = supabase.channel('nc-cambios');
  const tablas = [...Object.keys(FILAS), 'nc_configuracion'];
  tablas.forEach(tabla => {
    canal = canal.on('postgres_changes', { event: '*', schema: 'public', table: tabla }, payload => {
      const tipo = payload.eventType;
      if (tabla === 'nc_configuracion') {
        const fila = tipo === 'DELETE' ? null : { seccion: payload.new.seccion, valores: payload.new.valores };
        return onCambio({ clave: 'configuracion', tipo, fila, id: payload.old?.seccion });
      }
      const { clave, mapear } = FILAS[tabla];
      onCambio({ clave, tipo, fila: tipo === 'DELETE' ? null : mapear(payload.new), id: payload.old?.id ?? payload.new?.id });
    });
  });
  canal.subscribe(estado => onEstado?.(estado));
  return () => supabase.removeChannel(canal);
}
