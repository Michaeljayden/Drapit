-- ============================================================================
-- Drapit — Rollover try-ons
-- ============================================================================
-- Adds rollover_tryons to shops so unused try-ons carry over each month.
-- Effective monthly limit = monthly_tryon_limit + rollover_tryons.
-- Rollover is capped at 1× the plan's monthly limit to prevent unlimited
-- accumulation. Populated each billing cycle via Stripe webhook.
-- ============================================================================

alter table public.shops
  add column if not exists rollover_tryons int not null default 0;

comment on column public.shops.rollover_tryons is
  'Unused try-ons carried over from the previous billing cycle. '
  'Capped at 1× monthly_tryon_limit. Resets to new value each renewal.';
