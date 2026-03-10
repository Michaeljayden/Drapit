// =============================================================================
// POST /api/billing/shopify/create
// =============================================================================
// Called when a Shopify merchant selects a plan in the dashboard.
// Creates a RecurringApplicationCharge via the Shopify Billing API and
// returns the confirmation_url where the merchant must approve the charge.
//
// Body: { shop_id: string, plan: 'starter' | 'growth' | 'scale' | 'enterprise' }
// Returns: { confirmation_url: string }
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSubscription } from '@/lib/shopify-billing';
import type { Plan } from '@/lib/supabase/types';

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } },
    );
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { shop_id, plan } = body as { shop_id: string; plan: Plan };

        if (!shop_id || !plan) {
            return NextResponse.json(
                { error: 'shop_id en plan zijn verplicht' },
                { status: 400 },
            );
        }

        if (plan === 'trial') {
            return NextResponse.json(
                { error: 'Trial plan heeft geen betaling nodig' },
                { status: 400 },
            );
        }

        const admin = getSupabaseAdmin();

        // Fetch shop — must be a Shopify-installed shop
        const { data: shop, error: shopErr } = await admin
            .from('shops')
            .select('id, shopify_domain, shopify_access_token, billing_source, shopify_charge_id')
            .eq('id', shop_id)
            .single();

        if (shopErr || !shop) {
            return NextResponse.json({ error: 'Shop niet gevonden' }, { status: 404 });
        }

        if (shop.billing_source !== 'shopify') {
            return NextResponse.json(
                { error: 'Deze shop gebruikt Stripe billing, niet Shopify' },
                { status: 400 },
            );
        }

        if (!shop.shopify_domain || !shop.shopify_access_token) {
            return NextResponse.json(
                { error: 'Shopify koppeling ontbreekt voor deze shop' },
                { status: 400 },
            );
        }

        // Create the RecurringApplicationCharge
        const { confirmation_url, charge_id } = await createSubscription(
            shop.shopify_domain,
            shop.shopify_access_token,
            plan,
        );

        // Store the pending charge_id so we can activate it in the callback
        await admin
            .from('shops')
            .update({ shopify_charge_id: String(charge_id) })
            .eq('id', shop_id);

        return NextResponse.json({ confirmation_url });

    } catch (err) {
        const message = err instanceof Error ? err.message : 'Onbekende fout';
        console.error('[billing/shopify/create]', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
