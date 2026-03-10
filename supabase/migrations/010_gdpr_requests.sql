-- =============================================================================
-- Migration 010: gdpr_requests
-- =============================================================================
-- Audit table for Shopify GDPR webhook events.
-- Tracks data_request, customer_redact, and shop_redact events.
-- Required for Shopify App Store compliance.
-- =============================================================================

create table if not exists public.gdpr_requests (
    id              uuid primary key default gen_random_uuid(),
    type            text not null check (type in ('data_request', 'customer_redact', 'shop_redact')),
    shop_domain     text not null,
    customer_id     text,                   -- null for shop_redact
    customer_email  text,                   -- null for shop_redact
    requested_at    timestamptz not null default now(),
    status          text not null default 'received'
                        check (status in ('received', 'completed', 'failed')),
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

-- Unique constraint so upserts work correctly
alter table public.gdpr_requests
    drop constraint if exists gdpr_requests_shop_customer_type_unique;

alter table public.gdpr_requests
    add constraint gdpr_requests_shop_customer_type_unique
    unique (shop_domain, customer_id, type);

-- Index for lookups by shop
create index if not exists gdpr_requests_shop_domain_idx
    on public.gdpr_requests (shop_domain);

-- RLS: only service role can read/write (no end-user access)
alter table public.gdpr_requests enable row level security;

-- No public policies — access via service role key only
comment on table public.gdpr_requests is
    'Audit log for Shopify GDPR webhook events (data_request, customer_redact, shop_redact).';
