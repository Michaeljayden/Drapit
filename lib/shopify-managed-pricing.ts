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
import { createClient } from '@supabase/supabase-js';
import { getShopifyAccessToken } from '@/lib/shopify-token';

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

// Limiet tijdens Shopify's gratis proefperiode (trial_days in shopify.app.toml).
// Shopify zet het abonnement tijdens de trial al op ACTIVE; zonder deze grens
// zou een winkel in de gratis periode het volledige planlimiet kunnen opmaken.
export const SHOPIFY_TRIAL_TRYON_LIMIT = 20;

// Privé-plan "Pilot" (Partner Dashboard) voor de eerste pilot-winkels: €9/mnd.
// Bij ±€0,06 per try-on blijft 100 try-ons ruim boven de kostprijs.
export const SHOPIFY_PILOT_TRYON_LIMIT = 100;

export function isPilotPlanName(name: string): boolean {
    return name.trim().toLowerCase().startsWith('pilot');
}

export function planLimitForKey(plan: Plan): number {
    const map: Record<Plan, number> = {
        trial: 20,
        starter: 150,
        growth: 500,
        scale: 1250,
        enterprise: 2500,
    };
    return map[plan] ?? 150;
}

// ---------------------------------------------------------------------------
// Read the active Managed Pricing subscription for a store.
// Returns null when the store has no active subscription yet.
// ---------------------------------------------------------------------------
export interface ActiveSubscription {
    name: string;
    status: string;
    plan: Plan;
    trialDays: number;
    createdAt: string | null;
    currentPeriodEnd: string | null;
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
                    trialDays
                    createdAt
                    currentPeriodEnd
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
        trialDays: Number(active.trialDays ?? 0) || 0,
        createdAt: active.createdAt ?? null,
        currentPeriodEnd: active.currentPeriodEnd ?? null,
    };
}

// ---------------------------------------------------------------------------
// Bepaalt het try-on-limiet en het moment van de volgende teller-reset voor
// een actief Shopify-abonnement:
//   • in de gratis trial → 20 try-ons, reset aan het eind van de trial
//   • privé-plan "Pilot" → 100 try-ons
//   • anders            → het planlimiet
// De reset volgt de Shopify-factuurperiode (currentPeriodEnd) in plaats van de
// kalendermaand, zodat een winkel per betaalde periode precies één limiet krijgt.
// ---------------------------------------------------------------------------
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function limitAndResetForSubscription(
    sub: ActiveSubscription,
    existingResetAt: string | null = null,
    now: Date = new Date(),
): { plan: Plan; limit: number; inTrial: boolean; nextResetAt: string } {
    const createdMs = sub.createdAt ? Date.parse(sub.createdAt) : NaN;
    const trialEndMs = sub.trialDays > 0 && !Number.isNaN(createdMs)
        ? createdMs + sub.trialDays * 24 * 60 * 60 * 1000
        : NaN;
    const inTrial = !Number.isNaN(trialEndMs) && now.getTime() < trialEndMs;

    let limit: number;
    if (inTrial) limit = SHOPIFY_TRIAL_TRYON_LIMIT;
    else if (isPilotPlanName(sub.name)) limit = SHOPIFY_PILOT_TRYON_LIMIT;
    else limit = planLimitForKey(sub.plan);

    let nextResetMs: number;
    if (inTrial) {
        nextResetMs = trialEndMs;
    } else {
        const periodEndMs = sub.currentPeriodEnd ? Date.parse(sub.currentPeriodEnd) : NaN;
        const existingMs = existingResetAt ? Date.parse(existingResetAt) : NaN;
        if (!Number.isNaN(periodEndMs) && periodEndMs > now.getTime()) {
            nextResetMs = periodEndMs;
        } else if (!Number.isNaN(existingMs) && existingMs > now.getTime()) {
            // Geen bruikbare periode-einddatum van Shopify: houd de bestaande
            // resetdatum aan i.p.v. hem bij elke sync 30 dagen op te schuiven.
            nextResetMs = existingMs;
        } else {
            nextResetMs = now.getTime() + THIRTY_DAYS_MS;
        }
    }

    return { plan: sub.plan, limit, inTrial, nextResetAt: new Date(nextResetMs).toISOString() };
}

// ---------------------------------------------------------------------------
// syncShopifyPlan — reads the store's active Managed Pricing subscription and
// updates shops.plan + monthly_tryon_limit to match. Runs on dashboard/billing
// load and at install, so per-merchant limits always reflect their chosen
// Shopify plan without needing the app_subscriptions/update webhook.
// Returns the (possibly updated) plan + limit, or null when not applicable.
// ---------------------------------------------------------------------------
export async function syncShopifyPlan(
    shopId: string,
): Promise<{ plan: Plan; monthly_tryon_limit: number; usage_reset_at: string; reset: boolean } | null> {
    const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: shop } = await admin
        .from('shops')
        .select('shopify_domain, shopify_access_token, billing_source, plan, monthly_tryon_limit, usage_reset_at')
        .eq('id', shopId)
        .single();

    if (
        !shop ||
        shop.billing_source !== 'shopify' ||
        !shop.shopify_domain ||
        !shop.shopify_access_token
    ) {
        return null;
    }

    try {
        const accessToken = await getShopifyAccessToken(shopId, admin);
        if (!accessToken) return null;
        const sub = await getActiveSubscription(shop.shopify_domain, accessToken);
        if (!sub) return null; // no active paid subscription (e.g. Free/trial)

        const currentReset = shop.usage_reset_at ? new Date(shop.usage_reset_at as string).toISOString() : null;
        const { limit, nextResetAt } = limitAndResetForSubscription(sub, currentReset);
        const nowIso = new Date().toISOString();
        const periodPassed = currentReset !== null && Date.parse(currentReset) <= Date.now();

        if (periodPassed) {
            // Nieuwe (factuur)periode → teller op 0. De .lte-voorwaarde zorgt dat
            // twee gelijktijdige aanroepen niet allebei resetten.
            await admin
                .from('shops')
                .update({
                    plan: sub.plan,
                    monthly_tryon_limit: limit,
                    usage_reset_at: nextResetAt,
                    tryons_this_month: 0,
                })
                .eq('id', shopId)
                .lte('usage_reset_at', nowIso);
        } else if (
            shop.plan !== sub.plan ||
            shop.monthly_tryon_limit !== limit ||
            currentReset !== nextResetAt
        ) {
            await admin
                .from('shops')
                .update({ plan: sub.plan, monthly_tryon_limit: limit, usage_reset_at: nextResetAt })
                .eq('id', shopId);
        }
        return { plan: sub.plan, monthly_tryon_limit: limit, usage_reset_at: nextResetAt, reset: periodPassed };
    } catch (err) {
        console.error('[syncShopifyPlan]', err);
        return null;
    }
}
