import Stripe from 'stripe';
import type { Plan } from '@/lib/supabase/types';

// ═════════════════════════════════════════════════════════════════════════════
// Stripe singleton
// ═════════════════════════════════════════════════════════════════════════════

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
    if (!_stripe) {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key) throw new Error('Missing STRIPE_SECRET_KEY environment variable');
        _stripe = new Stripe(key, { apiVersion: '2026-01-28.clover' });
    }
    return _stripe;
}

// ═════════════════════════════════════════════════════════════════════════════
// Plan definitions
// ═════════════════════════════════════════════════════════════════════════════
// Update the price_id values with your real Stripe Price IDs when you go live.
// Create products + prices in Stripe Dashboard →  Products → Add product.
// ═════════════════════════════════════════════════════════════════════════════

export interface PlanConfig {
    price_id: string;
    limit: number;
    price: number;       // EUR, displayed on billing page
    name: string;        // Human-readable label
    features: string[];
    popular?: boolean;
}

export const PLANS: Record<Plan, PlanConfig> = {
    trial: {
        price_id: '',
        limit: 20,
        price: 0,
        name: 'Proef',
        features: [
            '20 try-ons per maand',
            '1 API-sleutel',
            'E-mail support',
        ],
    },
    starter: {
        price_id: process.env.STRIPE_PRICE_STARTER || 'price_1T4eWrQf4cE06T91UECmF7rp',
        limit: 500,
        price: 49,
        name: 'Starter',
        features: [
            '500 try-ons per maand',
            '1 API-sleutel',
            'E-mail support',
            'Widget personalisatie',
        ],
    },
    growth: {
        price_id: process.env.STRIPE_PRICE_GROWTH || 'price_1T4eXjQf4cE06T91YwBQAUWT',
        limit: 2500,
        price: 149,
        name: 'Pro',
        popular: true,
        features: [
            '2.500 try-ons per maand',
            'Onbeperkt API-sleutels',
            'Prioriteit support',
            'Widget personalisatie',
            'Analytics dashboard',
            'Webhook integraties',
        ],
    },
    scale: {
        price_id: process.env.STRIPE_PRICE_SCALE || 'price_1T4eYtQf4cE06T91fYyeFyil',
        limit: 5000,
        price: 249,
        name: 'Scale',
        features: [
            '5.000 try-ons per maand',
            'Onbeperkt API-sleutels',
            'Prioriteit support',
            'Custom branding',
            'Analytics dashboard',
            'Webhook integraties',
            'SLA garantie',
        ],
    },
    enterprise: {
        price_id: process.env.STRIPE_PRICE_ENTERPRISE || 'price_1T4eZtQf4cE06T919zzx0lVE',
        limit: 10_000,
        price: 399,
        name: 'Business',
        features: [
            '10.000 try-ons per maand',
            'Onbeperkt API-sleutels',
            'Dedicated support',
            'Custom branding',
            'Analytics dashboard',
            'Webhook integraties',
            'SLA garantie',
            'Custom integratie hulp',
        ],
    },
};

// ── Lookup helpers ──────────────────────────────────────────────────────────

/** Find which Plan a Stripe Price ID belongs to */
export function planByPriceId(priceId: string): Plan | null {
    for (const [key, config] of Object.entries(PLANS)) {
        if (config.price_id === priceId) return key as Plan;
    }
    return null;
}

/** Get a plan config by key, with fallback to starter */
export function getPlanConfig(plan: Plan): PlanConfig {
    return PLANS[plan] ?? PLANS.starter;
}
