-- =============================================================================
-- 009: Custom Models — Sla AI-gegenereerde modellen op voor hergebruik
-- =============================================================================
-- Merchants kunnen gegenereerde modelbeelden opslaan als "eigen model"
-- en later hergebruiken in toekomstige digitale fotoshoots (studio only).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. custom_models tabel
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS custom_models (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id         uuid        NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    owner_id        uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name            text        NOT NULL,
    image_url       text        NOT NULL,
    storage_path    text,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_custom_models_shop  ON custom_models(shop_id);
CREATE INDEX IF NOT EXISTS idx_custom_models_owner ON custom_models(owner_id);

COMMENT ON TABLE  public.custom_models               IS 'Opgeslagen AI-modellen per merchant voor hergebruik in Studio';
COMMENT ON COLUMN public.custom_models.name          IS 'Door de merchant gegeven naam (bv. "Sophie – zomercampagne")';
COMMENT ON COLUMN public.custom_models.image_url     IS 'Publieke URL van het modelbeeld in Supabase Storage';
COMMENT ON COLUMN public.custom_models.storage_path  IS 'Pad in de custom_models storage bucket voor verwijdering';

-- ---------------------------------------------------------------------------
-- 2. RLS — alleen de eigenaar kan zijn eigen modellen zien en beheren
-- ---------------------------------------------------------------------------

ALTER TABLE custom_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner kan eigen modellen beheren"
    ON custom_models
    FOR ALL
    USING  (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 3. Storage bucket
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('custom_models', 'custom_models', true, 10485760)   -- 10 MB max per afbeelding
ON CONFLICT (id) DO NOTHING;

-- Geauthenticeerde gebruikers mogen uploaden
CREATE POLICY "Authenticated users can upload custom models"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'custom_models'
        AND auth.role() = 'authenticated'
    );

-- Publieke leestoegang (afbeeldingen worden als <img src> getoond)
CREATE POLICY "Public read custom models"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'custom_models');

-- Eigenaar mag eigen afbeeldingen verwijderen
CREATE POLICY "Authenticated users can delete custom models"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'custom_models'
        AND auth.role() = 'authenticated'
    );
