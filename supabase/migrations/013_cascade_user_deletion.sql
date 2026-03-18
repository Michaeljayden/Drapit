-- ============================================================================
-- Drapit — Cascade User Deletion
-- ============================================================================
-- Fixes foreign key constraints zodat users (en hun data) zonder errors
-- verwijderd kunnen worden via Supabase dashboard of via account deletion.
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. Fix shops.owner_id constraint → CASCADE
-- --------------------------------------------------------------------------
-- Wanneer een user wordt verwijderd, verwijder automatisch hun shop(s).
-- Dit triggert ook CASCADE op shop_id foreign keys in andere tabellen.

ALTER TABLE public.shops
DROP CONSTRAINT IF EXISTS shops_owner_id_fkey;

ALTER TABLE public.shops
ADD CONSTRAINT shops_owner_id_fkey
FOREIGN KEY (owner_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

COMMENT ON CONSTRAINT shops_owner_id_fkey ON public.shops IS
  'Cascade user deletion: verwijdert automatisch shops en alle gerelateerde data';

-- --------------------------------------------------------------------------
-- Het effect van deze wijziging:
-- --------------------------------------------------------------------------
-- Wanneer een user wordt verwijderd uit auth.users:
--   1. shops (ON DELETE CASCADE) → shop wordt verwijderd
--   2. api_keys (ON DELETE CASCADE via shop_id) → alle keys verwijderd
--   3. tryons (ON DELETE CASCADE via shop_id) → alle tryons verwijderd
--   4. products (ON DELETE CASCADE via shop_id) → alle producten verwijderd
--   5. studio_collections (ON DELETE CASCADE via shop_id) → collections verwijderd
--   6. studio_images (ON DELETE CASCADE via shop_id) → images verwijderd
--   7. custom_models (ON DELETE CASCADE via owner_id) → models verwijderd
--   8. topup_transactions (cascade via shop_id) → transacties verwijderd
-- --------------------------------------------------------------------------
