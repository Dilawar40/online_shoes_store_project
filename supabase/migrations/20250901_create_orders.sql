-- Create orders table
-- Ensure pgcrypto is available for gen_random_uuid()
create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  status text not null check (status in ('pending','unpaid','paid','cancelled')) default 'pending',
  payment_method text not null,
  email text,
  phone text,
  first_name text,
  last_name text,
  shipping_address jsonb,
  billing_address jsonb,
  shipping_method text,
  subtotal numeric not null default 0,
  discount_amount numeric not null default 0,
  shipping_cost numeric not null default 0,
  total numeric not null default 0,
  currency_code text not null default 'PKR',
  metadata jsonb,
  created_at timestamp with time zone not null default now()
);

-- Create order_items table
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id text,
  product_title text,
  variant_id text,
  variant_title text,
  quantity integer not null default 1,
  unit_price numeric not null default 0,
  currency_code text not null default 'PKR',
  image_url text,
  created_at timestamp with time zone not null default now()
);

-- Indexes
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_order_items_order_id on public.order_items(order_id);

-- Enable RLS
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Basic policies (restrictive by default). Admin/APIs should use service role to access.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders' and policyname = 'anon_no_access_orders'
  ) then
    create policy "anon_no_access_orders" on public.orders
      for select to anon using (false);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'order_items' and policyname = 'anon_no_access_order_items'
  ) then
    create policy "anon_no_access_order_items" on public.order_items
      for select to anon using (false);
  end if;
end $$;
