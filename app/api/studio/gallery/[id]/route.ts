// =============================================================================
// PATCH/DELETE /api/studio/gallery/[id] — Update & delete studio images
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';

function getAdmin() {
  return createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

async function getShopId(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  const { data: shop } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', user.id)
    .single();
  return shop?.id ?? null;
}

// ---------------------------------------------------------------------------
// PATCH — Update image name or collection
// ---------------------------------------------------------------------------

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const shopId = await getShopId(supabase);
  if (!shopId) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  let body: { name?: string; collection_id?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Ongeldige JSON.' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name.trim();
  if ('collection_id' in body) updates.collection_id = body.collection_id || null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Geen wijzigingen.' }, { status: 400 });
  }

  const admin = getAdmin();
  const { data, error } = await admin
    .from('studio_images')
    .update(updates)
    .eq('id', id)
    .eq('shop_id', shopId)
    .select('id, name, url, collection_id, created_at')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Afbeelding niet gevonden.' }, { status: 404 });
  }

  return NextResponse.json({ image: data });
}

// ---------------------------------------------------------------------------
// DELETE — Delete image (storage file + DB record)
// ---------------------------------------------------------------------------

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const shopId = await getShopId(supabase);
  if (!shopId) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const admin = getAdmin();

  // Fetch storage path before deleting
  const { data: image } = await admin
    .from('studio_images')
    .select('storage_path')
    .eq('id', id)
    .eq('shop_id', shopId)
    .single();

  if (!image) {
    return NextResponse.json({ error: 'Afbeelding niet gevonden.' }, { status: 404 });
  }

  // Delete from storage
  await admin.storage.from('studio-gallery').remove([image.storage_path]);

  // Delete DB record
  const { error } = await admin
    .from('studio_images')
    .delete()
    .eq('id', id)
    .eq('shop_id', shopId);

  if (error) {
    return NextResponse.json({ error: 'Kon afbeelding niet verwijderen.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
