// =============================================================================
// GET/POST /api/studio/gallery — List & save studio images
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
// GET — List saved images (optional ?collection_id= filter)
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const shopId = await getShopId(supabase);
  if (!shopId) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const collectionId = req.nextUrl.searchParams.get('collection_id');

  const admin = getAdmin();
  let query = admin
    .from('studio_images')
    .select('id, name, url, collection_id, created_at')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false });

  if (collectionId === 'none') {
    query = query.is('collection_id', null);
  } else if (collectionId) {
    query = query.eq('collection_id', collectionId);
  }

  const { data: images, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Kon afbeeldingen niet ophalen.' }, { status: 500 });
  }

  return NextResponse.json({ images: images ?? [] });
}

// ---------------------------------------------------------------------------
// POST — Save a generated image (upload base64 to Storage + insert metadata)
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const shopId = await getShopId(supabase);
  if (!shopId) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  let body: { image: string; name: string; collection_id?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Ongeldige JSON.' }, { status: 400 });
  }

  const { image, name, collection_id } = body;

  if (!image || !name?.trim()) {
    return NextResponse.json({ error: 'Afbeelding en naam zijn verplicht.' }, { status: 400 });
  }

  // Convert base64 data URL to buffer
  const matches = image.match(/^data:image\/([\w+]+);base64,(.+)$/);
  if (!matches) {
    return NextResponse.json({ error: 'Ongeldig afbeeldingsformaat.' }, { status: 400 });
  }

  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const storagePath = `${shopId}/${crypto.randomUUID()}.${ext}`;

  const admin = getAdmin();

  // Upload to Supabase Storage
  const { error: uploadError } = await admin.storage
    .from('studio-gallery')
    .upload(storagePath, buffer, {
      contentType: `image/${matches[1]}`,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: 'Upload mislukt.' }, { status: 500 });
  }

  // Get public URL
  const { data: urlData } = admin.storage
    .from('studio-gallery')
    .getPublicUrl(storagePath);

  const url = urlData.publicUrl;

  // Insert metadata
  const { data: record, error: insertError } = await admin
    .from('studio_images')
    .insert({
      shop_id: shopId,
      collection_id: collection_id || null,
      name: name.trim(),
      storage_path: storagePath,
      url,
    })
    .select('id, name, url, collection_id, created_at')
    .single();

  if (insertError) {
    // Clean up uploaded file
    await admin.storage.from('studio-gallery').remove([storagePath]);
    return NextResponse.json({ error: 'Kon afbeelding niet opslaan.' }, { status: 500 });
  }

  return NextResponse.json({ image: record }, { status: 201 });
}
