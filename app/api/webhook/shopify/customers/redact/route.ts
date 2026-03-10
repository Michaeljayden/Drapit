// =============================================================================
// POST /api/webhook/shopify/customers/redact
// =============================================================================
// GDPR webhook — Shopify triggers this when a merchant submits a customer
// erasure request (right to be forgotten / GDPR Article 17).
//
// Drapit must delete all personal data associated with this customer:
//   - try-on result images in Supabase Storage
//   - tryon rows in the database
//   - any uploaded garment/user photos linked to this customer session
//
// Required response: 200 OK within 5 seconds.
// The actual deletion can happen asynchronously after acknowledging.
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
        console.error('[gdpr/customers/redact] HMAC verification failed');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Parse payload
    let payload: {
        shop_id: number;
        shop_domain: string;
        customer: { id: number; email: string; phone?: string };
        orders_to_redact: number[];
    };

    try {
        payload = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { shop_domain, customer } = payload;

    console.log(
        `[gdpr/customers/redact] Erasure request for customer ${customer.id} (${customer.email}) from ${shop_domain}`,
    );

    // 4. Acknowledge immediately, then delete data asynchronously
    //    (Shopify requires a 200 within 5 seconds; deletion may take longer)
    deleteCustomerData(shop_domain, customer.id, customer.email).catch((err) =>
        console.error('[gdpr/customers/redact] Async deletion error:', err),
    );

    return NextResponse.json({ acknowledged: true }, { status: 200 });
}

// ---------------------------------------------------------------------------
// Async data deletion
// ---------------------------------------------------------------------------
async function deleteCustomerData(
    shopDomain: string,
    customerId: number,
    customerEmail: string,
): Promise<void> {
    const admin = getSupabaseAdmin();

    try {
        // Find the shop record
        const { data: shop } = await admin
            .from('shops')
            .select('id')
            .eq('shopify_domain', shopDomain)
            .maybeSingle();

        if (shop) {
            // Fetch tryon records for this shop to delete Storage files
            const { data: tryons } = await admin
                .from('tryons')
                .select('id, garment_image_url, user_image_url, result_image_url')
                .eq('shop_id', shop.id);

            if (tryons && tryons.length > 0) {
                // Delete Storage objects
                const storagePaths: string[] = [];
                for (const tryon of tryons) {
                    for (const url of [
                        tryon.garment_image_url,
                        tryon.user_image_url,
                        tryon.result_image_url,
                    ]) {
                        if (url) {
                            // Extract storage path from URL
                            const match = url.match(/\/storage\/v1\/object\/public\/(.+)/);
                            if (match) storagePaths.push(match[1]);
                        }
                    }
                }

                if (storagePaths.length > 0) {
                    // Group by bucket and delete
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

                // Delete tryon rows
                const tryonIds = tryons.map((t) => t.id);
                await admin.from('tryons').delete().in('id', tryonIds);
            }
        }

        // Log completion for audit trail
        await admin.from('gdpr_requests').upsert({
            type: 'customer_redact',
            shop_domain: shopDomain,
            customer_id: String(customerId),
            customer_email: customerEmail,
            requested_at: new Date().toISOString(),
            status: 'completed',
        }, { onConflict: 'shop_domain,customer_id,type' });

        console.log(
            `[gdpr/customers/redact] Completed erasure for customer ${customerId} from ${shopDomain}`,
        );
    } catch (err) {
        console.error('[gdpr/customers/redact] Deletion failed:', err);

        // Log failure for audit trail
        await admin.from('gdpr_requests').upsert({
            type: 'customer_redact',
            shop_domain: shopDomain,
            customer_id: String(customerId),
            customer_email: customerEmail,
            requested_at: new Date().toISOString(),
            status: 'failed',
        }, { onConflict: 'shop_domain,customer_id,type' });
    }
}
