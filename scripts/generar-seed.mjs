// Genera supabase/seed.sql a partir de src/data/mockData.js.
// Uso: node scripts/generar-seed.mjs
// Las fechas quedan relativas a now(), así la demo siempre se ve "en vivo".
import { writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { createMockData } from '../src/data/mockData.js';

const db = createMockData();
const AHORA = new Date(db.ahora).getTime();

const ids = new Map();
const uid = id => (id == null ? null : ids.get(id) ?? ids.set(id, randomUUID()).get(id));

const q = v => {
  if (v == null) return 'null';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.length ? 'array[' + v.map(q).join(', ') + ']' : "'{}'::text[]";
  if (typeof v === 'object') return q(JSON.stringify(v)) + '::jsonb';
  return "'" + String(v).replace(/'/g, "''") + "'";
};
const ts = iso => {
  const min = Math.round((AHORA - new Date(iso).getTime()) / 60000);
  return `now() - interval '${min} minutes'`;
};
const fecha = f => {
  const dias = Math.round((new Date(db.ahora.slice(0, 10)).getTime() - new Date(f).getTime()) / 864e5);
  return `(now() at time zone 'America/Argentina/Buenos_Aires')::date - ${dias}`;
};
const insert = (tabla, cols, rows) =>
  rows.length ? `insert into public.${tabla} (${cols.join(', ')}) values\n  ${rows.map(r => '(' + r.join(', ') + ')').join(',\n  ')};\n` : '';

const SECRETOS = { whatsapp: ['apiKey'], instagram: ['appSecret', 'accessToken', 'verifyToken'], ia: ['apiKey'], alertas: [] };

let sql = `-- Datos de demostración de Nort Monitor (generado por scripts/generar-seed.mjs).
-- Las credenciales se cargan vacías: completalas desde Configuración en la app.

`;
sql += insert('nc_usuarios', ['id', 'nombre', 'email', 'rol', 'activo', 'creado_at'],
  db.usuarios.map(u => [q(uid(u.id)), q(u.nombre), q(u.email), q(u.rol), q(u.activo), ts(u.creadoAt)]));
sql += insert('nc_canales', ['id', 'nombre', 'proveedor', 'identificador'],
  db.canales.map(c => [q(c.id), q(c.nombre), q(c.proveedor), q(c.identificador)]));
sql += insert('nc_estados_venta', ['id', 'nombre', 'color', 'orden', 'activo'],
  db.estadosVenta.map(e => [q(e.id), q(e.nombre), q(e.color), q(e.orden), q(e.activo)]));
sql += insert('nc_clientes', ['id', 'canal_id', 'nombre', 'usuario', 'empresa'],
  db.clientes.map(c => [q(uid(c.id)), q(c.canalId), q(c.nombre), q(c.usuario), q(c.empresa)]));
sql += insert('nc_conversaciones', ['id', 'cliente_id', 'canal_id', 'vendedor_id', 'estado_id', 'creada_at'],
  db.conversaciones.map(c => [q(uid(c.id)), q(uid(c.clienteId)), q(c.canalId), q(uid(c.vendedorId)), q(c.estadoId), ts(c.creadaAt)]));
sql += insert('nc_mensajes', ['id', 'conversacion_id', 'autor', 'texto', 'enviado_at'],
  db.mensajes.map(m => [q(uid(m.id)), q(uid(m.conversacionId)), q(m.autor), q(m.texto), ts(m.enviadoAt)]));
sql += insert('nc_historial_estados', ['id', 'conversacion_id', 'estado_id', 'origen', 'cambiado_por', 'creado_at'],
  db.historialEstados.map(h => [q(uid(h.id)), q(uid(h.conversacionId)), q(h.estadoId), q(h.origen), q(uid(h.cambiadoPor)), ts(h.creadoAt)]));
sql += insert('nc_analisis', ['id', 'conversacion_id', 'resumen', 'intencion', 'productos', 'objeciones', 'proximo_paso', 'puntajes', 'motivo', 'solicitado_por', 'creado_at'],
  db.analisis.map(a => [q(uid(a.id)), q(uid(a.conversacionId)), q(a.resumen), q(a.intencion), q(a.productos), q(a.objeciones), q(a.proximoPaso), q(a.puntajes), q(a.motivo), q(uid(a.solicitadoPor)), ts(a.creadoAt)]));
sql += insert('nc_alertas', ['id', 'conversacion_id', 'tipo', 'situacion_id', 'nivel', 'titulo', 'motivo', 'fragmento', 'estado', 'creada_at', 'atendida_por', 'atendida_at', 'comentario'],
  db.alertas.map(a => [q(uid(a.id)), q(uid(a.conversacionId)), q(a.tipo), q(a.situacionId), q(a.nivel), q(a.titulo), q(a.motivo), q(a.fragmento), q(a.estado), ts(a.creadaAt), q(uid(a.atendidaPor)), a.atendidaAt ? ts(a.atendidaAt) : 'null', q(a.comentario)]));
sql += insert('nc_notas', ['id', 'conversacion_id', 'autor_id', 'texto', 'creado_at'],
  db.notas.map(n => [q(uid(n.id)), q(uid(n.conversacionId)), q(uid(n.autorId)), q(n.texto), ts(n.creadoAt)]));
sql += insert('nc_metricas_diarias', ['fecha', 'canal_id', 'puntaje', 'tiempo_respuesta_min', 'conversaciones', 'ganadas'],
  db.metricasDiarias.map(m => [fecha(m.fecha), q(m.canalId), q(m.puntaje), q(m.tiempoRespuestaMin), q(m.conversaciones), q(m.ganadas)]));
const r = db.resumenDesempeno;
sql += insert('nc_resumen_desempeno', ['vendedor_id', 'fortalezas', 'mejoras', 'generado_at'],
  [[q(uid(r.vendedorId)), q(r.fortalezas), q(r.mejoras), ts(r.generadoAt)]]);

const cfg = Object.entries(db.configuracion).map(([seccion, valores]) => {
  const v = { ...valores };
  delete v.estado; // el estado de conexión arranca en "desconectado" hasta probar credenciales
  delete v.verificadoAt;
  SECRETOS[seccion].forEach(k => delete v[k]);
  if (seccion === 'whatsapp') delete v.webhookUrl; // la app la arma con el token de nc_credenciales
  if (seccion === 'whatsapp' || seccion === 'instagram') v.estado = 'desconectado';
  return [q(seccion), q(v)];
});
sql += insert('nc_configuracion', ['seccion', 'valores'], cfg);
sql += insert('nc_credenciales', ['seccion', 'valores'],
  Object.entries(SECRETOS).filter(([, ks]) => ks.length).map(([s, ks]) => [q(s), q(Object.fromEntries(ks.map(k => [k, ''])))]));

writeFileSync(new URL('../supabase/seed.sql', import.meta.url), sql);
console.log('supabase/seed.sql generado');
