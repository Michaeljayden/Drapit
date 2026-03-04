import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getStripe, PLANS, planByPriceId, STUDIO_PLANS, studioPlanByPriceId, creditPackByPriceId } from '@/lib/stripe';
import type { Plan, StudioPlan } from '@/lib/supabase/types';
import Stripe from 'stripe';

// ── Admin Supabase client ───────────────────────────────────────────────────
function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

// ── Helper: update shop by stripe_customer_id ───────────────────────────────
async function updateShopByCustomer(
    customerId: string,
    updates: Record<string, unknown>,
) {
    const admin = getSupabaseAdmin();
    const { error } = await admin
        .from('shops')
        .update(updates)
        .eq('stripe_customer_id', customerId);

    if (error) {
        console.error('[stripe/webhook] DB update failed:', error);
    }
}

// ── Helper: update shop by shop_id ──────────────────────────────────────────
async function updateShopById(
    shopId: string,
    updates: Record<string, unknown>,
) {
    const admin = getSupabaseAdmin();
    const { error } = await admin
        .from('shops')
        .update(updates)
        .eq('id', shopId);

    if (error) {
        console.error('[stripe/webhook] DB update by id failed:', error);
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// POST /api/webhook/stripe
// Stripe sends webhook events here. Verify signature before processing.
// ═════════════════════════════════════════════════════════════════════════════
export async function POST(request: NextRequest) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error('[stripe/webhook] STRIPE_WEBHOOK_SECRET not configured');
        return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    // ── Read raw body + signature ───────────────────────────────────────
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    if (!signature) {
        return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    // ── Verify signature ────────────────────────────────────────────────
    let event: Stripe.Event;
    try {
        const stripe = getStripe();
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[stripe/webhook] Signature verification failed:', message);
        return NextResponse.json({ error: `Signature invalid: ${message}` }, { status: 400 });
    }

    console.log(`[stripe/webhook] Received event: ${event.type} (${event.id})`);

    // ═════════════════════════════════════════════════════════════════════
    // Event handlers
    // ═════════════════════════════════════════════════════════════════════

    try {
        switch (event.type) {
            // ─────────────────────────────────────────────────────────────
            // checkout.session.completed
            // Customer completed the checkout — activate their plan or add credits
            // ─────────────────────────────────────────────────────────────
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;

                const shopId = session.metadata?.shop_id;
                const productType = session.metadata?.product_type;
                const customerId = session.customer as string;

                if (!shopId) {
                    console.warn('[stripe/webhook] checkout.session.completed: missing shop_id metadata');
                    break;
                }

                // ── Studio subscription activated ────────────────────────
                if (productType === 'studio' && session.mode === 'subscription') {
                    const studioPlanKey = session.metadata?.studio_plan_key as StudioPlan | undefined;
                    const subscriptionId = session.subscription as string;

                    if (!studioPlanKey || !STUDIO_PLANS[studioPlanKey]) {
                        console.warn('[stripe/webhook] studio checkout: missing studio_plan_key metadata');
                        break;
                    }

                    const studioPlanConfig = STUDIO_PLANS[studioPlanKey];

                    await updateShopById(shopId, {
                        has_studio: true,
                        studio_plan: studioPlanKey,
                        studio_subscription_id: subscriptionId,
                        stripe_customer_id: customerId,
                        studio_credits_limit: studioPlanConfig.credits_limit,
                        studio_credits_used: 0,   // Reset on new subscription
                    });

                    console.log(`[stripe/webhook] ✅ Shop ${shopId} activated Studio plan: ${studioPlanKey}`);
                    break;
                }

                // ── Studio credit pack purchased ─────────────────────────
                if (productType === 'studio_credits' && session.mode === 'payment') {
                    const creditsAmount = parseInt(session.metadata?.credits_amount ?? '0', 10);

                    if (!creditsAmount || creditsAmount <= 0) {
                        console.warn('[stripe/webhook] studio_credits checkout: invalid credits_amount');
                        break;
                    }

                    // Increment studio_extra_credits (these never reset on monthly renewal)
                    const admin = getSupabaseAdmin();
                    const { data: shop } = await admin
                        .from('shops')
                        .select('studio_extra_credits')
                        .eq('id', shopId)
                        .single();

                    const currentExtra = (shop?.studio_extra_credits as number) ?? 0;

                    await updateShopById(shopId, {
                        studio_extra_credits: currentExtra + creditsAmount,
                        stripe_customer_id: customerId,
                    });

                    console.log(`[stripe/webhook] ✅ Shop ${shopId} added ${creditsAmount} extra Studio credits`);
                    break;
                }

                // ── VTON subscription activated ──────────────────────────
                if (session.mode !== 'subscription') break;

                const planKey = session.metadata?.plan_key as Plan | undefined;
                const subscriptionId = session.subscription as string;

                if (!planKey || !PLANS[planKey]) {
                    console.warn('[stripe/webhook] checkout.session.completed missing metadata');
                    break;
                }

                const planConfig = PLANS[planKey];

                await updateShopById(shopId, {
                    plan: planKey,
                    stripe_customer_id: customerId,
                    stripe_subscription_id: subscriptionId,
                    monthly_tryon_limit: planConfig.limit,
                    tryons_this_month: 0,  // Reset on new subscription
                    rollover_tryons: 0,    // No rollover for brand-new subscriptions
                });

                console.log(`[stripe/webhook] ✅ Shop ${shopId} activated VTON plan: ${planKey}`);
                break;
            }

            // ─────────────────────────────────────────────────────────────
            // customer.subscription.updated
            // Upgrade / downgrade / plan change (both VTON and Studio)
            // ─────────────────────────────────────────────────────────────
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                // Get the current price from the first subscription item
                const priceId = subscription.items.data[0]?.price?.id;
                if (!priceId) {
                    console.warn('[stripe/webhook] subscription.updated: no price found');
                    break;
                }

                // ── Check if this is a Studio plan ───────────────────────
                const newStudioPlan = studioPlanByPriceId(priceId);
                if (newStudioPlan) {
                    const studioConfig = STUDIO_PLANS[newStudioPlan];
                    await updateShopByCustomer(customerId, {
                        studio_plan: newStudioPlan,
                        studio_credits_limit: studioConfig.credits_limit,
                        studio_subscription_id: subscription.id,
                        has_studio: true,
                    });
                    console.log(`[stripe/webhook] ✅ Customer ${customerId} Studio plan changed to: ${newStudioPlan}`);
                    break;
                }

                // ── Check if this is a VTON plan ─────────────────────────
                const newPlan = planByPriceId(priceId);
                if (!newPlan) {
                    console.warn(`[stripe/webhook] subscription.updated: unknown price ${priceId}`);
                    break;
                }

                const planConfig = PLANS[newPlan];

                await updateShopByCustomer(customerId, {
                    plan: newPlan,
                    monthly_tryon_limit: planConfig.limit,
                    stripe_subscription_id: subscription.id,
                });

                console.log(`[stripe/webhook] ✅ Customer ${customerId} VTON plan changed to: ${newPlan}`);
                break;
            }

            // ─────────────────────────────────────────────────────────────
            // customer.subscription.deleted
            // Subscription cancelled — downgrade to free (VTON or Studio)
            // ─────────────────────────────────────────────────────────────
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                // Determine if this was a Studio or VTON subscription
                const cancelledPriceId = subscription.items.data[0]?.price?.id;
                const wasStudio = cancelledPriceId
                    ? studioPlanByPriceId(cancelledPriceId) !== null
                    : false;

                if (wasStudio) {
                    // Revert Studio to free trial (keep access with 20 monthly credits)
                    await updateShopByCustomer(customerId, {
                        studio_plan: 'studio_trial',
                        studio_credits_limit: STUDIO_PLANS.studio_trial.credits_limit,
                        studio_credits_used: 0,
                        studio_subscription_id: null,
                        has_studio: true,  // Keep trial access
                    });
                    console.log(`[stripe/webhook] ⛔ Customer ${customerId} Studio subscription cancelled → reverted to studio_trial`);
                } else {
                    // Revert VTON to trial plan — keep 20 free try-ons
                    await updateShopByCustomer(customerId, {
                        plan: 'trial',
                        monthly_tryon_limit: PLANS.trial.limit,
                        stripe_subscription_id: null,
                    });
                    console.log(`[stripe/webhook] ⛔ Customer ${customerId} VTON subscription cancelled → reverted to trial`);
                }
                break;
            }

            // ─────────────────────────────────────────────────────────────
            // invoice.payment_failed
            // Payment failed — notify shop owner
            // ─────────────────────────────────────────────────────────────
            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                const customerId = invoice.customer as string;

                console.warn(`[stripe/webhook] ⚠️ Payment failed for customer ${customerId}`);

                // Optionally call a Supabase Edge Function for notifications
                try {
                    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
                    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

                    await fetch(`${supabaseUrl}/functions/v1/notify-payment-failed`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${serviceKey}`,
                        },
                        body: JSON.stringify({
                            stripe_customer_id: customerId,
                            invoice_id: invoice.id,
                            amount_due: invoice.amount_due,
                            currency: invoice.currency,
                            attempt_count: invoice.attempt_count,
                        }),
                    });
                } catch (notifyErr) {
                    // Non-critical — log but don't fail the webhook
                    console.error('[stripe/webhook] Failed to call notification function:', notifyErr);
                }

                break;
            }

            // ─────────────────────────────────────────────────────────────
            // invoice.payment_succeeded
            // Monthly renewal — reset counters & roll over unused credits.
            // Handles both VTON and Studio subscriptions.
            // Only triggers on subscription_cycle (not first-time checkout).
            // ─────────────────────────────────────────────────────────────
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;

                // 'subscription_cycle' = recurring renewal; skip first payment
                if (invoice.billing_reason !== 'subscription_cycle') break;

                const customerId = invoice.customer as string;
                const admin = getSupabaseAdmin();

                // Determine if this is a Studio or VTON renewal via price ID
                const renewedPriceId = (invoice as Stripe.Invoice & { lines?: { data?: Array<{ price?: { id?: string } }> } })
                    .lines?.data?.[0]?.price?.id;

                const isStudioRenewal = renewedPriceId
                    ? studioPlanByPriceId(renewedPriceId) !== null
                    : false;

                // Fetch current shop state
                const { data: shop, error: shopErr } = await admin
                    .from('shops')
                    .select('monthly_tryon_limit, tryons_this_month, rollover_tryons, studio_credits_limit, studio_credits_used, studio_plan')
                    .eq('stripe_customer_id', customerId)
                    .single();

                if (shopErr || !shop) {
                    console.warn(`[stripe/webhook] invoice.payment_succeeded: shop not found for ${customerId}`);
                    break;
                }

                if (isStudioRenewal) {
                    // ── Studio monthly renewal ───────────────────────────
                    const studPlan = (shop.studio_plan as string) ?? 'studio_trial';
                    const studioPlan = studioPlanByPriceId(renewedPriceId!) ?? (studPlan as StudioPlan);
                    const studioConfig = STUDIO_PLANS[studioPlan] ?? STUDIO_PLANS.studio_trial;

                    // Reset studio_credits_used; restore monthly limit; keep extra credits
                    await updateShopByCustomer(customerId, {
                        studio_credits_used: 0,
                        studio_credits_limit: studioConfig.credits_limit,
                    });

                    console.log(`[stripe/webhook] ✅ Studio monthly reset for ${customerId} (plan: ${studioPlan})`);
                } else {
                    // ── VTON monthly renewal ─────────────────────────────
                    const currentLimit = shop.monthly_tryon_limit as number;
                    const currentRollover = (shop.rollover_tryons as number) ?? 0;
                    const effectiveLimit = currentLimit + currentRollover;
                    const used = shop.tryons_this_month as number;

                    // Unused try-ons from this cycle → carry to next month
                    const unused = Math.max(0, effectiveLimit - used);
                    // Cap rollover at 1× the plan's monthly limit
                    const newRollover = Math.min(unused, currentLimit);

                    await updateShopByCustomer(customerId, {
                        tryons_this_month: 0,
                        rollover_tryons: newRollover,
                    });

                    console.log(
                        `[stripe/webhook] ✅ VTON monthly reset for ${customerId}: ` +
                        `used ${used}/${effectiveLimit}, rollover → ${newRollover}`
                    );
                }
                break;
            }

            default:
                console.log(`[stripe/webhook] Unhandled event type: ${event.type}`);
        }
    } catch (err) {
        console.error(`[stripe/webhook] Error processing ${event.type}:`, err);
        // Return 200 to avoid Stripe retrying — we already logged the error
        return NextResponse.json({ received: true, error: 'Processing error' }, { status: 200 });
    }

    return NextResponse.json({ received: true });
}
