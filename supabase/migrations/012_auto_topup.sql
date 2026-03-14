-- ============================================================================
-- Drapit — Auto Top-Up voor VTON try-ons
-- ============================================================================
-- Adds:
--   1. extra_tryons column: purchased try-ons that persist across billing cycles
--   2. Auto top-up configuration columns on shops table
--   3. topup_transactions audit table
--   4. increment_tryons_count_v2 RPC: atomically handles extra_tryons deduction
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. Extra try-ons (never reset on monthly renewal, like studio_extra_credits)
-- --------------------------------------------------------------------------
alter table public.shops
  add column if not exists extra_tryons integer not null default 0;

comment on column public.shops.extra_tryons is
  'Extra VTON try-ons from auto top-up purchases. Never reset on monthly renewal.';

-- --------------------------------------------------------------------------
-- 2. Auto top-up configuration
-- --------------------------------------------------------------------------
alter table public.shops
  add column if not exists auto_topup_enabled        boolean not null default false,
  add column if not exists auto_topup_threshold_pct  integer not null default 90,
  add column if not exists auto_topup_pack_index     integer not null default 1,
  add column if not exists auto_topup_monthly_cap    integer not null default 100,
  add column if not exists auto_topup_spent_this_month numeric(10,2) not null default 0;

-- Constraints
alter table public.shops
  add constraint chk_auto_topup_threshold_pct
    check (auto_topup_threshold_pct >= 50 and auto_topup_threshold_pct <= 100);

alter table public.shops
  add constraint chk_auto_topup_pack_index
    check (auto_topup_pack_index >= 0 and auto_topup_pack_index <= 2);

comment on column public.shops.auto_topup_enabled is
  'Whether automatic top-up is enabled when usage crosses threshold.';
comment on column public.shops.auto_topup_threshold_pct is
  'Percentage of plan limit at which auto top-up triggers (50-100).';
comment on column public.shops.auto_topup_pack_index is
  'Which try-on pack to purchase on auto top-up (index into TRYON_PACKS array).';
comment on column public.shops.auto_topup_monthly_cap is
  'Maximum EUR to auto-charge per month (safety cap).';
comment on column public.shops.auto_topup_spent_this_month is
  'EUR already auto-charged this billing cycle. Reset on invoice.payment_succeeded.';

-- --------------------------------------------------------------------------
-- 3. Audit table for top-up transactions
-- --------------------------------------------------------------------------
create table if not exists public.topup_transactions (
  id             uuid primary key default gen_random_uuid(),
  shop_id        uuid not null references public.shops(id) on delete cascade,
  created_at     timestamptz not null default now(),
  tryons_added   integer not null,
  amount_eur     numeric(10,2) not null,
  stripe_payment_intent_id text,
  status         text not null default 'succeeded'
    check (status in ('succeeded', 'failed', 'pending')),
  trigger_type   text not null default 'auto'
    check (trigger_type in ('auto', 'manual')),
  failure_reason text
);

comment on table public.topup_transactions is
  'Audit trail for VTON try-on auto top-up purchases.';

create index if not exists idx_topup_transactions_shop
  on public.topup_transactions (shop_id, created_at desc);

-- RLS
alter table public.topup_transactions enable row level security;

create policy "topup_transactions_select_own"
  on public.topup_transactions for select
  using (shop_id = auth.uid());

-- --------------------------------------------------------------------------
-- 4. increment_tryons_count_v2: handles extra_tryons deduction atomically
-- --------------------------------------------------------------------------
create or replace function public.increment_tryons_count_v2(shop_row_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  _monthly_limit int;
  _rollover int;
  _tryons int;
  _extra int;
  _plan_limit int;
begin
  select monthly_tryon_limit, rollover_tryons, tryons_this_month, extra_tryons
  into _monthly_limit, _rollover, _tryons, _extra
  from public.shops
  where id = shop_row_id
  for update;  -- row lock for atomicity

  _plan_limit := _monthly_limit + coalesce(_rollover, 0);

  if _tryons < _plan_limit then
    -- Still within plan allocation: just increment counter
    update public.shops
    set tryons_this_month = tryons_this_month + 1
    where id = shop_row_id;
  elsif _extra > 0 then
    -- Plan used up, deduct from extra_tryons
    update public.shops
    set tryons_this_month = tryons_this_month + 1,
        extra_tryons = extra_tryons - 1
    where id = shop_row_id;
  else
    -- Both plan and extra exhausted (should have been caught by limit check)
    update public.shops
    set tryons_this_month = tryons_this_month + 1
    where id = shop_row_id;
  end if;
end;
$$;

comment on function public.increment_tryons_count_v2 is
  'Atomically increments try-on counter and deducts from extra_tryons when plan limit is exceeded.';
