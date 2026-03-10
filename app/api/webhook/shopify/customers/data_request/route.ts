// =============================================================================
// POST /api/webhook/shopify/customers/data_request
// =============================================================================
// GDPR webhook — Shopify triggers this when a customer requests a copy of
// their personal data from a merchant's store.
//
// Drapit stores the following customer-related data:
//   - try-on images (garment + user photo) in Supabase Storage
//   - tryon rows linked to shop_id (no direct customer PII beyond session data)
//
// Required response: 200 OK within 5 seconds.
// Shopify does NOT require you to send the data back in this response — you
// must process the request and respond to the customer through your own flow.
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
    // 1. Read raw body (required for HMAC verification)
    const rawBody = await request.text();
    const hmacHeader = request.headers.get('x-shopify-hmac-sha256');

    // 2. Verify HMAC signature
    const isValid = await verifyShopifyWebhookHmac(rawBody, hmacHeader);
    if (!isValid) {
        console.error('[gdpr/data_request] HMAC verification failed');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Parse payload
    let payload: {
        shop_id: number;
        shop_domain: string;
        customer: { id: number; email: string; phone?: string };
        orders_requested: number[];
    };

    try {
        payload = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { shop_domain, customer } = payload;

    console.log(
        `[gdpr/data_request] Data request for customer ${customer.id} (${customer.email}) from ${shop_domain}`,
    );

    // 4. Look up any try-on records linked to this shop + customer email
    //    Drapit does not store customer email directly on tryon rows, but logs
    //    the request for compliance audit purposes.
    try {
        const admin = getSupabaseAdmin();

        // Log the data request for audit trail
        await admin.from('gdpr_requests').upsert({
            type: 'data_request',
            shop_domain,
            customer_id: String(customer.id),
            customer_email: customer.email,
            requested_at: new Date().toISOString(),
            status: 'received',
        }, { onConflict: 'shop_domain,customer_id,type' });

    } catch (err) {
        // Log but don't fail — Shopify expects 200 regardless
        console.error('[gdpr/data_request] DB log error:', err);
    }

    // 5. Respond 200 — Shopify requires this within 5 seconds
    return NextResponse.json({ acknowledged: true }, { status: 200 });
}
