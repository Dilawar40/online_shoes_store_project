-- Extend order statuses to a richer lifecycle
-- New allowed statuses
-- pending → confirmed → in_progress → shipped → delivered → completed (or cancelled)

-- Safely drop any existing check constraint on orders.status, then add a named one
do $$
declare
  cons record;
begin
  for cons in
    select conname
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'orders'
      and c.contype = 'c' -- check constraint
      and pg_get_constraintdef(c.oid) ilike '%status%in%'
  loop
    execute format('alter table public.orders drop constraint %I', cons.conname);
  end loop;

  -- Add new explicit constraint name
  alter table public.orders
    add constraint orders_status_check_ext
    check (status in (
      'pending', 'confirmed', 'in_progress', 'shipped', 'delivered', 'completed', 'cancelled', 'paid'
    ));
end $$;
