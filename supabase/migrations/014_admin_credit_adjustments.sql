-- ============================================================================
-- Drapit — Admin Credit Adjustments
-- ============================================================================
-- Adds:
--   1. 'admin' trigger_type to topup_transactions
--   2. admin_reason & admin_email columns to topup_transactions
--   3. studio_credit_adjustments audit table
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. Extend trigger_type constraint to allow 'admin'
-- --------------------------------------------------------------------------
alter table public.topup_transactions
  drop constraint if exists topup_transactions_trigger_type_check;

alter table public.topup_transactions
  add constraint topup_transactions_trigger_type_check
    check (trigger_type in ('auto', 'manual', 'admin'));

-- --------------------------------------------------------------------------
-- 2. Admin metadata columns on topup_transactions
-- --------------------------------------------------------------------------
alter table public.topup_transactions
  add column if not exists admin_reason text,
  add column if not exists admin_email  text;

comment on column public.topup_transactions.admin_reason is
  'Reason for admin credit adjustment (e.g., compensation).';
comment on column public.topup_transactions.admin_email is
  'Email of the admin who performed the adjustment.';

-- --------------------------------------------------------------------------
-- 3. Studio credit adjustments audit table
-- --------------------------------------------------------------------------
create table if not exists public.studio_credit_adjustments (
  id            uuid primary key default gen_random_uuid(),
  shop_id       uuid not null references public.shops(id) on delete cascade,
  created_at    timestamptz not null default now(),
  credits_added integer not null,
  admin_email   text not null,
  reason        text
);

comment on table public.studio_credit_adjustments is
  'Audit trail for admin-initiated studio credit adjustments.';

create index if not exists idx_studio_credit_adjustments_shop
  on public.studio_credit_adjustments (shop_id, created_at desc);

-- RLS: shop owners can read their own records
alter table public.studio_credit_adjustments enable row level security;

create policy "studio_credit_adjustments_select_own"
  on public.studio_credit_adjustments for select
  using (shop_id = auth.uid());
