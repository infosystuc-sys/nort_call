// Nort Monitor · receptor del webhook de Evolution API (eventos MESSAGES_UPSERT y CONNECTION_UPDATE).
// Evolution no envía JWT: la función se despliega con verify_jwt = false y se autoriza con
// ?token=..., que debe coincidir con nc_credenciales.whatsapp.webhookToken.
// Los audios nuevos se transcriben en segundo plano si hay API Key de Groq; si falla, quedan en la cola
// (nc_mensajes.audio_pendiente) para reintentar desde la app.
import { cargarContexto, db, guardarMensaje, resumen, transcribirAudio } from '../_shared/whatsapp.ts';

declare const EdgeRuntime: { waitUntil(p: Promise<unknown>): void };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

function iguales(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function actualizarConexion(data: Record<string, any>, cfg: Record<string, any>) {
  const estado = { open: 'conectado', connecting: 'esperando_qr', close: 'desconectado' }[String(data.state ?? '')];
  if (!estado) return;
  await db
    .from('nc_configuracion')
    .update({ valores: { ...cfg, estado, verificadoAt: new Date().toISOString() }, actualizado_at: new Date().toISOString() })
    .eq('seccion', 'whatsapp');
}

Deno.serve(async req => {
  if (req.method !== 'POST') return json({ ok: true, servicio: 'nc-webhook-evolution' });

  const body = await req.json().catch(() => null);
  const { cfg, ctx, webhookToken } = await cargarContexto(body?.instance);
  const token = new URL(req.url).searchParams.get('token') ?? '';
  if (!webhookToken || !iguales(token, webhookToken)) return json({ error: 'token inválido' }, 401);
  if (!body) return json({ error: 'cuerpo inválido' }, 400);

  const evento = String(body.event ?? '').toLowerCase().replace(/_/g, '.');
  // Solo se procesan eventos de la instancia configurada en la app (sin distinguir mayúsculas).
  if (cfg.instancia && body.instance && String(body.instance).toLowerCase() !== String(cfg.instancia).toLowerCase()) {
    const numero = String(body.sender ?? '').split('@')[0] || '?';
    console.log(`evento ${evento} ignorado: instancia "${body.instance}" (número ${numero}) distinta de la configurada "${cfg.instancia}"`);
    return json({ ok: true, ignorado: 'otra instancia' });
  }
  try {
    if (evento === 'messages.upsert') {
      const items = Array.isArray(body.data) ? body.data : body.data?.messages ?? [body.data];
      const resultados = [];
      for (const item of items) {
        if (!item) continue;
        const g = await guardarMensaje(item, cfg);
        resultados.push(g.resultado);
        console.log(`messages.upsert ${g.resultado} · ${resumen(item)}`);
        if (g.audio && g.mensajeId && ctx.groqKey && (item.message?.base64 || (ctx.serverUrl && ctx.evoKey))) {
          EdgeRuntime.waitUntil(transcribirAudio(g.mensajeId, ctx, item).catch(e => console.error('transcripción', e?.message ?? e)));
        }
      }
      return json({ ok: true, resultados });
    }
    if (evento === 'connection.update') {
      await actualizarConexion(body.data ?? {}, cfg);
      return json({ ok: true });
    }
    console.log(`evento ignorado: ${evento || '(sin nombre)'} · instancia ${body.instance ?? '-'}`);
    return json({ ok: true, ignorado: evento });
  } catch (e) {
    console.error('nc-webhook-evolution', evento, e);
    return json({ error: 'no se pudo procesar el evento' }, 500);
  }
});
