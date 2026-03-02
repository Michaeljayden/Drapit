// =============================================================================
// POST /api/tryon/process — Background Gemini VTON processor
// =============================================================================
// Called internally by /api/tryon immediately after creating the DB record.
// Runs the full Gemini VTON pipeline and updates the tryons table.
//
// Flow:
//   1. Validate internal secret (TRYON_PROCESS_SECRET)
//   2. Call Gemini VTON with human + garment images
//   3. Store result in Supabase Storage (bucket: results)
//   4. Update tryons record: status → succeeded / failed
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateVtonWithGemini } from '@/lib/gemini';

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Missing Supabase environment variables');
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

export async function POST(request: NextRequest) {
    // -----------------------------------------------------------------------
    // 1. Verify internal secret — prevents external abuse of this endpoint
    // -----------------------------------------------------------------------
    const secret = request.headers.get('X-Process-Secret');
    const expected = process.env.TRYON_PROCESS_SECRET;

    if (!expected || secret !== expected) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { tryon_id: string; human_image_url: string; garment_image_url: string; shop_id: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { tryon_id, human_image_url, garment_image_url, shop_id } = body;

    if (!tryon_id || !human_image_url || !garment_image_url || !shop_id) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    console.log(`[tryon/process] Starting Gemini VTON for tryon ${tryon_id}`);

    try {
        // -------------------------------------------------------------------
        // 2. Generate VTON image via Gemini
        // -------------------------------------------------------------------
        const resultBuffer = await generateVtonWithGemini(human_image_url, garment_image_url);

        // -------------------------------------------------------------------
        // 3. Store result in Supabase Storage (bucket: results)
        // -------------------------------------------------------------------
        const storagePath = `${shop_id}/${tryon_id}/result.jpg`;

        const { error: uploadError } = await supabase.storage
            .from('results')
            .upload(storagePath, resultBuffer, {
                contentType: 'image/jpeg',
                upsert: true,
            });

        if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

        const { data: urlData } = supabase.storage
            .from('results')
            .getPublicUrl(storagePath);

        const resultUrl = urlData.publicUrl;

        // -------------------------------------------------------------------
        // 4. Update tryons record → succeeded
        // -------------------------------------------------------------------
        await supabase
            .from('tryons')
            .update({
                status: 'succeeded',
                result_image_url: resultUrl,
                completed_at: new Date().toISOString(),
            })
            .eq('id', tryon_id);

        console.log(`[tryon/process] Tryon ${tryon_id} completed. Result: ${resultUrl}`);
        return NextResponse.json({ success: true, result_url: resultUrl });

    } catch (err) {
        console.error(`[tryon/process] Failed for tryon ${tryon_id}:`, err);

        // Update tryons record → failed
        await supabase
            .from('tryons')
            .update({
                status: 'failed',
                completed_at: new Date().toISOString(),
            })
            .eq('id', tryon_id);

        return NextResponse.json({ error: 'VTON generation failed' }, { status: 500 });
    }
}
