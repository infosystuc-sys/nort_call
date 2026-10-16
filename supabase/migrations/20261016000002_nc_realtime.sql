-- Nort Monitor · Supabase Realtime (postgres_changes) para que la app reciba solo los cambios,
-- en lugar de recargar todas las tablas periódicamente. Las políticas RLS se aplican por usuario.
-- No se publican nc_credenciales (secretos) ni las tablas de métricas (cambian poco).
alter publication supabase_realtime add table
  public.nc_mensajes,
  public.nc_conversaciones,
  public.nc_clientes,
  public.nc_alertas,
  public.nc_analisis,
  public.nc_notas,
  public.nc_historial_estados,
  public.nc_estados_venta,
  public.nc_usuarios,
  public.nc_configuracion;
