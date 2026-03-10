-- =============================================================================
-- Migration 011: Shopify Billing support
-- =============================================================================
-- Adds billing_source and shopify_charge_id to shops table.
--
-- billing_source:
--   'stripe'  → merchant pays via Stripe (direct drapit.io signup)
--   'shopify' → merchant pays via Shopify Billing API (App Store install)
--
-- shopify_charge_id:
--   The recurring_application_charge ID returned by Shopify after activation.
-- =============================================================================

alter table public.shops
    add column if not exists billing_source text
        default 'stripe'
        check (billing_source in ('stripe', 'shopify')),
    add column if not exists shopify_charge_id text;

-- Shops that already have a shopify_domain but no billing_source set
-- are App Store installs → mark as 'shopify'
update public.shops
set billing_source = 'shopify'
where shopify_domain is not null
  and billing_source = 'stripe';

comment on column public.shops.billing_source is
    'Which billing system handles this merchant: stripe (direct) or shopify (App Store).';

comment on column public.shops.shopify_charge_id is
    'The active RecurringApplicationCharge ID from Shopify Billing API.';
