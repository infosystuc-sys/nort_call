// Nort Monitor · lógica compartida para guardar mensajes de WhatsApp (Evolution API) en las tablas nc_*
// y transcribir audios con Whisper (Groq). La usan nc-webhook-evolution (mensajes en vivo) y
// nc-evolution (importación de historial y cola de transcripción).
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2.118.0';

const SECRET_KEY = (() => {
  try {
    return JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}').default;
  } catch {
    return undefined;
  }
})() ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

export const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
// Cliente con la clave secreta: ignora RLS. Solo para uso dentro de las Edge Functions.
export const db: SupabaseClient = createClient(SUPABASE_URL, SECRET_KEY, { auth: { persistSession: false } });

export type Contexto = { serverUrl: string; instancia: string; evoKey: string; groqKey: string };

// Error de límite de uso de Groq: hay que esperar antes de seguir transcribiendo.
export class LimiteGroq extends Error {}

const MAX_INTENTOS = 3;

// Mensaje real dentro de los envoltorios de WhatsApp (efímeros, ver una vez, etc.).
export function interior(m: Record<string, any> | undefined): Record<string, any> | undefined {
  const sobre = m?.ephemeralMessage ?? m?.viewOnceMessage ?? m?.viewOnceMessageV2 ?? m?.documentWithCaptionMessage;
  return sobre?.message ? interior(sobre.message) : m;
}

// Texto legible de un mensaje de WhatsApp (Baileys). Los adjuntos no se descargan: solo se registra su tipo.
export function textoDe(m: Record<string, any> | undefined): string | null {
  if (!m) return null;
  if (m.ephemeralMessage?.message) return textoDe(m.ephemeralMessage.message);
  if (m.viewOnceMessage?.message) return textoDe(m.viewOnceMessage.message);
  if (m.viewOnceMessageV2?.message) return textoDe(m.viewOnceMessageV2.message);
  if (m.documentWithCaptionMessage?.message) return textoDe(m.documentWithCaptionMessage.message);
  if (m.editedMessage?.message) return textoDe(m.editedMessage.message);
  if (typeof m.conversation === 'string') return m.conversation;
  if (m.extendedTextMessage?.text) return m.extendedTextMessage.text;
  const adj = (etiqueta: string, caption?: string) => (caption ? `[${etiqueta}] ${caption}` : `[${etiqueta}]`);
  if (m.imageMessage) return adj('Imagen', m.imageMessage.caption);
  if (m.videoMessage) return adj('Video', m.videoMessage.caption);
  if (m.audioMessage) return '[Audio]';
  if (m.documentMessage) return adj('Documento', m.documentMessage.caption || m.documentMessage.fileName);
  if (m.stickerMessage) return '[Sticker]';
  if (m.locationMessage) return '[Ubicación]';
  if (m.contactMessage || m.contactsArrayMessage) return '[Contacto]';
  if (m.buttonsResponseMessage?.selectedDisplayText) return m.buttonsResponseMessage.selectedDisplayText;
  if (m.listResponseMessage?.title) return m.listResponseMessage.title;
  return null; // reacciones, mensajes de protocolo, etc.
}

export function segundosDe(ts: unknown): number {
  const n = typeof ts === 'object' && ts !== null ? Number((ts as any).low) : Number(ts);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function fecha(ts: unknown): string {
  const n = segundosDe(ts);
  return n ? new Date(n * 1000).toISOString() : new Date().toISOString();
}

// Identificador del contacto. Con el formato @lid de WhatsApp el número real viene en remoteJidAlt / senderPn;
// si no viene, se usa el propio identificador "lid:..." para no perder el mensaje.
export function telefonoDe(data: Record<string, any>): string | null {
  const key = data.key ?? {};
  let jid: string = key.remoteJid ?? '';
  if (jid.endsWith('@lid')) {
    const alt: string = key.remoteJidAlt ?? key.senderPn ?? data.senderPn ?? '';
    if (!alt.endsWith('@s.whatsapp.net')) return 'lid:' + jid.split('@')[0];
    jid = alt;
  }
  if (!jid.endsWith('@s.whatsapp.net')) return null; // grupos, estados, canales
  const digitos = jid.split('@')[0].replace(/\D/g, '');
  return digitos ? '+' + digitos : null;
}

// Resumen sin contenido de un mensaje, para diagnóstico en los logs.
export function resumen(data: Record<string, any> | undefined) {
  const k = data?.key ?? {};
  const tipoJid = String(k.remoteJid ?? '').split('@')[1] ?? '?';
  const tipoMsg = Object.keys(interior(data?.message) ?? {})[0] ?? 'sin message';
  return `jid=@${tipoJid} alt=${k.remoteJidAlt ? 'sí' : 'no'} fromMe=${!!k.fromMe} tipo=${tipoMsg}`;
}

async function vendedorPorDefecto(cfg: Record<string, any>): Promise<string | null> {
  if (cfg.vendedorId) return cfg.vendedorId;
  const { data } = await db.from('nc_usuarios').select('id').eq('rol', 'vendedor').eq('activo', true).limit(2);
  return data && data.length === 1 ? data[0].id : null;
}

async function estadoInicial(): Promise<string> {
  const { data } = await db.from('nc_estados_venta').select('id').eq('activo', true).order('orden').limit(1);
  return data?.[0]?.id ?? 'nuevo';
}

export type Guardado = { resultado: 'guardado' | 'repetido' | 'ignorado'; mensajeId?: string; audio?: boolean };

// Guarda un mensaje (formato Baileys/Evolution). Crea cliente y conversación si no existen.
// Los audios nuevos quedan en la cola de transcripción (audio_pendiente).
export async function guardarMensaje(data: Record<string, any>, cfg: Record<string, any>): Promise<Guardado> {
  const telefono = telefonoDe(data);
  const texto = textoDe(data.message);
  const idExterno: string | undefined = data.key?.id;
  if (!telefono || !texto || !idExterno) return { resultado: 'ignorado' };
  const deVendedor = !!data.key?.fromMe;
  const pushName = !deVendedor && typeof data.pushName === 'string' && data.pushName.trim() ? data.pushName.trim() : null;
  const esAudio = !!interior(data.message)?.audioMessage;

  await db
    .from('nc_clientes')
    .upsert({ canal_id: 'whatsapp', usuario: telefono, nombre: pushName ?? telefono }, { onConflict: 'canal_id,usuario', ignoreDuplicates: true });
  const { data: cliente, error: e1 } = await db
    .from('nc_clientes')
    .select('id, nombre')
    .eq('canal_id', 'whatsapp')
    .eq('usuario', telefono)
    .single();
  if (e1 || !cliente) throw e1 ?? new Error('cliente no encontrado');
  if (pushName && cliente.nombre === telefono) await db.from('nc_clientes').update({ nombre: pushName }).eq('id', cliente.id);

  // Una conversación por cliente (índice único): si dos mensajes llegan a la vez, el segundo insert no hace nada.
  let { data: conv } = await db.from('nc_conversaciones').select('id').eq('cliente_id', cliente.id).maybeSingle();
  if (!conv) {
    const { error: e2 } = await db
      .from('nc_conversaciones')
      .upsert(
        { cliente_id: cliente.id, canal_id: 'whatsapp', vendedor_id: await vendedorPorDefecto(cfg), estado_id: await estadoInicial() },
        { onConflict: 'cliente_id', ignoreDuplicates: true },
      );
    if (e2) throw e2;
    ({ data: conv } = await db.from('nc_conversaciones').select('id').eq('cliente_id', cliente.id).single());
    if (!conv) throw new Error('conversación no encontrada');
  }

  const { data: insertados, error: e3 } = await db
    .from('nc_mensajes')
    .upsert(
      {
        conversacion_id: conv!.id,
        autor: deVendedor ? 'vendedor' : 'cliente',
        texto,
        enviado_at: fecha(data.messageTimestamp),
        id_externo: idExterno,
        audio_pendiente: esAudio ? { key: data.key, intentos: 0 } : null,
      },
      { onConflict: 'id_externo', ignoreDuplicates: true },
    )
    .select('id');
  if (e3) throw e3;
  const nuevo = insertados?.[0];
  return nuevo ? { resultado: 'guardado', mensajeId: nuevo.id, audio: esAudio } : { resultado: 'repetido' };
}

// Transcribe un audio de la cola. Si se pasa `datos` (el mensaje completo del webhook) se usa directamente,
// incluido el audio en Base64 si Evolution lo envía; si no, se le pide el audio a Evolution por su clave.
// Lanza LimiteGroq si Groq pide esperar; otros errores cuentan como intento fallido.
export async function transcribirAudio(mensajeId: string, ctx: Contexto, datos?: Record<string, any>) {
  const { data: fila } = await db.from('nc_mensajes').select('audio_pendiente').eq('id', mensajeId).maybeSingle();
  const pendiente = fila?.audio_pendiente;
  if (!pendiente) return 'ya transcrito';
  try {
    const audio = interior(datos?.message)?.audioMessage ?? {};
    let base64: string | undefined = datos?.message?.base64;
    if (!base64) {
      const res = await fetch(`${ctx.serverUrl.replace(/\/+$/, '')}/chat/getBase64FromMediaMessage/${encodeURIComponent(ctx.instancia)}`, {
        method: 'POST',
        headers: { apikey: ctx.evoKey, 'Content-Type': 'application/json' },
        // Con el mensaje completo Evolution no necesita buscarlo; con solo la clave lo busca en su base.
        body: JSON.stringify({ message: datos?.message ? { key: datos.key, message: datos.message } : { key: pendiente.key }, convertToMp4: false }),
        signal: AbortSignal.timeout(20000),
      });
      const cuerpo = await res.json().catch(() => ({}));
      if (!res.ok || !cuerpo?.base64) throw new Error(`Evolution no entregó el audio (HTTP ${res.status}): ${JSON.stringify(cuerpo).slice(0, 200)}`);
      base64 = cuerpo.base64;
    }
    const bytes = Uint8Array.from(atob(base64!.replace(/^data:[^,]*,/, '')), c => c.charCodeAt(0));
    const tipo = String(audio.mimetype ?? 'audio/ogg').split(';')[0];
    const ext = tipo.includes('mpeg') ? 'mp3' : tipo.includes('mp4') ? 'm4a' : tipo.includes('wav') ? 'wav' : 'ogg';

    const form = new FormData();
    form.append('file', new Blob([bytes], { type: tipo }), `audio.${ext}`);
    form.append('model', 'whisper-large-v3');
    form.append('language', 'es');
    form.append('response_format', 'json');
    form.append('temperature', '0');
    const r = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${ctx.groqKey}` },
      body: form,
      signal: AbortSignal.timeout(60000),
    });
    const out = await r.json().catch(() => ({}));
    if (r.status === 429) throw new LimiteGroq('Groq pidió esperar (límite de uso).');
    if (!r.ok) throw new Error(`Groq respondió HTTP ${r.status}: ${JSON.stringify(out).slice(0, 200)}`);
    const texto = String(out.text ?? '').trim();
    await db
      .from('nc_mensajes')
      .update({ texto: texto ? `[Audio] ${texto}` : '[Audio] (sin voz reconocible)', audio_pendiente: null })
      .eq('id', mensajeId);
    return 'transcrito';
  } catch (e) {
    if (e instanceof LimiteGroq) throw e;
    const intentos = Number(pendiente.intentos ?? 0) + 1;
    console.error('transcripción', mensajeId, `intento ${intentos}`, e instanceof Error ? e.message : e);
    await db
      .from('nc_mensajes')
      .update(
        intentos >= MAX_INTENTOS
          ? { texto: '[Audio] (no se pudo transcribir)', audio_pendiente: null }
          : { audio_pendiente: { ...pendiente, intentos } },
      )
      .eq('id', mensajeId);
    return 'fallido';
  }
}

// Configuración de WhatsApp + credenciales necesarias para Evolution y Groq.
export async function cargarContexto(instanciaEvento?: string) {
  const [{ data: conf }, { data: cred }, { data: credIa }] = await Promise.all([
    db.from('nc_configuracion').select('valores').eq('seccion', 'whatsapp').maybeSingle(),
    db.from('nc_credenciales').select('valores').eq('seccion', 'whatsapp').maybeSingle(),
    db.from('nc_credenciales').select('valores').eq('seccion', 'ia').maybeSingle(),
  ]);
  const cfg = conf?.valores ?? {};
  const ctx: Contexto = {
    serverUrl: cfg.serverUrl ?? '',
    instancia: String(instanciaEvento ?? cfg.instancia ?? ''),
    evoKey: cred?.valores?.apiKey ?? '',
    groqKey: credIa?.valores?.groqApiKey ?? '',
  };
  return { cfg, ctx, webhookToken: (cred?.valores?.webhookToken ?? '') as string };
}
