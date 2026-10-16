// Nort Monitor · consulta a Evolution API desde la app (solo administradores).
// Acciones:
//   { accion: 'estado' }   → estado de la instancia y de su webhook.
//   { accion: 'qr' }       → código QR para vincular.
//   { accion: 'webhook' }  → configura en Evolution el webhook de la instancia apuntando a nc-webhook-evolution.
//   { accion: 'importar', desde: 'AAAA-MM-DD', pagina } → importa una página del historial de mensajes.
//   { accion: 'transcribir' } → transcribe un lote de audios de la cola (respeta el límite de Groq).
// Usa la configuración guardada (nc_configuracion / nc_credenciales), nunca valores enviados por el navegador.
import { cargarContexto, db, guardarMensaje, LimiteGroq, segundosDe, SUPABASE_URL, transcribirAudio } from '../_shared/whatsapp.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const ESTADOS: Record<string, string> = { open: 'conectado', connecting: 'esperando_qr', close: 'desconectado' };
const EVENTOS_WEBHOOK = ['MESSAGES_UPSERT', 'CONNECTION_UPDATE'];
const POR_PAGINA = 100;
const EN_PARALELO = 10;
const AUDIOS_POR_LOTE = 6;
const PAUSA_GROQ_MS = 3200; // ~18 por minuto: debajo del límite gratuito de Groq (20 por minuto)

const dormir = (ms: number) => new Promise(r => setTimeout(r, ms));

async function esAdmin(req: Request): Promise<boolean> {
  const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!jwt) return false;
  const { data, error } = await db.auth.getUser(jwt);
  if (error || !data.user) return false;
  const { data: u } = await db.from('nc_usuarios').select('rol, activo').eq('auth_user_id', data.user.id).maybeSingle();
  return !!u && u.activo && u.rol === 'admin';
}

async function evolution(serverUrl: string, apiKey: string, ruta: string, cuerpoEnvio?: unknown, timeoutMs = 10000) {
  const res = await fetch(serverUrl.replace(/\/+$/, '') + ruta, {
    method: cuerpoEnvio ? 'POST' : 'GET',
    headers: { apikey: apiKey, ...(cuerpoEnvio ? { 'Content-Type': 'application/json' } : {}) },
    body: cuerpoEnvio ? JSON.stringify(cuerpoEnvio) : undefined,
    signal: AbortSignal.timeout(timeoutMs),
  });
  const cuerpo = await res.json().catch(() => ({}));
  return { status: res.status, cuerpo };
}

async function guardarEstado(cfg: Record<string, any>, estado: string) {
  await db
    .from('nc_configuracion')
    .update({ valores: { ...cfg, estado, verificadoAt: new Date().toISOString() }, actualizado_at: new Date().toISOString() })
    .eq('seccion', 'whatsapp');
}

// Lee el webhook que tiene la instancia en Evolution y explica si apunta a esta app.
async function revisarWebhook(serverUrl: string, apiKey: string, inst: string, nuestraUrl: string) {
  const { status, cuerpo } = await evolution(serverUrl, apiKey, `/webhook/find/${inst}`);
  const w = cuerpo?.webhook ?? cuerpo ?? {};
  const url: string = w.url ?? '';
  const eventos: string[] = Array.isArray(w.events) ? w.events : [];
  const porEventos = !!(w.byEvents ?? w.webhookByEvents);
  let problema = '';
  if (status >= 400 || !url) problema = 'no tiene webhook configurado';
  else if (url !== nuestraUrl) {
    let host = url;
    try {
      host = new URL(url).host;
    } catch {
      // URL inválida: se muestra tal cual
    }
    problema = `envía los mensajes a otra dirección (${host})`;
  } else if (w.enabled === false) problema = 'está desactivado';
  else if (porEventos) problema = 'tiene activado "Webhook by Events"';
  else if (!eventos.includes('MESSAGES_UPSERT')) problema = 'no tiene marcado el evento MESSAGES_UPSERT';
  return { ok: !problema, texto: problema ? `El webhook ${problema}.` : 'El webhook apunta a esta app y está bien configurado.' };
}

async function audiosPendientes() {
  const { count } = await db.from('nc_mensajes').select('id', { count: 'exact', head: true }).not('audio_pendiente', 'is', null);
  return count ?? 0;
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'método no permitido' }, 405);
  if (!(await esAdmin(req))) return json({ error: 'Solo un administrador puede hacer esto.' }, 403);

  const { accion, desde, pagina } = await req.json().catch(() => ({}));
  const { cfg, ctx, webhookToken } = await cargarContexto();
  const { serverUrl, instancia, evoKey: apiKey } = ctx;
  if (!/^https?:\/\//.test(serverUrl) || !instancia || !apiKey) {
    return json({ ok: false, mensaje: 'Faltan datos: completá y guardá la URL del servidor, la API Key y el nombre de la instancia.' });
  }
  const inst = encodeURIComponent(instancia);
  const nuestraUrl = `${SUPABASE_URL}/functions/v1/nc-webhook-evolution?token=${webhookToken}`;
  const t0 = Date.now();

  try {
    if (accion === 'estado') {
      const { status, cuerpo } = await evolution(serverUrl, apiKey, `/instance/connectionState/${inst}`);
      if (status === 401 || status === 403) return json({ ok: false, mensaje: 'Evolution rechazó la API Key.' });
      if (status === 404) return json({ ok: false, mensaje: `No existe la instancia "${instancia}" en ese servidor.` });
      const state = cuerpo?.instance?.state ?? cuerpo?.state;
      const estado = ESTADOS[state];
      if (!estado) return json({ ok: false, mensaje: `Respuesta inesperada de Evolution (HTTP ${status}).` });
      await guardarEstado(cfg, estado);
      const ms = Date.now() - t0;
      const detalle =
        estado === 'conectado' ? 'conectada' : estado === 'esperando_qr' ? 'esperando que se escanee el QR' : 'desconectada: generá el QR para vincularla';
      const wh = await revisarWebhook(serverUrl, apiKey, inst, nuestraUrl);
      return json({
        ok: estado === 'conectado' && wh.ok,
        estado,
        webhookOk: wh.ok,
        mensaje: `La instancia "${instancia}" respondió en ${ms} ms y está ${detalle}. ${wh.texto}`,
      });
    }

    if (accion === 'qr') {
      const { status, cuerpo } = await evolution(serverUrl, apiKey, `/instance/connect/${inst}`);
      if (status === 401 || status === 403) return json({ ok: false, mensaje: 'Evolution rechazó la API Key.' });
      if (status === 404) return json({ ok: false, mensaje: `No existe la instancia "${instancia}" en ese servidor.` });
      if (cuerpo?.instance?.state === 'open') {
        await guardarEstado(cfg, 'conectado');
        return json({ ok: true, estado: 'conectado', mensaje: 'La instancia ya está conectada.' });
      }
      if (!cuerpo?.base64) return json({ ok: false, mensaje: `Evolution no devolvió un QR (HTTP ${status}).` });
      await guardarEstado(cfg, 'esperando_qr');
      return json({ ok: true, estado: 'esperando_qr', qr: cuerpo.base64, codigo: cuerpo.pairingCode ?? null });
    }

    if (accion === 'webhook') {
      if (!webhookToken) return json({ ok: false, mensaje: 'Falta el token del webhook en la base.' });
      const { status, cuerpo } = await evolution(serverUrl, apiKey, `/webhook/set/${inst}`, {
        webhook: { enabled: true, url: nuestraUrl, byEvents: false, base64: false, events: EVENTOS_WEBHOOK },
      });
      if (status === 401 || status === 403) return json({ ok: false, mensaje: 'Evolution rechazó la API Key.' });
      if (status === 404) return json({ ok: false, mensaje: `No existe la instancia "${instancia}" en ese servidor.` });
      if (status >= 400) {
        const detalle = JSON.stringify(cuerpo?.response?.message ?? cuerpo?.message ?? cuerpo).slice(0, 200);
        return json({ ok: false, mensaje: `Evolution no aceptó la configuración (HTTP ${status}): ${detalle}` });
      }
      const wh = await revisarWebhook(serverUrl, apiKey, inst, nuestraUrl);
      return json({
        ok: wh.ok,
        webhookOk: wh.ok,
        mensaje: wh.ok
          ? `Webhook configurado en "${instancia}" con MESSAGES_UPSERT y CONNECTION_UPDATE. Mandá un mensaje de prueba.`
          : `Evolution respondió, pero al verificar: ${wh.texto}`,
      });
    }

    if (accion === 'importar') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(desde ?? ''))) return json({ ok: false, mensaje: 'Fecha "desde" inválida.' });
      const pag = Math.max(1, Number(pagina) || 1);
      const corte = Math.floor(Date.parse(`${desde}T00:00:00-03:00`) / 1000);
      const { status, cuerpo } = await evolution(
        serverUrl,
        apiKey,
        `/chat/findMessages/${inst}`,
        {
          where: { messageTimestamp: { gte: new Date(corte * 1000).toISOString(), lte: new Date().toISOString() } },
          page: pag,
          offset: POR_PAGINA,
        },
        30000,
      );
      if (status >= 400) {
        console.log(`importar p${pag}: Evolution HTTP ${status} ${JSON.stringify(cuerpo).slice(0, 300)}`);
        return json({ ok: false, mensaje: `Evolution no devolvió el historial (HTTP ${status}): ${JSON.stringify(cuerpo).slice(0, 200)}` });
      }
      const sobre = cuerpo?.messages ?? cuerpo;
      const registros: Record<string, any>[] = Array.isArray(sobre?.records) ? sobre.records : Array.isArray(sobre) ? sobre : [];
      if (!registros.length && pag === 1 && !Array.isArray(sobre?.records) && !Array.isArray(sobre)) {
        console.log(`importar p1: formato no reconocido ${JSON.stringify(cuerpo).slice(0, 300)}`);
        return json({ ok: false, mensaje: `Formato de historial no reconocido. Evolution respondió con: ${Object.keys(cuerpo ?? {}).join(', ') || '(vacío)'}` });
      }
      const paginas = Number(sobre?.pages) || null;
      const total = Number(sobre?.total) || null;

      let guardados = 0, repetidos = 0, ignorados = 0, viejos = 0, audios = 0;
      // Por si el servidor ignora el filtro de fecha.
      const vigentes = registros.filter(r => segundosDe(r.messageTimestamp) >= corte);
      viejos = registros.length - vigentes.length;
      // De a varios en paralelo: guardarMensaje tolera guardados simultáneos del mismo cliente (upserts + índices únicos).
      for (let i = 0; i < vigentes.length; i += EN_PARALELO) {
        const resultados = await Promise.all(vigentes.slice(i, i + EN_PARALELO).map(r => guardarMensaje(r, cfg)));
        for (const g of resultados) {
          if (g.resultado === 'guardado') guardados++;
          else if (g.resultado === 'repetido') repetidos++;
          else ignorados++;
          if (g.audio) audios++;
        }
      }
      // Si toda la página es anterior a la fecha y viene de más nuevo a más viejo, ya no hay más para traer.
      const ts = registros.map(r => segundosDe(r.messageTimestamp));
      const descendente = ts.length > 1 && ts[0] >= ts[ts.length - 1];
      const terminado = !registros.length || (paginas !== null && pag >= paginas) || (viejos === registros.length && descendente);
      const f = (s?: number) => (s ? new Date(s * 1000).toISOString().slice(0, 16) : '-');
      console.log(
        `importar p${pag}/${paginas ?? '?'} total=${total ?? '?'} claves=[${Object.keys(cuerpo ?? {}).join(',')}] recibidos=${registros.length} ` +
          `rango=${f(ts.reduce((a, b) => (b && (!a || b < a) ? b : a), 0))}..${f(ts.reduce((a, b) => (b > a ? b : a), 0))} guardados=${guardados} repetidos=${repetidos} ignorados=${ignorados} ` +
          `viejos=${viejos} audios=${audios} ${Date.now() - t0}ms` +
          (registros[0] ? ` ejemplo: ${Object.keys(registros[0]).join(',')}` : ''),
      );
      return json({ ok: true, pagina: pag, paginas, total, recibidos: registros.length, guardados, repetidos, ignorados, viejos, audios, terminado });
    }

    if (accion === 'transcribir') {
      if (!ctx.groqKey) return json({ ok: false, mensaje: 'Falta la API Key de Groq (Configuración › Análisis con IA).' });
      const { data: lote } = await db
        .from('nc_mensajes')
        .select('id')
        .not('audio_pendiente', 'is', null)
        .order('enviado_at', { ascending: false })
        .limit(AUDIOS_POR_LOTE);
      let transcritos = 0, fallidos = 0;
      for (const [i, fila] of (lote ?? []).entries()) {
        if (i > 0) await dormir(PAUSA_GROQ_MS);
        try {
          const r = await transcribirAudio(fila.id, ctx);
          if (r === 'transcrito') transcritos++;
          else if (r === 'fallido') fallidos++;
        } catch (e) {
          if (e instanceof LimiteGroq) {
            return json({ ok: true, transcritos, fallidos, pendientes: await audiosPendientes(), esperar: 60 });
          }
          throw e;
        }
      }
      return json({ ok: true, transcritos, fallidos, pendientes: await audiosPendientes() });
    }

    return json({ error: 'acción desconocida' }, 400);
  } catch (e) {
    const timeout = e instanceof DOMException && e.name === 'TimeoutError';
    console.error('nc-evolution', accion, e);
    return json({ ok: false, mensaje: timeout ? 'Evolution no respondió a tiempo.' : `Error: ${e instanceof Error ? e.message : String(e)}` });
  }
});
