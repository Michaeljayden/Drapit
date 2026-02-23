-- ============================================================================
-- Drapit — Initial Database Schema
-- ============================================================================
-- Tables: shops, api_keys, tryons, products
-- Includes RLS policies so each shop only sees its own data.
-- ============================================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- --------------------------------------------------------------------------
-- 1. SHOPS (webshop accounts)
-- --------------------------------------------------------------------------
create table public.shops (
  id                      uuid primary key default gen_random_uuid(),
  created_at              timestamptz not null default now(),
  name                    text not null,
  email                   text not null unique,
  plan                    text not null default 'starter',
  stripe_customer_id      text,
  stripe_subscription_id  text,
  monthly_tryon_limit     int not null default 500,
  tryons_this_month       int not null default 0
);

comment on table public.shops is 'Webshop accounts that use the Drapit platform.';

-- --------------------------------------------------------------------------
-- 2. API_KEYS (per shop)
-- --------------------------------------------------------------------------
create table public.api_keys (
  id           uuid primary key default gen_random_uuid(),
  shop_id      uuid not null references public.shops(id) on delete cascade,
  key_hash     text not null unique,
  created_at   timestamptz not null default now(),
  last_used_at timestamptz,
  is_active    boolean not null default true
);

comment on table public.api_keys is 'Hashed API keys used by shops to authenticate widget & API requests.';

-- --------------------------------------------------------------------------
-- 3. TRYONS (virtual try-on requests)
-- --------------------------------------------------------------------------
create table public.tryons (
  id                       uuid primary key default gen_random_uuid(),
  shop_id                  uuid not null references public.shops(id) on delete cascade,
  product_id               text,
  product_image_url        text,
  user_photo_url           text,
  result_image_url         text,
  status                   text not null default 'pending',
  replicate_prediction_id  text,
  created_at               timestamptz not null default now(),
  completed_at             timestamptz,
  converted                boolean not null default false,
  converted_at             timestamptz
);

comment on table public.tryons is 'Individual virtual try-on requests and their results.';

-- Index for dashboard queries: list try-ons per shop, newest first
create index idx_tryons_shop_created on public.tryons (shop_id, created_at desc);

-- --------------------------------------------------------------------------
-- 4. PRODUCTS (catalogue items per shop)
-- --------------------------------------------------------------------------
create table public.products (
  id           uuid primary key default gen_random_uuid(),
  shop_id      uuid not null references public.shops(id) on delete cascade,
  external_id  text,
  name         text not null,
  image_url    text,
  price        numeric,
  buy_url      text,
  created_at   timestamptz not null default now()
);

comment on table public.products is 'Product catalogue items synced from external webshops.';

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
-- Policy: each authenticated shop user can only access rows where
-- shop_id = auth.uid()  (the shop's Supabase user ID = shops.id)
-- ============================================================================

alter table public.shops     enable row level security;
alter table public.api_keys  enable row level security;
alter table public.tryons    enable row level security;
alter table public.products  enable row level security;

-- SHOPS — a shop can read/update only its own row
create policy "shops_select_own"
  on public.shops for select
  using (id = auth.uid());

create policy "shops_update_own"
  on public.shops for update
  using (id = auth.uid());

-- API_KEYS — a shop can manage only its own keys
create policy "api_keys_select_own"
  on public.api_keys for select
  using (shop_id = auth.uid());

create policy "api_keys_insert_own"
  on public.api_keys for insert
  with check (shop_id = auth.uid());

create policy "api_keys_update_own"
  on public.api_keys for update
  using (shop_id = auth.uid());

create policy "api_keys_delete_own"
  on public.api_keys for delete
  using (shop_id = auth.uid());

-- TRYONS — a shop can read only its own try-ons
create policy "tryons_select_own"
  on public.tryons for select
  using (shop_id = auth.uid());

create policy "tryons_insert_own"
  on public.tryons for insert
  with check (shop_id = auth.uid());

-- PRODUCTS — a shop can manage only its own products
create policy "products_select_own"
  on public.products for select
  using (shop_id = auth.uid());

create policy "products_insert_own"
  on public.products for insert
  with check (shop_id = auth.uid());

create policy "products_update_own"
  on public.products for update
  using (shop_id = auth.uid());

create policy "products_delete_own"
  on public.products for delete
  using (shop_id = auth.uid());
