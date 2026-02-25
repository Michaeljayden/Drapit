import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getStripe, PLANS, planByPriceId } from '@/lib/stripe';
import type { Plan } from '@/lib/supabase/types';
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
            // Customer completed the checkout — activate their plan
            // ─────────────────────────────────────────────────────────────
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;

                if (session.mode !== 'subscription') break;

                const shopId = session.metadata?.shop_id;
                const planKey = session.metadata?.plan_key as Plan | undefined;
                const customerId = session.customer as string;
                const subscriptionId = session.subscription as string;

                if (!shopId || !planKey || !PLANS[planKey]) {
                    console.warn('[stripe/webhook] checkout.session.completed missing metadata');
                    break;
                }

                const planConfig = PLANS[planKey];

                await updateShopById(shopId, {
                    plan: planKey,
                    stripe_customer_id: customerId,
                    stripe_subscription_id: subscriptionId,
                    monthly_tryon_limit: planConfig.limit,
                    tryons_this_month: 0, // Reset on new subscription
                });

                console.log(`[stripe/webhook] ✅ Shop ${shopId} activated plan: ${planKey}`);
                break;
            }

            // ─────────────────────────────────────────────────────────────
            // customer.subscription.updated
            // Upgrade / downgrade / plan change
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

                console.log(`[stripe/webhook] ✅ Customer ${customerId} changed to plan: ${newPlan}`);
                break;
            }

            // ─────────────────────────────────────────────────────────────
            // customer.subscription.deleted
            // Subscription cancelled — downgrade to free
            // ─────────────────────────────────────────────────────────────
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                // Downgrade to trial plan — keep 20 free try-ons so the shop
                // isn't completely locked out.
                await updateShopByCustomer(customerId, {
                    plan: 'trial',
                    monthly_tryon_limit: PLANS.trial.limit,
                    stripe_subscription_id: null,
                });

                console.log(`[stripe/webhook] ⛔ Customer ${customerId} subscription cancelled → reverted to trial`);
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
