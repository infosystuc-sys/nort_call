-- Nort Monitor · eliminar conversaciones (solo admin).
-- Borra la conversación con sus mensajes, historial, análisis, alertas y notas (on delete cascade),
-- y también el cliente si se queda sin conversaciones.

grant delete on public.nc_conversaciones, public.nc_clientes to authenticated;

create policy "nc_conversaciones: admin elimina" on public.nc_conversaciones for delete to authenticated
  using ((select private.nc_rol()) = 'admin');
create policy "nc_clientes: admin elimina" on public.nc_clientes for delete to authenticated
  using ((select private.nc_rol()) = 'admin');

-- security invoker: se aplican las políticas RLS de quien la llama.
create function public.nc_eliminar_conversacion(p_conversacion_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_cliente uuid;
begin
  delete from public.nc_conversaciones where id = p_conversacion_id returning cliente_id into v_cliente;
  if v_cliente is null then
    raise exception 'Conversación no encontrada o sin permiso';
  end if;
  delete from public.nc_clientes c
   where c.id = v_cliente
     and not exists (select 1 from public.nc_conversaciones x where x.cliente_id = c.id);
end;
$$;
revoke all on function public.nc_eliminar_conversacion(uuid) from public, anon;
grant execute on function public.nc_eliminar_conversacion(uuid) to authenticated, service_role;
