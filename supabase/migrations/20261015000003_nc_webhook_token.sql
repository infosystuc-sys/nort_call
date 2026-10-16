-- Nort Monitor · token secreto para el webhook de Evolution API.
-- Se guarda en nc_credenciales (solo admin); la app arma la URL del webhook a partir de él.
insert into public.nc_configuracion (seccion, valores) values ('whatsapp', '{}'::jsonb) on conflict (seccion) do nothing;
insert into public.nc_credenciales (seccion, valores) values ('whatsapp', '{}'::jsonb) on conflict (seccion) do nothing;

update public.nc_credenciales
   set valores = valores || jsonb_build_object('webhookToken', replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '')),
       actualizado_at = now()
 where seccion = 'whatsapp'
   and coalesce(valores->>'webhookToken', '') = '';

-- La URL del webhook ya no se guarda en la configuración pública (la calcula la app).
update public.nc_configuracion set valores = valores - 'webhookUrl' where seccion = 'whatsapp';
