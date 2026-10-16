// Nort Monitor · análisis de una conversación con IA.
// Primero intenta con Groq (openai/gpt-oss-120b); si Groq falla (límite de uso u otro error) usa Claude
// como respaldo, con la API Key de Anthropic de Configuración › Análisis con IA.
// Guarda el análisis en nc_analisis, sugiere el estado de venta (salvo que un usuario lo haya corregido a mano)
// y abre alertas para las situaciones activas que detecte.
// Lo puede pedir cualquier usuario activo que tenga acceso a la conversación ({ conversacionId }).
import Anthropic from 'npm:@anthropic-ai/sdk@0.135.0';
import { db } from '../_shared/whatsapp.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const MODELO_GROQ = 'openai/gpt-oss-120b';
const MODELOS_CLAUDE = ['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5'];
const MAX_MENSAJES = 200;
const CRITERIOS = ['respuesta', 'atencion', 'tecnica', 'seguimiento'] as const;
const TZ = 'America/Argentina/Buenos_Aires';

type Usuario = { id: string; rol: string; nombre: string };
type Resultado = {
  resumen: string;
  intencion: string;
  productos: string[];
  objeciones: string[];
  proximoPaso: string;
  puntajes: Record<(typeof CRITERIOS)[number], { puntaje: number | null; comentario: string }>;
  estadoSugerido: string;
  alertas: { situacionId: string; nivel: 'advertencia' | 'critico'; titulo: string; motivo: string; fragmento: string }[];
};

async function usuarioActual(req: Request): Promise<Usuario | null> {
  const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!jwt) return null;
  const { data, error } = await db.auth.getUser(jwt);
  if (error || !data.user) return null;
  const { data: u } = await db.from('nc_usuarios').select('id, rol, nombre, activo').eq('auth_user_id', data.user.id).maybeSingle();
  return u && u.activo ? { id: u.id, rol: u.rol, nombre: u.nombre } : null;
}

// Esquema de salida (vale para Groq y Claude: todas las propiedades requeridas, sin propiedades extra).
function esquema(estados: string[], situaciones: string[]) {
  const criterio = {
    type: 'object',
    properties: { puntaje: { type: ['integer', 'null'] }, comentario: { type: 'string' } },
    required: ['puntaje', 'comentario'],
    additionalProperties: false,
  };
  return {
    type: 'object',
    properties: {
      resumen: { type: 'string' },
      intencion: { type: 'string' },
      productos: { type: 'array', items: { type: 'string' } },
      objeciones: { type: 'array', items: { type: 'string' } },
      proximoPaso: { type: 'string' },
      puntajes: {
        type: 'object',
        properties: Object.fromEntries(CRITERIOS.map(c => [c, criterio])),
        required: [...CRITERIOS],
        additionalProperties: false,
      },
      estadoSugerido: { type: 'string', enum: estados },
      alertas: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            situacionId: { type: 'string', enum: situaciones.length ? situaciones : ['ninguna'] },
            nivel: { type: 'string', enum: ['advertencia', 'critico'] },
            titulo: { type: 'string' },
            motivo: { type: 'string' },
            fragmento: { type: 'string' },
          },
          required: ['situacionId', 'nivel', 'titulo', 'motivo', 'fragmento'],
          additionalProperties: false,
        },
      },
    },
    required: ['resumen', 'intencion', 'productos', 'objeciones', 'proximoPaso', 'puntajes', 'estadoSugerido', 'alertas'],
    additionalProperties: false,
  };
}

function hora(iso: string) {
  return new Date(iso).toLocaleString('es-AR', { timeZone: TZ, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
}

function instrucciones(estados: { id: string; nombre: string }[], situaciones: { id: string; nombre: string; descripcion: string }[]) {
  return [
    'Sos un supervisor de ventas de un comercio argentino que vende por WhatsApp. Analizás una conversación entre un cliente y un vendedor y devolvés el resultado en el formato JSON pedido, en español rioplatense.',
    'Los mensajes "[Audio] ..." son transcripciones automáticas de notas de voz; "[Imagen]", "[Documento]", etc. indican adjuntos que no podés ver.',
    '',
    'Qué completar:',
    '- resumen: 2 o 3 oraciones con lo que pasó en la conversación.',
    '- intencion: qué busca el cliente, en pocas palabras.',
    '- productos: productos o servicios mencionados (vacío si no hay).',
    '- objeciones: dudas o frenos del cliente para comprar (vacío si no hay).',
    '- proximoPaso: la acción concreta que debería hacer el vendedor ahora.',
    '- puntajes del vendedor, de 1 a 10, con un comentario breve que lo justifique:',
    '  · respuesta: rapidez con que respondió (mirá las horas de los mensajes).',
    '  · atencion: amabilidad, claridad y tono.',
    '  · tecnica: técnica de venta (detectar la necesidad, informar precio y condiciones, ofrecer alternativas, intentar el cierre).',
    '  · seguimiento: si retomó la conversación o dejó al cliente sin respuesta.',
    '  Si un criterio no se puede evaluar (por ejemplo, el vendedor todavía no respondió), usá puntaje null y explicalo en el comentario.',
    `- estadoSugerido: la etapa de venta en la que está la conversación. Elegí uno de estos ids: ${estados.map(e => `${e.id} (${e.nombre})`).join(', ')}.`,
    '- alertas: solo si la conversación muestra claramente alguna de estas situaciones; si no, dejá la lista vacía.',
    ...situaciones.map(s => `  · ${s.id}: ${s.nombre}. ${s.descripcion}`),
    '  Para cada alerta: nivel "critico" si hay riesgo de perder la venta o al cliente ya mismo, si no "advertencia"; un título corto; el motivo; y el fragmento textual del mensaje que la justifica.',
    '',
    'No inventes datos que no estén en la conversación.',
  ].join('\n');
}

async function conGroq(apiKey: string, sistema: string, conversacion: string, schema: unknown): Promise<Resultado> {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODELO_GROQ,
      messages: [
        { role: 'system', content: sistema },
        { role: 'user', content: conversacion },
      ],
      response_format: { type: 'json_schema', json_schema: { name: 'analisis_conversacion', strict: true, schema } },
      temperature: 0.2,
    }),
    signal: AbortSignal.timeout(90000),
  });
  const cuerpo = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Groq HTTP ${r.status}: ${JSON.stringify(cuerpo?.error ?? cuerpo).slice(0, 300)}`);
  const texto = cuerpo?.choices?.[0]?.message?.content;
  if (!texto) throw new Error('Groq no devolvió contenido.');
  return JSON.parse(texto);
}

async function conClaude(apiKey: string, modelo: string, sistema: string, conversacion: string, schema: Record<string, unknown>): Promise<Resultado> {
  const client = new Anthropic({ apiKey });
  const response = await client.beta.messages.create({
    model: modelo,
    max_tokens: 16000,
    system: sistema,
    messages: [{ role: 'user', content: conversacion }],
    output_config: { effort: 'medium', format: { type: 'json_schema', schema } },
    // Si Claude rechaza el pedido por una política de seguridad, el servidor lo reintenta con otro modelo.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
  });
  if (response.stop_reason === 'refusal') throw new Error('Claude rechazó analizar esta conversación.');
  if (response.stop_reason === 'max_tokens') throw new Error('La respuesta de Claude quedó cortada.');
  const texto = response.content.map(b => (b.type === 'text' ? b.text : '')).join('');
  return JSON.parse(texto);
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'método no permitido' }, 405);
  const usuario = await usuarioActual(req);
  if (!usuario) return json({ error: 'Sesión inválida o usuario inactivo.' }, 403);

  // soloGroq: no pasar a Claude si Groq falla (lo usa la cola de análisis, que primero le pregunta al usuario).
  const { conversacionId, soloGroq } = await req.json().catch(() => ({}));
  if (!conversacionId) return json({ ok: false, mensaje: 'Falta la conversación.' }, 400);

  const { data: conv } = await db
    .from('nc_conversaciones')
    .select('id, vendedor_id, estado_id, cliente:nc_clientes(nombre)')
    .eq('id', conversacionId)
    .maybeSingle();
  if (!conv) return json({ ok: false, mensaje: 'Conversación no encontrada.' }, 404);
  if (usuario.rol === 'vendedor' && conv.vendedor_id !== usuario.id) return json({ error: 'Sin acceso a esta conversación.' }, 403);

  const [{ data: msgs }, { data: estados }, { data: confIa }, { data: credIa }, { data: confAl }, { data: hist }] = await Promise.all([
    db.from('nc_mensajes').select('autor, texto, enviado_at').eq('conversacion_id', conversacionId).order('enviado_at', { ascending: false }).limit(MAX_MENSAJES),
    db.from('nc_estados_venta').select('id, nombre').eq('activo', true).order('orden'),
    db.from('nc_configuracion').select('valores').eq('seccion', 'ia').maybeSingle(),
    db.from('nc_credenciales').select('valores').eq('seccion', 'ia').maybeSingle(),
    db.from('nc_configuracion').select('valores').eq('seccion', 'alertas').maybeSingle(),
    db.from('nc_historial_estados').select('origen').eq('conversacion_id', conversacionId).order('creado_at', { ascending: false }).limit(1),
  ]);
  if (!msgs?.length) return json({ ok: false, mensaje: 'La conversación no tiene mensajes.' });

  const cfgIa = confIa?.valores ?? {};
  const groqKey: string = credIa?.valores?.groqApiKey ?? '';
  const claudeKey: string = credIa?.valores?.apiKey ?? '';
  const modeloClaude = MODELOS_CLAUDE.includes(cfgIa.modelo) ? cfgIa.modelo : 'claude-opus-5-5';
  const situaciones = ((confAl?.valores?.situaciones ?? []) as any[]).filter(s => s.activo);
  const listaEstados = estados ?? [];

  const transcripcion = [...msgs]
    .reverse()
    .map(m => `[${hora(m.enviado_at)}] ${m.autor === 'cliente' ? 'Cliente' : 'Vendedor'}: ${m.texto}`)
    .join('\n');
  const nombre = (conv as any).cliente?.nombre ?? 'Cliente';
  const conversacion =
    `Conversación de WhatsApp con ${nombre}` +
    (msgs.length === MAX_MENSAJES ? ` (últimos ${MAX_MENSAJES} mensajes)` : '') +
    `. Ahora son las ${hora(new Date().toISOString())}.\n\n${transcripcion}`;
  const sistema = instrucciones(listaEstados, situaciones);
  const schema = esquema(
    listaEstados.map(e => e.id),
    situaciones.map(s => s.id),
  );

  let resultado: Resultado | null = null;
  let modelo = '';
  const errores: string[] = [];
  if (groqKey) {
    try {
      resultado = await conGroq(groqKey, sistema, conversacion, schema);
      modelo = `groq/${MODELO_GROQ}`;
    } catch (e) {
      errores.push(e instanceof Error ? e.message : String(e));
    }
  } else errores.push('No hay API Key de Groq.');
  if (!resultado && soloGroq) {
    const limite = (errores[0] ?? '').includes('HTTP 429');
    console.log('nc-analizar: Groq falló en modo soloGroq', errores.join(' | '));
    return json({
      ok: false,
      limiteGroq: limite,
      mensaje: limite ? 'Groq alcanzó su límite de uso.' : `Groq no pudo analizar: ${errores.join(' · ')}`,
    });
  }
  if (!resultado && claudeKey) {
    try {
      resultado = await conClaude(claudeKey, modeloClaude, sistema, conversacion, schema);
      modelo = `anthropic/${modeloClaude}`;
    } catch (e) {
      errores.push(e instanceof Error ? e.message : String(e));
    }
  } else if (!resultado) errores.push('No hay API Key de Anthropic para el respaldo.');
  if (!resultado) {
    console.error('nc-analizar', conversacionId, errores.join(' | '));
    return json({ ok: false, mensaje: `No se pudo analizar: ${errores.join(' · ')}` });
  }
  if (errores.length) console.log('nc-analizar: se usó el respaldo', errores.join(' | '));

  const puntajes = Object.fromEntries(
    CRITERIOS.map(c => {
      const p = resultado!.puntajes?.[c] ?? { puntaje: null, comentario: '' };
      const n = p.puntaje == null ? null : Math.min(10, Math.max(1, Math.round(Number(p.puntaje))));
      return [c, { puntaje: Number.isFinite(n) ? n : null, comentario: p.comentario ?? '' }];
    }),
  );
  const { data: analisis, error: eA } = await db
    .from('nc_analisis')
    .insert({
      conversacion_id: conversacionId,
      resumen: resultado.resumen,
      intencion: resultado.intencion,
      productos: resultado.productos ?? [],
      objeciones: resultado.objeciones ?? [],
      proximo_paso: resultado.proximoPaso,
      puntajes,
      motivo: 'manual',
      solicitado_por: usuario.id,
      modelo,
    })
    .select('id')
    .single();
  if (eA) {
    console.error('nc-analizar: no se pudo guardar el análisis', eA);
    return json({ ok: false, mensaje: 'El análisis se hizo, pero no se pudo guardar.' });
  }

  // Estado sugerido: se aplica salvo que el último cambio lo haya hecho una persona.
  let estadoCambiado = false;
  const manual = hist?.[0]?.origen === 'manual';
  if (!manual && resultado.estadoSugerido !== conv.estado_id && listaEstados.some(e => e.id === resultado!.estadoSugerido)) {
    await db.from('nc_conversaciones').update({ estado_id: resultado.estadoSugerido }).eq('id', conversacionId);
    await db.from('nc_historial_estados').insert({ conversacion_id: conversacionId, estado_id: resultado.estadoSugerido, origen: 'ia' });
    estadoCambiado = true;
  }

  // Alertas: una abierta por situación y conversación.
  let alertasNuevas = 0;
  const validas = (resultado.alertas ?? []).filter(a => situaciones.some(s => s.id === a.situacionId));
  if (validas.length) {
    const { data: abiertas } = await db
      .from('nc_alertas')
      .select('situacion_id')
      .eq('conversacion_id', conversacionId)
      .eq('estado', 'abierta')
      .eq('tipo', 'intervencion');
    const ya = new Set((abiertas ?? []).map(a => a.situacion_id));
    const nuevas = validas.filter(a => !ya.has(a.situacionId));
    if (nuevas.length) {
      await db.from('nc_alertas').insert(
        nuevas.map(a => ({
          conversacion_id: conversacionId,
          tipo: 'intervencion',
          situacion_id: a.situacionId,
          nivel: a.nivel === 'critico' ? 'critico' : 'advertencia',
          titulo: a.titulo,
          motivo: a.motivo,
          fragmento: a.fragmento,
        })),
      );
      alertasNuevas = nuevas.length;
    }
  }

  // Motivo en palabras simples de por qué se pasó de Groq a Claude (para avisarle al usuario).
  const errGroq = errores[0] ?? '';
  const motivoRespaldo = !errores.length
    ? ''
    : errGroq.includes('HTTP 429')
      ? 'Groq alcanzó su límite de uso'
      : errGroq.startsWith('No hay API Key de Groq')
        ? 'no hay API Key de Groq cargada'
        : 'Groq devolvió un error';
  return json({ ok: true, analisisId: analisis.id, modelo, respaldo: errores.length > 0, motivoRespaldo, estadoCambiado, alertasNuevas });
});
