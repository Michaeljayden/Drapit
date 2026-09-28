// =============================================================================
// POST /api/billing/shopify/topup — buy a one-time try-on pack via Shopify
// =============================================================================
// Called from the dashboard billing page by a logged-in Shopify merchant.
// Creates an AppPurchaseOneTime and returns Shopify's confirmation URL.
//
// Body:    { pack_key: 'pack_100' | 'pack_500' | 'pack_1000' }
// Returns: { confirmation_url: string }
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { createOneTimeTryonPurchase, shopifyTryonPackByKey } from '@/lib/shopify-billing';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://drapit.io';

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } },
    );
}

export async function POST(request: NextRequest) {
    try {
        // 1. Must be a logged-in dashboard user
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
        }

        // 2. Validate pack
        let body: { pack_key?: string } = {};
        try { body = await request.json(); } catch { /* empty body */ }
        const pack = body.pack_key ? shopifyTryonPackByKey(body.pack_key) : null;
        if (!pack) {
            return NextResponse.json({ error: 'Onbekend try-on pack' }, { status: 400 });
        }

        // 3. Shop must belong to this user and be a Shopify-billed shop
        const admin = getSupabaseAdmin();
        const { data: shop, error: shopErr } = await admin
            .from('shops')
            .select('id, shopify_domain, shopify_access_token, billing_source')
            .eq('owner_id', user.id)
            .single();

        if (shopErr || !shop) {
            return NextResponse.json({ error: 'Shop niet gevonden' }, { status: 404 });
        }
        if (shop.billing_source !== 'shopify' || !shop.shopify_domain || !shop.shopify_access_token) {
            return NextResponse.json(
                { error: 'Extra try-ons via Shopify zijn alleen beschikbaar voor shops met Shopify-facturering' },
                { status: 400 },
            );
        }

        // 4. Pending audit row first — its id travels in the return URL so the
        //    callback can find and finalise exactly this purchase.
        const { data: tx, error: txErr } = await admin
            .from('topup_transactions')
            .insert({
                shop_id: shop.id,
                tryons_added: pack.tryons,
                amount_eur: pack.priceUsd, // column name is historical; value is the USD charge
                status: 'pending',
                trigger_type: 'manual',
                source: 'shopify',
                pack_key: pack.key,
            })
            .select('id')
            .single();

        if (txErr || !tx) {
            console.error('[billing/shopify/topup] Kon transactie niet aanmaken:', txErr);
            return NextResponse.json({ error: 'Kon aankoop niet starten' }, { status: 500 });
        }

        const returnUrl = `${APP_URL}/api/billing/shopify/topup/callback?tx=${tx.id}&shop=${encodeURIComponent(shop.shopify_domain)}`;

        // 5. Create the one-time purchase on Shopify
        const purchase = await createOneTimeTryonPurchase(
            shop.shopify_domain,
            shop.shopify_access_token,
            pack,
            returnUrl,
        );

        await admin
            .from('topup_transactions')
            .update({ shopify_purchase_id: purchase.purchase_id })
            .eq('id', tx.id);

        console.log(`[billing/shopify/topup] ${pack.key} aangemaakt voor ${shop.shopify_domain} (${purchase.purchase_id}, test=${purchase.test})`);

        return NextResponse.json({ confirmation_url: purchase.confirmation_url });
    } catch (err) {
        console.error('[billing/shopify/topup] Fout:', err);
        return NextResponse.json({ error: 'Aankoop starten mislukt' }, { status: 500 });
    }
}
