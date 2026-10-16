-- Nort Monitor · una sola conversación por cliente.
-- Evita duplicados cuando llegan dos mensajes del mismo cliente al mismo tiempo (dos llamadas
-- simultáneas al webhook creaban dos conversaciones). El webhook inserta con on conflict do nothing.
-- Reemplaza al índice no único nc_conversaciones_cliente_idx.
drop index if exists public.nc_conversaciones_cliente_idx;
create unique index nc_conversaciones_cliente_key on public.nc_conversaciones (cliente_id);
