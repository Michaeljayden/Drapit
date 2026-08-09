import type { Plan } from '@/lib/supabase/types';

export interface PlanInfo {
    key: Plan;
    limit: number;      // monthly try-on limit
    price: number;      // EUR/month — huidige (introductie)prijs
    oldPrice?: number;  // EUR/month — normale prijs, doorgestreept getoond
    popular?: boolean;
    maxApiKeys: number;
}

// Client-safe plan data (no Stripe secrets).
// Prijzen komen overeen met de Shopify Managed Pricing-plannen in
// shopify.app.toml — introductieprijzen, met de normale prijs in oldPrice.
// Limieten komen overeen met PLANS in lib/stripe.ts en planLimitForKey().
export const PLAN_TIERS: PlanInfo[] = [
    { key: 'trial', limit: 20, price: 0, maxApiKeys: 1 },
    { key: 'starter', limit: 500, price: 29, oldPrice: 49, maxApiKeys: 1 },
    { key: 'growth', limit: 1_500, price: 89, oldPrice: 199, popular: true, maxApiKeys: 3 },
    { key: 'scale', limit: 3_000, price: 169, oldPrice: 399, maxApiKeys: 10 },
    { key: 'enterprise', limit: 10_000, price: 299, oldPrice: 799, maxApiKeys: 999 }, // effectively unlimited
];

/**
 * Given an estimated number of monthly try-ons, return the cheapest plan that fits.
 * Returns 'enterprise' if the estimate exceeds all plans.
 */
export function recommendPlan(estimatedTryons: number): PlanInfo {
    for (const plan of PLAN_TIERS) {
        if (estimatedTryons <= plan.limit) return plan;
    }
    return PLAN_TIERS[PLAN_TIERS.length - 1];
}
