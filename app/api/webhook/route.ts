import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json(
            { error: 'Missing stripe-signature header' },
            { status: 400 }
        );
    }

    let event: Stripe.Event;

    try {
        event = getStripe().webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error(`[webhook] Signature verification failed: ${message}`);
        return NextResponse.json(
            { error: `Webhook signature verification failed` },
            { status: 400 }
        );
    }

    // Handle specific event types
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            console.log(`[webhook] Checkout completed: ${session.id}`);
            // TODO: Provision access, update Supabase
            break;
        }

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;
            console.log(`[webhook] Subscription ${event.type}: ${subscription.id}`);
            // TODO: Update subscription status in Supabase
            break;
        }

        case 'invoice.payment_failed': {
            const invoice = event.data.object as Stripe.Invoice;
            console.log(`[webhook] Payment failed: ${invoice.id}`);
            // TODO: Notify customer, handle dunning
            break;
        }

        default:
            console.log(`[webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
