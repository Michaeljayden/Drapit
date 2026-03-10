// =============================================================================
// lib/shopify-billing.ts — Shopify Recurring Billing API helpers
// =============================================================================
// Used when a merchant installs Drapit via the Shopify App Store.
// Direct drapit.io customers continue to use Stripe (lib/stripe.ts).
//
// Flow:
//  1. createSubscription()   → returns confirmation_url (Shopify approval page)
//  2. Merchant approves on Shopify → redirect to /api/billing/shopify/callback
//  3. activateSubscription() → activates the charge, stores charge_id in DB
//  4. cancelSubscription()   → called on app uninstall / plan downgrade
// =============================================================================

import type { Plan } from '@/lib/supabase/types';
import { PLANS } from '@/lib/stripe';

const SHOPIFY_API_VERSION = '2024-01';

// ---------------------------------------------------------------------------
// Plan config for Shopify billing
// Prices must match PLANS in lib/stripe.ts
// ---------------------------------------------------------------------------
export interface ShopifyPlanConfig {
    name: string;       // Shown on Shopify's billing approval page
    price: number;      // EUR — must match Stripe prices
    trialDays: number;
}

export const SHOPIFY_BILLING_PLANS: Record<Exclude<Plan, 'trial'>, ShopifyPlanConfig> = {
    starter:    { name: 'Drapit Starter — 500 try-ons/maand',    price: PLANS.starter.price,    trialDays: 0 },
    growth:     { name: 'Drapit Pro — 2.500 try-ons/maand',      price: PLANS.growth.price,     trialDays: 0 },
    scale:      { name: 'Drapit Scale — 5.000 try-ons/maand',    price: PLANS.scale.price,      trialDays: 0 },
    enterprise: { name: 'Drapit Business — 10.000 try-ons/maand', price: PLANS.enterprise.price, trialDays: 0 },
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface ShopifyCharge {
    id: number;
    name: string;
    price: string;
    status: 'pending' | 'accepted' | 'active' | 'declined' | 'expired' | 'cancelled' | 'frozen';
    confirmation_url: string;
    return_url: string;
    trial_days: number;
    created_at: string;
    activated_on: string | null;
}

// ---------------------------------------------------------------------------
// 1. Create a RecurringApplicationCharge
//    Returns the confirmation_url to redirect the merchant to.
// ---------------------------------------------------------------------------
export async function createSubscription(
    shopDomain: string,
    accessToken: string,
    plan: Exclude<Plan, 'trial'>,
): Promise<{ confirmation_url: string; charge_id: number }> {
    const config = SHOPIFY_BILLING_PLANS[plan];
    if (!config) throw new Error(`Unknown plan: ${plan}`);

    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/billing/shopify/callback?plan=${plan}&shop=${shopDomain}`;
    const isTest = process.env.NODE_ENV !== 'production';

    const response = await fetch(
        `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/recurring_application_charges.json`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
            },
            body: JSON.stringify({
                recurring_application_charge: {
                    name: config.name,
                    price: config.price.toFixed(2),
                    return_url: returnUrl,
                    trial_days: config.trialDays,
                    test: isTest, // true in dev/staging — no real charges
                },
            }),
        },
    );

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Shopify billing create failed (${response.status}): ${err}`);
    }

    const data = await response.json();
    const charge: ShopifyCharge = data.recurring_application_charge;

    return {
        confirmation_url: charge.confirmation_url,
        charge_id: charge.id,
    };
}

// ---------------------------------------------------------------------------
// 2. Activate a RecurringApplicationCharge after merchant approval
//    Must be called from the callback route with the charge_id from Shopify.
// ---------------------------------------------------------------------------
export async function activateSubscription(
    shopDomain: string,
    accessToken: string,
    chargeId: number,
): Promise<ShopifyCharge> {
    // First fetch the charge to verify it was accepted
    const getResponse = await fetch(
        `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/recurring_application_charges/${chargeId}.json`,
        {
            headers: { 'X-Shopify-Access-Token': accessToken },
        },
    );

    if (!getResponse.ok) {
        throw new Error(`Could not fetch charge ${chargeId}: ${getResponse.status}`);
    }

    const getData = await getResponse.json();
    const charge: ShopifyCharge = getData.recurring_application_charge;

    if (charge.status !== 'accepted') {
        throw new Error(`Charge ${chargeId} is not accepted (status: ${charge.status})`);
    }

    // Activate it
    const activateResponse = await fetch(
        `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/recurring_application_charges/${chargeId}/activate.json`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
            },
            body: JSON.stringify({ recurring_application_charge: charge }),
        },
    );

    if (!activateResponse.ok) {
        const err = await activateResponse.text();
        throw new Error(`Shopify billing activate failed (${activateResponse.status}): ${err}`);
    }

    const activateData = await activateResponse.json();
    return activateData.recurring_application_charge;
}

// ---------------------------------------------------------------------------
// 3. Cancel a RecurringApplicationCharge
//    Called when merchant uninstalls the app or downgrades to trial.
// ---------------------------------------------------------------------------
export async function cancelSubscription(
    shopDomain: string,
    accessToken: string,
    chargeId: number,
): Promise<void> {
    const response = await fetch(
        `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/recurring_application_charges/${chargeId}.json`,
        {
            method: 'DELETE',
            headers: { 'X-Shopify-Access-Token': accessToken },
        },
    );

    // 200 or 404 (already gone) are both acceptable
    if (!response.ok && response.status !== 404) {
        throw new Error(`Shopify billing cancel failed (${response.status})`);
    }
}

// ---------------------------------------------------------------------------
// Helper: map trial_days + plan limits to DB columns
// ---------------------------------------------------------------------------
export function planLimitForShopifyPlan(plan: Plan): number {
    const planMap: Record<Plan, number> = {
        trial: 20,
        starter: 500,
        growth: 2500,
        scale: 5000,
        enterprise: 10000,
    };
    return planMap[plan] ?? 500;
}
