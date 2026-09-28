// =============================================================================
// GET /api/billing/shopify/topup/callback
// =============================================================================
// Shopify redirects the merchant here after approving (or declining) a
// one-time try-on pack purchase. We never trust the query string alone: the
// purchase status is re-read from Shopify and must be ACTIVE before the
// try-ons are credited. Idempotent — a second visit does not credit twice.
//
// Query: tx=<topup_transactions.id>  shop=<myshopify domain>
//        (Shopify may also append charge_id — not needed)
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getOneTimePurchaseStatus } from '@/lib/shopify-billing';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://drapit.io';
const BILLING = `${APP_URL}/dashboard/billing`;

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } },
    );
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const txId = searchParams.get('tx');
    const shopDomain = searchParams.get('shop');

    if (!txId || !shopDomain) {
        return NextResponse.redirect(`${BILLING}?topup=error&reason=missing_params`);
    }

    const admin = getSupabaseAdmin();

    const { data: tx } = await admin
        .from('topup_transactions')
        .select('id, shop_id, status, tryons_added, shopify_purchase_id')
        .eq('id', txId)
        .eq('source', 'shopify')
        .single();

    if (!tx || !tx.shopify_purchase_id) {
        return NextResponse.redirect(`${BILLING}?topup=error&reason=unknown_purchase`);
    }

    // Already credited (merchant refreshed / revisited the return URL)
    if (tx.status === 'succeeded') {
        return NextResponse.redirect(`${BILLING}?topup=success&tryons=${tx.tryons_added}`);
    }

    const { data: shop } = await admin
        .from('shops')
        .select('id, shopify_domain, shopify_access_token, extra_tryons')
        .eq('id', tx.shop_id)
        .single();

    if (!shop || shop.shopify_domain !== shopDomain || !shop.shopify_access_token) {
        return NextResponse.redirect(`${BILLING}?topup=error&reason=shop_mismatch`);
    }

    try {
        const status = await getOneTimePurchaseStatus(
            shop.shopify_domain,
            shop.shopify_access_token,
            tx.shopify_purchase_id,
        );

        if (status !== 'ACTIVE') {
            await admin
                .from('topup_transactions')
                .update({ status: 'failed', failure_reason: `shopify_status_${status.toLowerCase()}` })
                .eq('id', tx.id)
                .eq('status', 'pending');
            console.log(`[billing/shopify/topup/callback] ${tx.id} niet actief (${status})`);
            return NextResponse.redirect(`${BILLING}?topup=declined`);
        }

        // Claim the pending row first so two concurrent callbacks can't both credit.
        const { data: claimed } = await admin
            .from('topup_transactions')
            .update({ status: 'succeeded' })
            .eq('id', tx.id)
            .eq('status', 'pending')
            .select('id')
            .maybeSingle();

        if (!claimed) {
            return NextResponse.redirect(`${BILLING}?topup=success&tryons=${tx.tryons_added}`);
        }

        const currentExtra = (shop.extra_tryons as number) ?? 0;
        const { error: updErr } = await admin
            .from('shops')
            .update({ extra_tryons: currentExtra + tx.tryons_added })
            .eq('id', shop.id);

        if (updErr) {
            // Roll the claim back so the merchant can retry via the return URL.
            await admin.from('topup_transactions').update({ status: 'pending' }).eq('id', tx.id);
            throw updErr;
        }

        console.log(`[billing/shopify/topup/callback] +${tx.tryons_added} try-ons voor ${shop.shopify_domain}`);
        return NextResponse.redirect(`${BILLING}?topup=success&tryons=${tx.tryons_added}`);
    } catch (err) {
        console.error('[billing/shopify/topup/callback] Fout:', err);
        return NextResponse.redirect(`${BILLING}?topup=error&reason=verify_failed`);
    }
}
