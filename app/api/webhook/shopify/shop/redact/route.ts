// =============================================================================
// POST /api/webhook/shopify/shop/redact
// =============================================================================
// GDPR webhook — Shopify triggers this 48 hours after a merchant uninstalls
// the app. At that point all shop data (including any customer data linked to
// the shop) must be permanently deleted.
//
// Drapit must delete:
//   - the shop record in the shops table
//   - all tryon records linked to the shop
//   - all Storage files (garment, user, result images) linked to the shop
//   - the Shopify access token stored for the shop
//
// Required response: 200 OK within 5 seconds.
// Actual deletion runs asynchronously.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyShopifyWebhookHmac } from '@/lib/shopify-webhook';

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } },
    );
}

export async function POST(request: NextRequest) {
    // 1. Read raw body
    const rawBody = await request.text();
    const hmacHeader = request.headers.get('x-shopify-hmac-sha256');

    // 2. Verify HMAC
    const isValid = await verifyShopifyWebhookHmac(rawBody, hmacHeader);
    if (!isValid) {
        console.error('[gdpr/shop/redact] HMAC verification failed');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Parse payload
    let payload: {
        shop_id: number;
        shop_domain: string;
    };

    try {
        payload = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { shop_domain } = payload;

    console.log(`[gdpr/shop/redact] Redact request for shop: ${shop_domain}`);

    // 4. Acknowledge immediately, delete asynchronously
    deleteShopData(shop_domain).catch((err) =>
        console.error('[gdpr/shop/redact] Async deletion error:', err),
    );

    return NextResponse.json({ acknowledged: true }, { status: 200 });
}

// ---------------------------------------------------------------------------
// Async shop data deletion
// ---------------------------------------------------------------------------
async function deleteShopData(shopDomain: string): Promise<void> {
    const admin = getSupabaseAdmin();

    try {
        // Find the shop
        const { data: shop } = await admin
            .from('shops')
            .select('id')
            .eq('shopify_domain', shopDomain)
            .maybeSingle();

        if (!shop) {
            console.log(`[gdpr/shop/redact] Shop ${shopDomain} not found — already deleted or never stored`);
            return;
        }

        // 1. Fetch all tryon records to delete Storage files
        const { data: tryons } = await admin
            .from('tryons')
            .select('garment_image_url, user_image_url, result_image_url')
            .eq('shop_id', shop.id);

        if (tryons && tryons.length > 0) {
            const storagePaths: string[] = [];
            for (const tryon of tryons) {
                for (const url of [
                    tryon.garment_image_url,
                    tryon.user_image_url,
                    tryon.result_image_url,
                ]) {
                    if (url) {
                        const match = url.match(/\/storage\/v1\/object\/public\/(.+)/);
                        if (match) storagePaths.push(match[1]);
                    }
                }
            }

            if (storagePaths.length > 0) {
                const byBucket: Record<string, string[]> = {};
                for (const path of storagePaths) {
                    const [bucket, ...rest] = path.split('/');
                    if (!byBucket[bucket]) byBucket[bucket] = [];
                    byBucket[bucket].push(rest.join('/'));
                }
                for (const [bucket, paths] of Object.entries(byBucket)) {
                    await admin.storage.from(bucket).remove(paths);
                }
            }
        }

        // 2. Delete tryon records
        await admin.from('tryons').delete().eq('shop_id', shop.id);

        // 3. Delete GDPR request logs for this shop
        await admin.from('gdpr_requests').delete().eq('shop_domain', shopDomain);

        // 4. Delete the shop itself (also removes access token)
        await admin.from('shops').delete().eq('id', shop.id);

        console.log(`[gdpr/shop/redact] Completed full redact for shop: ${shopDomain}`);
    } catch (err) {
        console.error('[gdpr/shop/redact] Deletion failed for', shopDomain, err);
    }
}
