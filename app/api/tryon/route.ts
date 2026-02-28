// =============================================================================
// POST /api/tryon — Central try-on API route
// =============================================================================
// 1. Authenticate via X-Drapit-Key header (SHA-256 hash lookup)
// 2. Check monthly try-on limit
// 3. Validate request body with Zod
// 4. Store images in Supabase Storage (bucket: tryons)
// 5. Create DB record with status 'pending'
// 6. Create async Replicate prediction (viktorfa/idm-vton)
// 7. Return { tryon_id, status: 'pending' }
// 8. Increment tryons_this_month
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { createTryOnPrediction } from '@/lib/replicate';
import { sendUsageAlertEmail } from '@/lib/email';

// ---------------------------------------------------------------------------
// CORS helpers — widget runs on external domains (Shopify, WooCommerce, etc.)
// ---------------------------------------------------------------------------
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Drapit-Key',
};

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ---------------------------------------------------------------------------
// Supabase admin client (service role — bypasses RLS, untyped for flexibility)
// ---------------------------------------------------------------------------
function getSupabaseAdmin(): SupabaseClient {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        throw new Error('Missing Supabase environment variables');
    }
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

// ---------------------------------------------------------------------------
// SHA-256 hashing (Web Crypto — works in Edge runtime)
// ---------------------------------------------------------------------------
async function sha256(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------------------
// Request validation schema
// ---------------------------------------------------------------------------
const tryOnRequestSchema = z.object({
    product_image_url: z.string().url('product_image_url must be a valid URL'),
    user_photo_url: z.string().url('user_photo_url must be a valid URL'),
    product_id: z.string().min(1, 'product_id is required'),
    buy_url: z.string().url('buy_url must be a valid URL'),
});

// ---------------------------------------------------------------------------
// Helper: download image from URL and upload to Supabase Storage
// ---------------------------------------------------------------------------
async function storeImageInBucket(
    supabase: SupabaseClient,
    imageUrl: string,
    storagePath: string
): Promise<string> {
    // Download the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch image from ${imageUrl}: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const imageBuffer = await response.arrayBuffer();

    // Upload to Supabase Storage
    const { error } = await supabase.storage
        .from('tryons')
        .upload(storagePath, imageBuffer, {
            contentType,
            upsert: true,
        });

    if (error) {
        throw new Error(`Storage upload failed for ${storagePath}: ${error.message}`);
    }

    // Return the public URL
    const { data: urlData } = supabase.storage
        .from('tryons')
        .getPublicUrl(storagePath);

    return urlData.publicUrl;
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
    try {
        const supabase = getSupabaseAdmin();

        // ---------------------------------------------------------------
        // 1. AUTHENTICATION — X-Drapit-Key header
        // ---------------------------------------------------------------
        const apiKey = request.headers.get('X-Drapit-Key');
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Missing X-Drapit-Key header' },
                { status: 401, headers: CORS_HEADERS }
            );
        }

        const keyHash = await sha256(apiKey);

        const { data: keyRow, error: keyError } = await supabase
            .from('api_keys')
            .select('id, shop_id, is_active')
            .eq('key_hash', keyHash)
            .single();

        if (keyError || !keyRow) {
            return NextResponse.json(
                { error: 'Invalid API key' },
                { status: 401, headers: CORS_HEADERS }
            );
        }

        if (!keyRow.is_active) {
            return NextResponse.json(
                { error: 'API key is deactivated' },
                { status: 401, headers: CORS_HEADERS }
            );
        }

        const shopId = keyRow.shop_id;

        // Update last_used_at on the API key (fire-and-forget)
        supabase
            .from('api_keys')
            .update({ last_used_at: new Date().toISOString() })
            .eq('id', keyRow.id)
            .then();

        // ---------------------------------------------------------------
        // 2. LIMIT CHECK — tryons_this_month < monthly_tryon_limit
        // ---------------------------------------------------------------
        const { data: shop, error: shopError } = await supabase
            .from('shops')
            .select('id, tryons_this_month, monthly_tryon_limit, email, name')
            .eq('id', shopId)
            .single();

        if (shopError || !shop) {
            return NextResponse.json(
                { error: 'Shop not found' },
                { status: 404, headers: CORS_HEADERS }
            );
        }

        if (shop.tryons_this_month >= shop.monthly_tryon_limit) {
            return NextResponse.json(
                {
                    error: 'Monthly try-on limit reached',
                    limit: shop.monthly_tryon_limit,
                    used: shop.tryons_this_month,
                },
                { status: 429, headers: CORS_HEADERS }
            );
        }

        // ---------------------------------------------------------------
        // 3. VALIDATE request body with Zod
        // ---------------------------------------------------------------
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: 'Invalid JSON body' },
                { status: 400, headers: CORS_HEADERS }
            );
        }

        const parseResult = tryOnRequestSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: parseResult.error.issues.map((i) => ({
                        field: i.path.join('.'),
                        message: i.message,
                    })),
                },
                { status: 400, headers: CORS_HEADERS }
            );
        }

        const { product_image_url, user_photo_url, product_id } =
            parseResult.data;

        // ---------------------------------------------------------------
        // 5. DATABASE — create try-on record (status: 'pending')
        //    (Doing this before storage so we have the tryon_id for paths)
        // ---------------------------------------------------------------
        const { data: tryon, error: tryonError } = await supabase
            .from('tryons')
            .insert({
                shop_id: shopId,
                product_id,
                product_image_url,
                user_photo_url,
                status: 'pending',
                replicate_prediction_id: null,
                result_image_url: null,
            })
            .select('id')
            .single();

        if (tryonError || !tryon) {
            console.error('[tryon] DB insert error:', tryonError);
            return NextResponse.json(
                { error: 'Failed to create try-on record' },
                { status: 500, headers: CORS_HEADERS }
            );
        }

        const tryonId = tryon.id;

        // ---------------------------------------------------------------
        // 4. SUPABASE STORAGE — store both images in bucket 'tryons'
        //    Path: {shop_id}/{tryon_id}/product.jpg & user.jpg
        // ---------------------------------------------------------------
        let storedProductUrl: string;
        let storedUserUrl: string;

        try {
            [storedProductUrl, storedUserUrl] = await Promise.all([
                storeImageInBucket(
                    supabase,
                    product_image_url,
                    `${shopId}/${tryonId}/product.jpg`
                ),
                storeImageInBucket(
                    supabase,
                    user_photo_url,
                    `${shopId}/${tryonId}/user.jpg`
                ),
            ]);
        } catch (storageErr) {
            console.error('[tryon] Storage error:', storageErr);
            // Update try-on record to failed
            await supabase
                .from('tryons')
                .update({ status: 'failed' })
                .eq('id', tryonId);

            return NextResponse.json(
                { error: 'Failed to store images' },
                { status: 500, headers: CORS_HEADERS }
            );
        }

        // Update the try-on record with stored URLs
        await supabase
            .from('tryons')
            .update({
                product_image_url: storedProductUrl,
                user_photo_url: storedUserUrl,
            })
            .eq('id', tryonId);

        // ---------------------------------------------------------------
        // 6. REPLICATE API — viktorfa/idm-vton (async with webhook)
        //    Webhook URL from NEXT_PUBLIC_APP_URL env var
        // ---------------------------------------------------------------
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://drapit.io';
        const webhookUrl = `${appUrl}/api/webhook/replicate`;

        let prediction;
        try {
            prediction = await createTryOnPrediction(
                {
                    human_img: user_photo_url,
                    garm_img: product_image_url,
                    garment_des: 'clothing item',
                    is_checked: true,
                    is_checked_crop: false,
                    denoise_steps: 30,
                    seed: 42,
                },
                webhookUrl,
                ['completed']
            );
        } catch (replicateErr) {
            const replicateErrMsg = replicateErr instanceof Error ? replicateErr.message : String(replicateErr);
            console.error('[tryon] Replicate error:', replicateErrMsg);
            await supabase
                .from('tryons')
                .update({ status: 'failed' })
                .eq('id', tryonId);

            return NextResponse.json(
                { error: 'Failed to start AI prediction', detail: replicateErrMsg },
                { status: 502, headers: CORS_HEADERS }
            );
        }

        // Save the Replicate prediction ID
        await supabase
            .from('tryons')
            .update({ replicate_prediction_id: prediction.id })
            .eq('id', tryonId);

        // ---------------------------------------------------------------
        // 8. INCREMENT tryons_this_month + usage alerts
        // ---------------------------------------------------------------
        await supabase.rpc('increment_tryons_count', { shop_row_id: shopId });

        // Fire usage alert emails at exactly 80% and 100% thresholds (fire-and-forget)
        const newCount = shop.tryons_this_month + 1;
        const limit = shop.monthly_tryon_limit;
        const shopEmail = shop.email as string | null;
        const shopName = (shop.name as string) || 'Drapit merchant';

        if (shopEmail && !shopEmail.includes('shopify-placeholder')) {
            const eightyPct = Math.floor(limit * 0.8);
            if (newCount === eightyPct) {
                sendUsageAlertEmail(shopEmail, shopName, newCount, limit, 80).catch(console.error);
            } else if (newCount >= limit) {
                sendUsageAlertEmail(shopEmail, shopName, newCount, limit, 100).catch(console.error);
            }
        }

        // ---------------------------------------------------------------
        // 7. RESPONSE — return immediately
        // ---------------------------------------------------------------
        return NextResponse.json(
            {
                tryon_id: tryonId,
                status: 'pending',
            },
            { status: 201, headers: CORS_HEADERS }
        );
    } catch (error) {
        console.error('[tryon] Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500, headers: CORS_HEADERS }
        );
    }
}
