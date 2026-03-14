// =============================================================================
// lib/auto-topup.ts — Automatic VTON try-on top-up via Stripe off-session charge
// =============================================================================
// Called fire-and-forget from the try-on API route after incrementing usage.
// Charges the merchant's saved payment method when usage crosses the threshold.
// =============================================================================

import { createClient } from '@supabase/supabase-js';
import { getStripe, TRYON_PACKS } from '@/lib/stripe';

// ── Admin Supabase client ───────────────────────────────────────────────────
function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

// ── Types ───────────────────────────────────────────────────────────────────

export interface AutoTopupShopData {
    auto_topup_enabled: boolean;
    auto_topup_threshold_pct: number;
    auto_topup_pack_index: number;
    auto_topup_monthly_cap: number;
    auto_topup_spent_this_month: number;
    stripe_customer_id: string | null;
    billing_source: string | null;
    email: string | null;
    name: string | null;
}

export interface AutoTopupResult {
    triggered: boolean;
    success?: boolean;
    tryons_added?: number;
    error?: string;
}

// =============================================================================
// Main: check threshold & trigger auto top-up if needed
// =============================================================================

export async function maybeAutoTopup(
    shopId: string,
    currentUsed: number,       // tryons_this_month (before this request's increment)
    planLimit: number,         // monthly_tryon_limit + rollover_tryons
    extraTryons: number,
    shop: AutoTopupShopData,
): Promise<AutoTopupResult> {
    // ── Quick exit conditions ────────────────────────────────────────────
    if (!shop.auto_topup_enabled) {
        return { triggered: false };
    }

    if (shop.billing_source !== 'stripe' || !shop.stripe_customer_id) {
        return { triggered: false };
    }

    // ── Check threshold ─────────────────────────────────────────────────
    const thresholdCount = Math.floor(planLimit * shop.auto_topup_threshold_pct / 100);
    const newCount = currentUsed + 1;

    // Only trigger when crossing the threshold (not on every request after)
    if (newCount !== thresholdCount) {
        return { triggered: false };
    }

    // If merchant still has a large buffer of extra try-ons, skip
    const pack = TRYON_PACKS[shop.auto_topup_pack_index];
    if (!pack) {
        return { triggered: false, error: 'Invalid pack index' };
    }

    if (extraTryons >= pack.tryons) {
        return { triggered: false };
    }

    // ── Check monthly cap ───────────────────────────────────────────────
    const spentThisMonth = Number(shop.auto_topup_spent_this_month) || 0;
    if (spentThisMonth + pack.price > shop.auto_topup_monthly_cap) {
        console.log(`[auto-topup] Shop ${shopId}: monthly cap reached (€${spentThisMonth} + €${pack.price} > €${shop.auto_topup_monthly_cap})`);
        return { triggered: false };
    }

    // ── Charge via Stripe off-session ───────────────────────────────────
    console.log(`[auto-topup] Shop ${shopId}: triggering auto top-up — ${pack.name} (€${pack.price})`);

    const chargeResult = await chargeOffSession(
        shop.stripe_customer_id,
        pack.price,
        shopId,
        pack.tryons,
    );

    const admin = getSupabaseAdmin();

    if (chargeResult.success) {
        // ── Success: add try-ons + record transaction ───────────────
        const { error: updateErr } = await admin
            .from('shops')
            .update({
                extra_tryons: extraTryons + pack.tryons,
                auto_topup_spent_this_month: spentThisMonth + pack.price,
            })
            .eq('id', shopId);

        if (updateErr) {
            console.error(`[auto-topup] DB update failed for shop ${shopId}:`, updateErr);
        }

        await admin.from('topup_transactions').insert({
            shop_id: shopId,
            tryons_added: pack.tryons,
            amount_eur: pack.price,
            stripe_payment_intent_id: chargeResult.paymentIntentId,
            status: 'succeeded',
            trigger_type: 'auto',
        });

        console.log(`[auto-topup] Shop ${shopId}: added ${pack.tryons} extra try-ons (€${pack.price})`);

        return { triggered: true, success: true, tryons_added: pack.tryons };
    } else {
        // ── Failure: disable auto top-up + record failed transaction ─
        await admin
            .from('shops')
            .update({ auto_topup_enabled: false })
            .eq('id', shopId);

        await admin.from('topup_transactions').insert({
            shop_id: shopId,
            tryons_added: 0,
            amount_eur: pack.price,
            stripe_payment_intent_id: chargeResult.paymentIntentId,
            status: 'failed',
            trigger_type: 'auto',
            failure_reason: chargeResult.error,
        });

        console.error(`[auto-topup] Shop ${shopId}: charge failed — ${chargeResult.error}. Auto top-up disabled.`);

        return { triggered: true, success: false, error: chargeResult.error };
    }
}

// =============================================================================
// Stripe off-session payment using saved payment method
// =============================================================================

async function chargeOffSession(
    stripeCustomerId: string,
    priceEur: number,
    shopId: string,
    tryonsAmount: number,
): Promise<{ success: boolean; paymentIntentId?: string; error?: string }> {
    try {
        const stripe = getStripe();

        // 1. Get default payment method
        const customer = await stripe.customers.retrieve(stripeCustomerId);
        if ('deleted' in customer && customer.deleted) {
            return { success: false, error: 'Stripe customer deleted' };
        }

        let defaultPm = customer.invoice_settings?.default_payment_method;

        if (!defaultPm) {
            // Fallback: get first available payment method
            const methods = await stripe.paymentMethods.list({
                customer: stripeCustomerId,
                type: 'card',
                limit: 1,
            });
            defaultPm = methods.data[0]?.id ?? null;
        }

        if (!defaultPm) {
            return { success: false, error: 'No payment method on file' };
        }

        const paymentMethodId = typeof defaultPm === 'string' ? defaultPm : defaultPm.id;

        // 2. Create off-session PaymentIntent
        // Use idempotency key to prevent duplicate charges
        const now = new Date();
        const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const idempotencyKey = `auto_topup_${shopId}_${yearMonth}_${Date.now()}`;

        const paymentIntent = await stripe.paymentIntents.create(
            {
                amount: Math.round(priceEur * 100), // Stripe uses cents
                currency: 'eur',
                customer: stripeCustomerId,
                payment_method: paymentMethodId,
                off_session: true,
                confirm: true,
                description: `Drapit Auto Top-Up: ${tryonsAmount} extra try-ons`,
                metadata: {
                    shop_id: shopId,
                    product_type: 'vton_auto_topup',
                    tryons_amount: String(tryonsAmount),
                },
            },
            { idempotencyKey },
        );

        if (paymentIntent.status === 'succeeded') {
            return { success: true, paymentIntentId: paymentIntent.id };
        }

        return { success: false, paymentIntentId: paymentIntent.id, error: `Payment status: ${paymentIntent.status}` };
    } catch (err: unknown) {
        const stripeErr = err as { code?: string; message?: string };

        // SCA/3DS required — cannot charge off-session
        if (stripeErr.code === 'authentication_required') {
            return { success: false, error: 'SCA authenticatie vereist — kan niet automatisch afschrijven' };
        }

        return { success: false, error: stripeErr.message || 'Unknown Stripe error' };
    }
}
