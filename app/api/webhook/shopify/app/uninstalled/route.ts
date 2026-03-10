// =============================================================================
// POST /api/webhook/shopify/app/uninstalled
// =============================================================================
// Shopify triggers this webhook immediately when a merchant uninstalls the app.
//
// Actions:
//  1. Verify HMAC signature
//  2. Mark shop as uninstalled (shopify_app_installed = false)
//  3. Clear the access token (no longer valid after uninstall)
//  4. Downgrade plan to 'trial' — Shopify automatically cancels the billing charge
//     on their end; we just reflect that here.
//  5. Clear shopify_charge_id
//
// Note: GDPR shop/redact fires 48h later — that's where actual data deletion happens.
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
        console.error('[app/uninstalled] HMAC verification failed');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Parse payload
    let payload: { domain: string; id: number };
    try {
        payload = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const shopDomain = payload.domain;
    console.log(`[app/uninstalled] App uninstalled by: ${shopDomain}`);

    const admin = getSupabaseAdmin();

    // 4. Update shop record
    const { error } = await admin
        .from('shops')
        .update({
            shopify_app_installed: false,
            shopify_access_token: null,   // Token is revoked by Shopify on uninstall
            plan: 'trial',
            monthly_tryon_limit: 20,
            shopify_charge_id: null,      // Billing is cancelled by Shopify automatically
        })
        .eq('shopify_domain', shopDomain);

    if (error) {
        console.error('[app/uninstalled] DB update failed:', error);
        // Still return 200 — Shopify will retry on non-2xx
    }

    return NextResponse.json({ acknowledged: true }, { status: 200 });
}
