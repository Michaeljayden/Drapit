// =============================================================================
// GET /api/billing/shopify/callback
// =============================================================================
// Shopify redirects the merchant here after they approve (or decline) a
// RecurringApplicationCharge on Shopify's billing approval page.
//
// Query params from Shopify:
//   charge_id  — the charge ID to activate
//   shop       — the merchant's myshopify.com domain
//   plan       — our plan key (we added this to the return_url in create)
//
// On success: activate charge → update shops table → redirect to dashboard
// On decline: redirect to billing page with error message
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { activateSubscription, planLimitForShopifyPlan } from '@/lib/shopify-billing';
import type { Plan } from '@/lib/supabase/types';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://drapit.io';

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } },
    );
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const chargeId  = searchParams.get('charge_id');
    const shopDomain = searchParams.get('shop');
    const plan       = searchParams.get('plan') as Plan | null;

    // Missing params → something went wrong
    if (!chargeId || !shopDomain || !plan) {
        console.error('[billing/shopify/callback] Missing params', { chargeId, shopDomain, plan });
        return NextResponse.redirect(`${APP_URL}/dashboard/billing?error=missing_params`);
    }

    const admin = getSupabaseAdmin();

    // Fetch shop by domain
    const { data: shop, error: shopErr } = await admin
        .from('shops')
        .select('id, shopify_access_token')
        .eq('shopify_domain', shopDomain)
        .single();

    if (shopErr || !shop) {
        console.error('[billing/shopify/callback] Shop niet gevonden:', shopDomain);
        return NextResponse.redirect(`${APP_URL}/dashboard/billing?error=shop_not_found`);
    }

    try {
        // Activate the charge (verifies it's in 'accepted' state first)
        await activateSubscription(
            shopDomain,
            shop.shopify_access_token,
            Number(chargeId),
        );

        // Update shop in DB
        const tryon_limit = planLimitForShopifyPlan(plan);

        await admin
            .from('shops')
            .update({
                plan,
                monthly_tryon_limit: tryon_limit,
                billing_source: 'shopify',
                shopify_charge_id: chargeId,
            })
            .eq('id', shop.id);

        console.log(`[billing/shopify/callback] Plan geactiveerd: ${plan} voor ${shopDomain}`);

        // Redirect to dashboard with success message
        return NextResponse.redirect(
            `${APP_URL}/dashboard/billing?success=plan_activated&plan=${plan}`,
        );

    } catch (err) {
        const message = err instanceof Error ? err.message : 'Onbekende fout';
        console.error('[billing/shopify/callback] Activatie mislukt:', message);

        // Merchant declined or charge in wrong state
        if (message.includes('not accepted')) {
            return NextResponse.redirect(
                `${APP_URL}/dashboard/billing?error=charge_declined`,
            );
        }

        return NextResponse.redirect(
            `${APP_URL}/dashboard/billing?error=activation_failed`,
        );
    }
}
