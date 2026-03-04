-- ============================================================================
-- Drapit Studio — Database support
-- ============================================================================
-- Adds all columns needed for Studio: access, credits, billing plan, extra packs.
-- Everyone gets a free trial (has_studio=true, studio_credits_limit=20).
-- ============================================================================

alter table public.shops
  -- Studio access (true for all → free trial of 20 credits)
  add column if not exists has_studio              boolean not null default true,

  -- Credits used this billing period (reset on monthly renewal)
  add column if not exists studio_credits_used     integer not null default 0,

  -- Monthly credits from subscription plan (free trial = 20)
  add column if not exists studio_credits_limit    integer not null default 20,

  -- Extra credits from one-time credit pack purchases (never reset on renewal)
  add column if not exists studio_extra_credits    integer not null default 0,

  -- Current Studio plan key: 'studio_trial' | 'studio_starter' | 'studio_pro' | 'studio_scale'
  add column if not exists studio_plan             text    not null default 'studio_trial',

  -- Stripe subscription ID for the Studio subscription (null = on free trial)
  add column if not exists studio_subscription_id  text;

-- Comments
comment on column public.shops.has_studio             is 'Whether this shop can access Drapit Studio (true for all → free trial)';
comment on column public.shops.studio_credits_used    is 'Studio AI credits used this billing period';
comment on column public.shops.studio_credits_limit   is 'Monthly Studio AI credit allowance from subscription';
comment on column public.shops.studio_extra_credits   is 'Extra Studio credits purchased via one-time credit packs';
comment on column public.shops.studio_plan            is 'Active Studio subscription tier';
comment on column public.shops.studio_subscription_id is 'Stripe subscription ID for the Studio plan';
