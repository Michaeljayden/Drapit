import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { TRYON_PACKS, getStripe } from '@/lib/stripe';

// ═════════════════════════════════════════════════════════════════════════════
// POST /api/settings/auto-topup
// Body: {
//   auto_topup_enabled: boolean,
//   auto_topup_threshold_pct: number,   (50-100)
//   auto_topup_pack_index: number,      (0, 1, or 2)
//   auto_topup_monthly_cap: number      (EUR, >= smallest pack price)
// }
// ═════════════════════════════════════════════════════════════════════════════

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const {
            auto_topup_enabled,
            auto_topup_threshold_pct,
            auto_topup_pack_index,
            auto_topup_monthly_cap,
        } = body;

        // ── Validate fields ──────────────────────────────────────────────
        if (typeof auto_topup_enabled !== 'boolean') {
            return NextResponse.json({ error: 'auto_topup_enabled moet een boolean zijn' }, { status: 400 });
        }

        if (
            typeof auto_topup_threshold_pct !== 'number' ||
            auto_topup_threshold_pct < 50 ||
            auto_topup_threshold_pct > 100
        ) {
            return NextResponse.json({ error: 'Drempel moet tussen 50% en 100% zijn' }, { status: 400 });
        }

        if (
            typeof auto_topup_pack_index !== 'number' ||
            auto_topup_pack_index < 0 ||
            auto_topup_pack_index >= TRYON_PACKS.length
        ) {
            return NextResponse.json({ error: 'Ongeldig pakket geselecteerd' }, { status: 400 });
        }

        const minCap = TRYON_PACKS[auto_topup_pack_index].price;
        if (
            typeof auto_topup_monthly_cap !== 'number' ||
            auto_topup_monthly_cap < minCap
        ) {
            return NextResponse.json(
                { error: `Maandlimiet moet minimaal €${minCap} zijn` },
                { status: 400 },
            );
        }

        // ── Get shop & validate billing source ───────────────────────────
        const admin = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } },
        );

        const { data: shop, error: shopErr } = await admin
            .from('shops')
            .select('id, billing_source, stripe_customer_id, plan')
            .eq('owner_id', user.id)
            .single();

        if (shopErr || !shop) {
            return NextResponse.json({ error: 'Geen shop gevonden' }, { status: 404 });
        }

        // Auto top-up only works for Stripe-billed merchants
        if (shop.billing_source === 'shopify') {
            return NextResponse.json(
                { error: 'Auto top-up is alleen beschikbaar voor Stripe-klanten' },
                { status: 400 },
            );
        }

        // Must have an active subscription (not trial)
        if (shop.plan === 'trial' || !shop.stripe_customer_id) {
            return NextResponse.json(
                { error: 'Upgrade je abonnement om auto top-up te gebruiken' },
                { status: 400 },
            );
        }

        // If enabling, verify saved payment method exists
        if (auto_topup_enabled) {
            const stripe = getStripe();
            const methods = await stripe.paymentMethods.list({
                customer: shop.stripe_customer_id as string,
                type: 'card',
                limit: 1,
            });

            if (methods.data.length === 0) {
                return NextResponse.json(
                    { error: 'Geen betaalmethode gevonden. Voeg eerst een kaart toe via Stripe Portal.' },
                    { status: 400 },
                );
            }
        }

        // ── Update settings ──────────────────────────────────────────────
        const { error: updateErr } = await admin
            .from('shops')
            .update({
                auto_topup_enabled,
                auto_topup_threshold_pct: Math.round(auto_topup_threshold_pct),
                auto_topup_pack_index,
                auto_topup_monthly_cap: Math.round(auto_topup_monthly_cap),
            })
            .eq('id', shop.id);

        if (updateErr) {
            console.error('[api/settings/auto-topup] Update error:', updateErr);
            return NextResponse.json({ error: 'Kon instellingen niet opslaan' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        console.error('[api/settings/auto-topup] Error:', err);
        const message = err instanceof Error ? err.message : 'Interne serverfout';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
