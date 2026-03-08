-- =============================================================================
-- 008: Studio Gallery — Save generated images with collections
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Collections table
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS studio_collections (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id     uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    name        text NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_studio_collections_shop ON studio_collections(shop_id);

-- ---------------------------------------------------------------------------
-- 2. Images table
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS studio_images (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id         uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    collection_id   uuid REFERENCES studio_collections(id) ON DELETE SET NULL,
    name            text NOT NULL,
    storage_path    text NOT NULL,
    url             text NOT NULL,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_studio_images_shop ON studio_images(shop_id);
CREATE INDEX idx_studio_images_collection ON studio_images(collection_id);

-- ---------------------------------------------------------------------------
-- 3. RLS policies
-- ---------------------------------------------------------------------------

ALTER TABLE studio_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_images ENABLE ROW LEVEL SECURITY;

-- Collections: shop owner can CRUD
CREATE POLICY "Shop owner can manage collections"
    ON studio_collections
    FOR ALL
    USING (
        shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
    )
    WITH CHECK (
        shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
    );

-- Images: shop owner can CRUD
CREATE POLICY "Shop owner can manage images"
    ON studio_images
    FOR ALL
    USING (
        shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
    )
    WITH CHECK (
        shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
    );

-- ---------------------------------------------------------------------------
-- 4. Storage bucket
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('studio-gallery', 'studio-gallery', true, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: authenticated users can upload to their shop folder
CREATE POLICY "Shop owner can upload gallery images"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'studio-gallery'
        AND auth.role() = 'authenticated'
    );

-- Storage policy: public read access
CREATE POLICY "Public read gallery images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'studio-gallery');

-- Storage policy: owner can delete their images
CREATE POLICY "Shop owner can delete gallery images"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'studio-gallery'
        AND auth.role() = 'authenticated'
    );
