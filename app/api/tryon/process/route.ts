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
import { generateBottomLayerWithGemini } from '@/lib/gemini-outfit';

// Gemini usually needs 15–30 s. Netlify allows this function 60 s (netlify.toml);
// declare it here too so the Next.js runtime never cuts it off earlier.
export const maxDuration = 60;

// One automatic retry when Gemini returns no image or a transient API error,
// but only if the first attempt left enough time for a second one.
const RETRY_BUDGET_MS = 25_000;

function isRetryable(err: unknown): boolean {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.startsWith('Missing GEMINI_API_KEY')) return false;
    if (msg.startsWith('Failed to fetch human image') || msg.startsWith('Failed to fetch garment image')) return false;
    return true;
}

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

    let body: { tryon_id: string; human_image_url: string; garment_image_url: string; shop_id: string; layer?: 'bottom' | null };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { tryon_id, human_image_url, garment_image_url, shop_id, layer } = body;

    if (!tryon_id || !human_image_url || !garment_image_url || !shop_id) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    console.log(`[tryon/process] Starting Gemini VTON for tryon ${tryon_id}`);

    try {
        // -------------------------------------------------------------------
        // 2. Generate VTON image via Gemini
        // -------------------------------------------------------------------
        // Outfit flow: second layer (bottom) uses its own prompt. Everything else
        // goes through the unchanged single-garment generator.
        const generate = () => layer === 'bottom'
            ? generateBottomLayerWithGemini(human_image_url, garment_image_url)
            : generateVtonWithGemini(human_image_url, garment_image_url);

        const startedAt = Date.now();
        let resultBuffer: Buffer;
        try {
            resultBuffer = await generate();
        } catch (firstErr) {
            const elapsed = Date.now() - startedAt;
            if (!isRetryable(firstErr) || elapsed > RETRY_BUDGET_MS) throw firstErr;
            console.warn(`[tryon/process] Attempt 1 failed after ${elapsed} ms for ${tryon_id}, retrying once:`, firstErr);
            resultBuffer = await generate();
        }

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
