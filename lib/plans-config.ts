import type { Plan } from '@/lib/supabase/types';

export interface PlanInfo {
    key: Plan;
    limit: number;      // monthly try-on limit
    price: number;      // EUR/month
    popular?: boolean;
}

// Client-safe plan data (no Stripe secrets)
export const PLAN_TIERS: PlanInfo[] = [
    { key: 'trial', limit: 20, price: 0 },
    { key: 'starter', limit: 500, price: 49 },
    { key: 'growth', limit: 2_500, price: 199, popular: true },
    { key: 'scale', limit: 5_000, price: 399 },
    { key: 'enterprise', limit: 10_000, price: 799 },
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
