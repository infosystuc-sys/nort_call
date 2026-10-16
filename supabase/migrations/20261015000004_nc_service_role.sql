-- Nort Monitor · permisos para las Edge Functions (rol service_role, que ignora RLS).
-- En proyectos donde la Data API no otorga permisos automáticos a tablas nuevas, sin esto
-- las funciones reciben 403 al leer o escribir las tablas nc_*.
grant select, insert, update, delete on public.nc_usuarios, public.nc_canales, public.nc_estados_venta, public.nc_clientes,
  public.nc_conversaciones, public.nc_mensajes, public.nc_historial_estados, public.nc_analisis,
  public.nc_alertas, public.nc_notas, public.nc_metricas_diarias, public.nc_resumen_desempeno,
  public.nc_configuracion, public.nc_credenciales to service_role;
grant execute on function public.nc_cambiar_estado(uuid, text) to service_role;
