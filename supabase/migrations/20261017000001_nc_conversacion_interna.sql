-- Conversaciones internas (entre el equipo, proveedores, pruebas, etc.): no son ventas.
-- Se ocultan de la lista salvo que se pida verlas y no se analizan con IA.
-- La marca la ponen admin y supervisor (política "nc_conversaciones: supervisor edita").
alter table public.nc_conversaciones add column interna boolean not null default false;
