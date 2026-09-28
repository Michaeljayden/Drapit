-- ============================================================================
-- Drapit — Outfit / set try-on (Shopify only)
-- ============================================================================
-- shops.outfits_enabled: server-side switch. The theme block has its own
-- checkbox; both must be on before the widget offers "Combineer met…".
-- tryons.layer / parent_tryon_id: audit trail for the second layer.
-- ============================================================================

alter table public.shops
  add column if not exists outfits_enabled boolean not null default false;

alter table public.tryons
  add column if not exists layer text
    check (layer is null or layer in ('bottom')),
  add column if not exists parent_tryon_id uuid references public.tryons(id) on delete set null;

create index if not exists idx_tryons_parent on public.tryons (parent_tryon_id)
  where parent_tryon_id is not null;

comment on column public.shops.outfits_enabled is
  'Allows layer="bottom" try-ons (outfit/set flow). Shopify-billed shops only; default off.';
