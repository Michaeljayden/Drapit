// =============================================================================
// PATCH/DELETE /api/studio/collections/[id] — Update & delete collections
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
// PATCH — Rename collection
// ---------------------------------------------------------------------------

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const shopId = await getShopId(supabase);
  if (!shopId) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Ongeldige JSON.' }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: 'Naam is verplicht.' }, { status: 400 });
  }

  const admin = getAdmin();
  const { data, error } = await admin
    .from('studio_collections')
    .update({ name })
    .eq('id', id)
    .eq('shop_id', shopId)
    .select('id, name, created_at')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Collectie niet gevonden.' }, { status: 404 });
  }

  return NextResponse.json({ collection: data });
}

// ---------------------------------------------------------------------------
// DELETE — Delete collection (images stay, collection_id set to null)
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
  const { error } = await admin
    .from('studio_collections')
    .delete()
    .eq('id', id)
    .eq('shop_id', shopId);

  if (error) {
    return NextResponse.json({ error: 'Kon collectie niet verwijderen.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
