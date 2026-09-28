-- ============================================================================
-- Drapit — Expiring Shopify offline access tokens
-- ============================================================================
-- Shopify requires expiring offline tokens for all public apps from
-- 1 January 2027. Access tokens now expire (~1h) and come with a rotating
-- refresh token (~90 days). Rows with shopify_refresh_token = null still hold
-- a legacy non-expiring token; lib/shopify-token.ts migrates those on first use
-- (or run scripts/migrate-shopify-tokens.mjs once).

alter table public.shops
add column if not exists shopify_token_expires_at timestamptz,
add column if not exists shopify_refresh_token text,
add column if not exists shopify_refresh_token_expires_at timestamptz;

comment on column public.shops.shopify_access_token is 'Shopify offline access token (expiring when shopify_refresh_token is set).';
comment on column public.shops.shopify_token_expires_at is 'When shopify_access_token expires.';
comment on column public.shops.shopify_refresh_token is 'Rotating refresh token for the expiring offline access token.';
comment on column public.shops.shopify_refresh_token_expires_at is 'When shopify_refresh_token expires (merchant must re-auth after that).';
