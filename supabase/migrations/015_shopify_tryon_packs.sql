-- ============================================================================
-- Drapit — Shopify one-time try-on packs
-- ============================================================================
-- Shopify merchants buy extra try-ons via AppPurchaseOneTime (Shopify Billing
-- API). Reuses topup_transactions as the audit trail; adds the Shopify
-- purchase id so the callback can be idempotent.
-- ============================================================================

alter table public.topup_transactions
  add column if not exists source text not null default 'stripe'
    check (source in ('stripe', 'shopify')),
  add column if not exists shopify_purchase_id text,
  add column if not exists pack_key text;

create unique index if not exists idx_topup_transactions_shopify_purchase
  on public.topup_transactions (shopify_purchase_id)
  where shopify_purchase_id is not null;

comment on column public.topup_transactions.shopify_purchase_id is
  'gid://shopify/AppPurchaseOneTime/… for packs bought via Shopify Billing.';
