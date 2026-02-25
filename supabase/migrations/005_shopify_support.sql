-- Add Shopify support to shops table
alter table public.shops 
add column if not exists shopify_domain text unique,
add column if not exists shopify_access_token text,
add column if not exists shopify_app_installed boolean default false;

comment on column public.shops.shopify_domain is 'The .myshopify.com domain of the store.';
comment on column public.shops.shopify_access_token is 'Offline access token for Shopify API.';
