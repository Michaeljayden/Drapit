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
import { SHOPIFY_TRYON_PACKS, shopifyTryonPackByKey, type ShopifyTryonPack } from '@/lib/shopify-tryon-packs';

const SHOPIFY_API_VERSION = '2026-01';

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
    starter:    { name: 'Drapit Starter — 200 try-ons/maand',    price: PLANS.starter.price,    trialDays: 0 },
    growth:     { name: 'Drapit Pro — 800 try-ons/maand',      price: PLANS.growth.price,     trialDays: 0 },
    scale:      { name: 'Drapit Scale — 2.000 try-ons/maand',    price: PLANS.scale.price,      trialDays: 0 },
    enterprise: { name: 'Drapit Business — 4.000 try-ons/maand', price: PLANS.enterprise.price, trialDays: 0 },
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

    // Detect development/partner-test stores so reviewers can approve charges
    // without real payment. Falls back to false on fetch errors.
    let isTest = false;
    try {
        const shopRes = await fetch(
            `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/shop.json`,
            { headers: { 'X-Shopify-Access-Token': accessToken } },
        );
        if (shopRes.ok) {
            const shopData = await shopRes.json();
            const planName: string = shopData.shop?.plan_name ?? '';
            isTest = planName === 'developer' || planName === 'partner_test' || planName === 'affiliate';
        }
    } catch {
        console.warn('[shopify-billing] Could not fetch shop plan — defaulting test=false');
    }

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
        starter: 200,
        growth: 800,
        scale: 2000,
        enterprise: 4000,
    };
    return planMap[plan] ?? 200;
}

// =============================================================================
// 4. One-time try-on packs (AppPurchaseOneTime via GraphQL Billing API)
// =============================================================================
// Shopify merchants cannot use the Stripe top-up flow (lib/auto-topup.ts).
// Instead they buy a one-time pack of extra try-ons that Shopify bills on
// their next invoice. Flow:
//
//   POST /api/billing/shopify/topup           → createOneTimeTryonPurchase()
//   merchant approves on Shopify's confirmation page
//   GET  /api/billing/shopify/topup/callback  → getOneTimePurchase() must be
//                                               ACTIVE → extra_tryons += pack
//
// Prices are in USD because Shopify App Store billing is USD-denominated
// (same as the Managed Pricing plans in shopify.app.toml).
// =============================================================================

export { SHOPIFY_TRYON_PACKS, shopifyTryonPackByKey, type ShopifyTryonPack };

// Development / partner-test stores must get test charges, otherwise Shopify
// refuses the purchase. Same detection as createSubscription().
async function isTestShop(shopDomain: string, accessToken: string): Promise<boolean> {
    try {
        const res = await fetch(
            `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/shop.json`,
            { headers: { 'X-Shopify-Access-Token': accessToken } },
        );
        if (!res.ok) return false;
        const data = await res.json();
        const planName: string = data.shop?.plan_name ?? '';
        return planName === 'developer' || planName === 'partner_test' || planName === 'affiliate';
    } catch {
        return false;
    }
}

async function shopifyGraphql<T>(
    shopDomain: string,
    accessToken: string,
    query: string,
    variables: Record<string, unknown>,
): Promise<T> {
    const res = await fetch(
        `https://${shopDomain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
            },
            body: JSON.stringify({ query, variables }),
        },
    );
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Shopify GraphQL error (${res.status}): ${text}`);
    }
    const json = await res.json();
    if (json.errors?.length) {
        throw new Error(`Shopify GraphQL error: ${JSON.stringify(json.errors)}`);
    }
    return json.data as T;
}

export interface OneTimePurchaseResult {
    confirmation_url: string;
    purchase_id: string;   // gid://shopify/AppPurchaseOneTime/…
    test: boolean;
}

/**
 * Create a one-time purchase for a try-on pack. The merchant must approve it
 * on the returned confirmation_url; Shopify then redirects to returnUrl.
 */
export async function createOneTimeTryonPurchase(
    shopDomain: string,
    accessToken: string,
    pack: ShopifyTryonPack,
    returnUrl: string,
): Promise<OneTimePurchaseResult> {
    const test = await isTestShop(shopDomain, accessToken);

    const mutation = `
        mutation DrapitTryonPack($name: String!, $price: MoneyInput!, $returnUrl: URL!, $test: Boolean) {
            appPurchaseOneTimeCreate(name: $name, price: $price, returnUrl: $returnUrl, test: $test) {
                appPurchaseOneTime { id status }
                confirmationUrl
                userErrors { field message }
            }
        }
    `;

    type Resp = {
        appPurchaseOneTimeCreate: {
            appPurchaseOneTime: { id: string; status: string } | null;
            confirmationUrl: string | null;
            userErrors: { field: string[] | null; message: string }[];
        };
    };

    const data = await shopifyGraphql<Resp>(shopDomain, accessToken, mutation, {
        name: pack.name,
        price: { amount: pack.priceUsd.toFixed(2), currencyCode: 'USD' },
        returnUrl,
        test,
    });

    const result = data.appPurchaseOneTimeCreate;
    if (result.userErrors?.length) {
        throw new Error(`Shopify purchase rejected: ${result.userErrors.map((e) => e.message).join('; ')}`);
    }
    if (!result.confirmationUrl || !result.appPurchaseOneTime?.id) {
        throw new Error('Shopify purchase create returned no confirmation URL');
    }

    return {
        confirmation_url: result.confirmationUrl,
        purchase_id: result.appPurchaseOneTime.id,
        test,
    };
}

export type OneTimePurchaseStatus = 'ACTIVE' | 'PENDING' | 'DECLINED' | 'EXPIRED' | 'UNKNOWN';

/** Read the current status of a one-time purchase (ACTIVE = paid/approved). */
export async function getOneTimePurchaseStatus(
    shopDomain: string,
    accessToken: string,
    purchaseId: string,
): Promise<OneTimePurchaseStatus> {
    const query = `
        query DrapitTryonPackStatus($id: ID!) {
            node(id: $id) {
                ... on AppPurchaseOneTime { id status }
            }
        }
    `;
    type Resp = { node: { id: string; status: string } | null };
    const data = await shopifyGraphql<Resp>(shopDomain, accessToken, query, { id: purchaseId });
    const status = data.node?.status ?? 'UNKNOWN';
    if (status === 'ACTIVE' || status === 'PENDING' || status === 'DECLINED' || status === 'EXPIRED') {
        return status;
    }
    return 'UNKNOWN';
}
