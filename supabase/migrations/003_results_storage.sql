-- ============================================================================
-- Drapit — Results storage bucket + webhook support
-- ============================================================================
-- Adds:
--   1. Storage bucket: results (permanent storage for AI-generated images)
--   2. Cleanup function update to also clean results bucket
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. Storage bucket: results
-- --------------------------------------------------------------------------
-- The 'results' bucket stores the final AI-generated try-on images.
-- These persist longer than the temporary uploads in the 'tryons' bucket.
-- Public access is enabled so images can be served directly to end users.
-- --------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'results',
  'results',
  true,
  10485760,  -- 10 MB max
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Storage policies for the results bucket
-- Service role handles all operations from the webhook handler.
create policy "results_bucket_insert"
  on storage.objects for insert
  with check (bucket_id = 'results');

create policy "results_bucket_select"
  on storage.objects for select
  using (bucket_id = 'results');

create policy "results_bucket_delete"
  on storage.objects for delete
  using (bucket_id = 'results');

-- --------------------------------------------------------------------------
-- 2. Updated cleanup function: also cleans results bucket
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
    -- Delete from tryons bucket (user uploads)
    delete from storage.objects
    where bucket_id = 'tryons'
      and name like expired_record.shop_id || '/' || expired_record.id || '/%';

    -- Delete from results bucket (AI-generated images)
    delete from storage.objects
    where bucket_id = 'results'
      and name like expired_record.shop_id || '/' || expired_record.id || '/%';
  end loop;
end;
$$;

comment on function public.cleanup_expired_tryon_images is
  'Deletes try-on images from both tryons and results storage buckets that are older than 24 hours.';
