// =============================================================================
// POST /api/webhook/shopify/app_subscriptions/update
// =============================================================================
// Shopify fires this whenever a Managed Pricing subscription changes state
// (created, activated, cancelled, declined, frozen). We keep shops.plan and
// monthly_tryon_limit in sync so the dashboard + try-on limits reflect the
// merchant's current Shopify plan — without any off-platform billing.
//
//   1. Verify HMAC
//   2. Read shop domain (X-Shopify-Shop-Domain header)
//   3. Map the subscription name → plan key + limit
//   4. Update the shop (ACTIVE → plan; otherwise → trial)
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyShopifyWebhookHmac } from '@/lib/shopify-webhook';
import { mapShopifyPlanNameToKey, planLimitForKey } from '@/lib/shopify-managed-pricing';

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } },
    );
}

export async function POST(request: NextRequest) {
    const rawBody = await request.text();
    const hmacHeader = request.headers.get('x-shopify-hmac-sha256');

    const isValid = await verifyShopifyWebhookHmac(rawBody, hmacHeader);
    if (!isValid) {
        console.error('[app_subscriptions/update] HMAC verification failed');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const shopDomain = request.headers.get('x-shopify-shop-domain');

    let payload: { app_subscription?: { name?: string; status?: string } };
    try {
        payload = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const sub = payload.app_subscription;
    if (!shopDomain || !sub) {
        return NextResponse.json({ acknowledged: true }, { status: 200 });
    }

    const admin = getSupabaseAdmin();
    const status = (sub.status || '').toUpperCase();

    let update: Record<string, unknown>;
    if (status === 'ACTIVE') {
        const plan = mapShopifyPlanNameToKey(sub.name || '');
        update = {
            plan,
            monthly_tryon_limit: planLimitForKey(plan),
            billing_source: 'shopify',
        };
    } else {
        // CANCELLED / DECLINED / EXPIRED / FROZEN → fall back to trial.
        update = { plan: 'trial', monthly_tryon_limit: 20 };
    }

    const { error } = await admin.from('shops').update(update).eq('shopify_domain', shopDomain);
    if (error) {
        console.error('[app_subscriptions/update] DB update failed:', error.message);
        // Return 200 anyway so Shopify doesn't hammer retries; logged for follow-up.
    }

    console.log(`[app_subscriptions/update] ${shopDomain} → ${status} (${sub.name})`);
    return NextResponse.json({ acknowledged: true }, { status: 200 });
}
