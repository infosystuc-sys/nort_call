-- Nort Monitor · cola de transcripción de audios.
-- audio_pendiente guarda la clave del mensaje en WhatsApp ({ key, intentos }) mientras el audio
-- no se transcribió; se pone en null al terminar (o tras 3 intentos fallidos).
alter table public.nc_mensajes add column audio_pendiente jsonb;
create index nc_mensajes_audio_pendiente_idx on public.nc_mensajes (enviado_at) where audio_pendiente is not null;
