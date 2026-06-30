// =============================================================================
// lib/shopify-managed-pricing.ts — Shopify Managed Pricing helpers
// =============================================================================
// Drapit uses Shopify Managed Pricing (configured in shopify.app.toml under
// [pricing_plans]) for App Store merchants. Plan selection and changes happen
// on Shopify's own pricing page — never off-platform. This module:
//
//   • builds the deep link to the managed pricing page, and
//   • reads the merchant's active subscription via the Billing GraphQL API
//     so we can keep shops.plan / monthly_tryon_limit in sync.
//
// Direct drapit.io customers keep using Stripe (lib/stripe.ts) — untouched.
// =============================================================================

import type { Plan } from '@/lib/supabase/types';

const SHOPIFY_API_VERSION = '2026-01';

// The app handle as it appears in the Partner Dashboard / App Store URL.
// Set SHOPIFY_APP_HANDLE in the environment; falls back to the known slug.
const APP_HANDLE = process.env.SHOPIFY_APP_HANDLE || 'drapit-virtual-try-on';

// ---------------------------------------------------------------------------
// store handle from a myshopify domain: "demo.myshopify.com" → "demo"
// ---------------------------------------------------------------------------
export function storeHandle(shopifyDomain: string): string {
    return shopifyDomain.replace(/\.myshopify\.com$/i, '').toLowerCase();
}

// ---------------------------------------------------------------------------
// Deep link to the Shopify Managed Pricing page where the merchant selects or
// changes their plan — fully on-platform.
// ---------------------------------------------------------------------------
export function getManagedPricingUrl(shopifyDomain: string): string {
    return `https://admin.shopify.com/store/${storeHandle(shopifyDomain)}/charges/${APP_HANDLE}/pricing_plans`;
}

// ---------------------------------------------------------------------------
// Map the Managed Pricing plan name (as defined in shopify.app.toml) to our
// internal plan keys + monthly try-on limits.
// ---------------------------------------------------------------------------
const SHOPIFY_PLAN_NAME_TO_KEY: Record<string, Plan> = {
    starter: 'starter',
    pro: 'growth',
    growth: 'growth',
    scale: 'scale',
    business: 'enterprise',
    enterprise: 'enterprise',
};

export function mapShopifyPlanNameToKey(name: string): Plan {
    const normalized = name.trim().toLowerCase().split(/[\s—-]/)[0];
    return SHOPIFY_PLAN_NAME_TO_KEY[normalized] ?? 'starter';
}

export function planLimitForKey(plan: Plan): number {
    const map: Record<Plan, number> = {
        trial: 20,
        starter: 500,
        growth: 1500,
        scale: 3000,
        enterprise: 10000,
    };
    return map[plan] ?? 500;
}

// ---------------------------------------------------------------------------
// Read the active Managed Pricing subscription for a store.
// Returns null when the store has no active subscription yet.
// ---------------------------------------------------------------------------
export interface ActiveSubscription {
    name: string;
    status: string;
    plan: Plan;
}

export async function getActiveSubscription(
    shopifyDomain: string,
    accessToken: string,
): Promise<ActiveSubscription | null> {
    const query = `
        query {
            currentAppInstallation {
                activeSubscriptions {
                    name
                    status
                }
            }
        }`;

    const res = await fetch(
        `https://${shopifyDomain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
            },
            body: JSON.stringify({ query }),
        },
    );

    if (!res.ok) {
        throw new Error(`Shopify GraphQL failed (${res.status})`);
    }

    const json = await res.json();
    const subs = json?.data?.currentAppInstallation?.activeSubscriptions ?? [];
    const active = subs.find((s: { status: string }) => s.status === 'ACTIVE') ?? subs[0];
    if (!active) return null;

    return {
        name: active.name,
        status: active.status,
        plan: mapShopifyPlanNameToKey(active.name),
    };
}
