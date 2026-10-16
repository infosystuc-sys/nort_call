-- Nort Monitor · registra qué proveedor/modelo hizo cada análisis (p. ej. "groq/openai/gpt-oss-120b").
alter table public.nc_analisis add column modelo text;

-- Modelo de respaldo (Claude) por defecto: la lista anterior tenía IDs de generaciones viejas.
update public.nc_configuracion
   set valores = valores || '{"proveedor":"Anthropic","modelo":"claude-opus-5-5"}'::jsonb
 where seccion = 'ia' and coalesce(valores->>'modelo', '') not in ('claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5');
