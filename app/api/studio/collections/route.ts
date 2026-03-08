// =============================================================================
// GET/POST /api/studio/collections — List & create studio collections
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
// GET — List collections with image count
// ---------------------------------------------------------------------------

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const shopId = await getShopId(supabase);
  if (!shopId) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const admin = getAdmin();

  // Fetch collections
  const { data: collections, error } = await admin
    .from('studio_collections')
    .select('id, name, created_at')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Kon collecties niet ophalen.' }, { status: 500 });
  }

  // Count images per collection
  const { data: counts } = await admin
    .from('studio_images')
    .select('collection_id')
    .eq('shop_id', shopId);

  const countMap: Record<string, number> = {};
  for (const row of counts ?? []) {
    if (row.collection_id) {
      countMap[row.collection_id] = (countMap[row.collection_id] ?? 0) + 1;
    }
  }

  const result = (collections ?? []).map((c) => ({
    ...c,
    image_count: countMap[c.id] ?? 0,
  }));

  return NextResponse.json({ collections: result });
}

// ---------------------------------------------------------------------------
// POST — Create a new collection
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
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
    .insert({ shop_id: shopId, name })
    .select('id, name, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Kon collectie niet aanmaken.' }, { status: 500 });
  }

  return NextResponse.json({ collection: { ...data, image_count: 0 } }, { status: 201 });
}
