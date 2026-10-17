# Nort Monitor

Monitor de ventas de WhatsApp e Instagram de Suplementos Nort (React + Vite + Supabase).

## Uso

```bash
npm install
npm run dev      # http://localhost:5173
npm run dev:demo # http://localhost:5174, siempre en modo demo (ignora .env.local)
npm run build    # genera dist/
```

- **Con Supabase:** copiá `.env.example` como `.env.local` y completá `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.
  El login usa Supabase Auth (email y contraseña).
- **Modo demo:** sin esas variables la app usa los datos de ejemplo en memoria, con accesos de demostración en el login.
  Parámetros: `?rol=admin|supervisor|vendedor` y `?demo=carga|error|vacio`.

## Back (Supabase)

`supabase/migrations/` crea todas las tablas con prefijo `nc_`:

| Tabla | Contenido |
| --- | --- |
| `nc_usuarios` | Usuarios de la app y su rol (`admin`, `supervisor`, `vendedor`), vinculados a Supabase Auth por email |
| `nc_canales` | WhatsApp e Instagram |
| `nc_estados_venta` | Etapas del embudo (editables por admin) |
| `nc_clientes`, `nc_conversaciones`, `nc_mensajes` | Conversaciones y sus mensajes |
| `nc_historial_estados` | Cambios de estado (IA o manual) |
| `nc_analisis` | Análisis de IA por conversación |
| `nc_alertas`, `nc_notas` | Alertas y notas de supervisión |
| `nc_metricas_diarias`, `nc_resumen_desempeno` | Métricas y resumen de desempeño |
| `nc_configuracion` | Configuración no sensible por sección |
| `nc_credenciales` | API keys y tokens (solo admin) |

Seguridad (RLS en todas las tablas):

- **admin:** todo, incluida la configuración, las credenciales, los estados y los usuarios.
- **supervisor:** todas las conversaciones, alertas y notas; puede corregir estados.
- Eliminar una conversación (botón de papelera en el detalle) es solo de admin: borra mensajes, historial,
  análisis, alertas y notas, y el cliente si se queda sin conversaciones (`nc_eliminar_conversacion`).
- **vendedor:** solo sus conversaciones y su desempeño.
- Un usuario de Auth sin fila activa en `nc_usuarios` no ve nada.

### Actualización en vivo (Realtime)

La app carga todo una vez al iniciar sesión y después recibe solo los cambios por Supabase Realtime
(`postgres_changes`, migración `20261016000002_nc_realtime.sql`), filtrados por las mismas políticas RLS.
Recarga completa solo al reconectar o al volver a una pestaña que estuvo oculta más de 2 minutos.
`nc_credenciales` y las métricas no se publican.

### Alta de usuarios

1. Un admin crea el usuario en la app (Configuración › Usuarios). Eso solo autoriza el email.
2. Se crea la cuenta con ese mismo email en Supabase › Authentication › Users (Add user o Invite).
   Un trigger vincula la cuenta con su fila de `nc_usuarios` automáticamente.

Recomendado: desactivar el registro público (Authentication › Sign In / Providers › "Allow new users to sign up").

### Datos de demostración

`supabase/seed.sql` carga los datos de ejemplo, con fechas relativas al momento de ejecutarlo.
Se regenera con `node scripts/generar-seed.mjs`.

### WhatsApp (Evolution API)

Edge Functions en `supabase/functions/`:

- `nc-webhook-evolution` — recibe `MESSAGES_UPSERT` y `CONNECTION_UPDATE` de Evolution y guarda clientes,
  conversaciones y mensajes. Se autoriza con `?token=` (guardado en `nc_credenciales.whatsapp.webhookToken`);
  la URL completa aparece en Configuración › WhatsApp (solo admin). Ignora grupos, estados y otras instancias;
  los adjuntos se registran como `[Imagen]`, `[Audio]`, etc., sin guardarlos.
  Si hay API Key de Groq (Configuración › Análisis con IA), los audios se transcriben en segundo plano con
  Whisper (`whisper-large-v3`) y el texto pasa a `[Audio] …`. El audio se pide a Evolution
  (`/chat/getBase64FromMediaMessage`) o se toma del webhook si Evolution tiene activada la opción Base64.
- `nc-evolution` — "Probar conexión" y "Generar QR" de la app (solo admin), usando la configuración guardada.

Ambas se despliegan con `verify_jwt = false` y autorizan en el código. Comparten `supabase/functions/_shared/whatsapp.ts`
(guardado de mensajes y transcripción), por eso se despliegan con `entrypoint_path` `<función>/index.ts` e incluyen ese archivo.

Importar historial (Configuración › WhatsApp, solo admin): `nc-evolution` con `accion: 'importar'` trae de a 100 mensajes
desde `/chat/findMessages` filtrando por fecha; luego `accion: 'transcribir'` procesa la cola de audios
(`nc_mensajes.audio_pendiente`) en lotes de 6 con pausas, para no pasar el límite gratuito de Groq (20 por minuto).
Un audio que falla 3 veces queda como `[Audio] (no se pudo transcribir)`.

### Análisis con IA

`nc-analizar` (cualquier usuario con acceso a la conversación, botón "Analizar ahora"): manda los últimos 200
mensajes a Groq (`openai/gpt-oss-120b`, salida JSON con esquema estricto) y, si Groq falla o se queda sin cupo,
a Claude (SDK `@anthropic-ai/sdk`, modelo de Configuración › Análisis con IA, por defecto `claude-opus-5-5`, con
`fallbacks: "default"` ante rechazos). Guarda resumen, intención, productos, objeciones, próximo paso y puntajes en
`nc_analisis` (columna `modelo` = quién lo hizo); aplica el estado sugerido salvo que el último cambio haya sido
manual, y abre alertas de intervención para las situaciones activas de Configuración › Alertas.

- Si un análisis individual pasa a Claude, la app lo avisa en ámbar con el motivo (`motivoRespaldo`), y cada
  análisis muestra el modelo que lo hizo.
- Cola (Conversaciones › "Analizar pendientes (N)", admin y supervisor): analiza de a una las conversaciones
  filtradas sin análisis o con mensajes nuevos, con `soloGroq: true`. Si Groq devuelve 429 la cola se pausa y
  pregunta: seguir con Claude, esperar o detener. Si se elige esperar, reintenta sola (el tiempo que pide Groq,
  `esperarSeg`, o un minuto) cada vez que Groq siga al límite, sin volver a preguntar. Corre en el navegador y se
  guarda en `localStorage`: si se recarga la página, se retoma al volver a entrar con el mismo usuario.

### Conversaciones internas

Admin y supervisor pueden marcar una conversación como **Interna** (casilla en el encabezado del detalle;
columna `nc_conversaciones.interna`). Las internas no son ventas: se ocultan de la lista (se ven con la casilla
"Ver internas"), del panel, las métricas y las alertas, quedan fuera de la cola de análisis y `nc-analizar` se niega
a analizarlas.

### Pendiente

- Instagram (webhook de Meta).
- Análisis automático (cada N minutos / N mensajes) y métricas diarias y resumen de desempeño.
- Alertas de espera ("cliente esperando respuesta").

## Estructura del front

- `src/App.jsx` — estado y lógica; arma el view-model que se pasa a las vistas.
- `src/views/` — shell y pantallas (Login, Panel, Conversaciones, Desempeño, Alertas, Configuración).
- `src/data/api.js` — acceso a datos (Supabase o modo demo).
- `src/data/mockData.js` — datos de ejemplo.
- `design/` — prototipo original de Claude Design (referencia).
