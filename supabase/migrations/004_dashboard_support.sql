-- ============================================================================
-- Drapit — Dashboard support: add missing columns
-- ============================================================================
-- Adds:
--   1. shops.owner_id (references auth.users for dashboard login)
--   2. shops.domain (webshop domain for widget config)
--   3. api_keys.key_prefix (first 8 chars of API key for display)
--   4. api_keys.name (human-readable API key label)
--   5. Updated RLS policies for owner_id-based access
-- ============================================================================

-- 1. Add owner_id to shops (nullable initially for existing rows)
alter table public.shops add column if not exists owner_id uuid references auth.users(id);
alter table public.shops add column if not exists domain text;

-- 2. Add key_prefix and name to api_keys
alter table public.api_keys add column if not exists key_prefix text;
alter table public.api_keys add column if not exists name text default 'API Key';

-- 3. Update RLS policies to support owner_id
-- Drop old policies that use id = auth.uid()
drop policy if exists "shops_select_own" on public.shops;
drop policy if exists "shops_update_own" on public.shops;

-- Create new policies using owner_id
create policy "shops_select_own"
  on public.shops for select
  using (owner_id = auth.uid() or id = auth.uid());

create policy "shops_update_own"
  on public.shops for update
  using (owner_id = auth.uid() or id = auth.uid());

-- 4. Update api_keys policies to allow owner-based access via shop join
drop policy if exists "api_keys_select_own" on public.api_keys;
drop policy if exists "api_keys_insert_own" on public.api_keys;
drop policy if exists "api_keys_update_own" on public.api_keys;
drop policy if exists "api_keys_delete_own" on public.api_keys;

create policy "api_keys_select_own"
  on public.api_keys for select
  using (
    shop_id in (select id from public.shops where owner_id = auth.uid() or id = auth.uid())
  );

create policy "api_keys_insert_own"
  on public.api_keys for insert
  with check (
    shop_id in (select id from public.shops where owner_id = auth.uid() or id = auth.uid())
  );

create policy "api_keys_update_own"
  on public.api_keys for update
  using (
    shop_id in (select id from public.shops where owner_id = auth.uid() or id = auth.uid())
  );

create policy "api_keys_delete_own"
  on public.api_keys for delete
  using (
    shop_id in (select id from public.shops where owner_id = auth.uid() or id = auth.uid())
  );
