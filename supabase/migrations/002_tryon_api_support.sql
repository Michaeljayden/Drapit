-- ============================================================================
-- Drapit — Try-on API support functions & storage
-- ============================================================================
-- Adds:
--   1. RPC function: increment_tryons_count (atomic counter)
--   2. Storage bucket: tryons (with auto-cleanup policy note)
--   3. Scheduled cleanup function for expired try-on images (24h TTL)
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. RPC: Atomically increment tryons_this_month for a shop
-- --------------------------------------------------------------------------
create or replace function public.increment_tryons_count(shop_row_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.shops
  set tryons_this_month = tryons_this_month + 1
  where id = shop_row_id;
end;
$$;

comment on function public.increment_tryons_count is
  'Atomically increments the try-on counter for a shop. Called by the API after creating a prediction.';

-- --------------------------------------------------------------------------
-- 2. Storage bucket: tryons
-- --------------------------------------------------------------------------
-- Create the 'tryons' bucket if it doesn't already exist.
-- Public access is enabled so result images can be served directly.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tryons',
  'tryons',
  true,
  10485760,  -- 10 MB max file size
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Storage policy: service role can do anything (API routes use service role)
-- No user-facing RLS needed since only the backend writes to this bucket.
create policy "tryons_bucket_service_insert"
  on storage.objects for insert
  with check (bucket_id = 'tryons');

create policy "tryons_bucket_service_select"
  on storage.objects for select
  using (bucket_id = 'tryons');

create policy "tryons_bucket_service_delete"
  on storage.objects for delete
  using (bucket_id = 'tryons');

-- --------------------------------------------------------------------------
-- 3. Cleanup function: delete try-on images older than 24 hours
-- --------------------------------------------------------------------------
-- This function can be called via a Supabase CRON job (pg_cron) or
-- triggered externally. It deletes storage objects for completed/failed
-- try-ons older than 24 hours.
-- --------------------------------------------------------------------------
create or replace function public.cleanup_expired_tryon_images()
returns void
language plpgsql
security definer
as $$
declare
  expired_record record;
begin
  for expired_record in
    select id, shop_id
    from public.tryons
    where created_at < now() - interval '24 hours'
      and status in ('succeeded', 'failed')
  loop
    -- Delete the folder for this try-on from storage
    delete from storage.objects
    where bucket_id = 'tryons'
      and name like expired_record.shop_id || '/' || expired_record.id || '/%';
  end loop;
end;
$$;

comment on function public.cleanup_expired_tryon_images is
  'Deletes try-on images from storage that are older than 24 hours. Schedule with pg_cron.';

-- Schedule cleanup every hour (requires pg_cron extension)
-- Uncomment the following lines after enabling pg_cron in your Supabase project:
-- select cron.schedule(
--   'cleanup-tryon-images',
--   '0 * * * *',  -- every hour
--   $$ select public.cleanup_expired_tryon_images(); $$
-- );
