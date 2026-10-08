-- =============================================================================
-- Drapit — try-on-teller per factuurperiode (2026-10-07)
-- =============================================================================
-- usage_reset_at = moment waarop tryons_this_month weer op 0 gaat voor een
-- Shopify-shop: einde van de gratis trial, daarna het einde van de lopende
-- Shopify-factuurperiode (currentPeriodEnd). Wordt gezet door syncShopifyPlan.
-- NULL = oude gedrag (reset op de 1e van de maand door reset-monthly-tryons),
-- alleen nog voor shops zonder betaald abonnement.
-- =============================================================================

alter table public.shops
    add column if not exists usage_reset_at timestamptz;

comment on column public.shops.usage_reset_at is
    'Volgende reset van tryons_this_month (Shopify trial-einde of factuurperiode-einde). NULL = kalendermaand-reset.';
