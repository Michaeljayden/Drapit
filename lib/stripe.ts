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

// ═════════════════════════════════════════════════════════════════════════════
// Studio plan definitions
// ═════════════════════════════════════════════════════════════════════════════
// Pricing based on ~€0.10-0.15/credit, aligning with VTON Starter margin.
// Credit costs per mode: virtual-model=1, product-only=1, video-360=2
// ═════════════════════════════════════════════════════════════════════════════

export type StudioPlan = 'studio_trial' | 'studio_starter' | 'studio_pro' | 'studio_scale';

export interface StudioPlanConfig {
    price_id: string;
    credits_limit: number;   // Monthly credits included
    price: number;           // EUR per month
    name: string;
    features: string[];
    popular?: boolean;
}

export const STUDIO_PLANS: Record<StudioPlan, StudioPlanConfig> = {
    studio_trial: {
        price_id: '',
        credits_limit: 20,
        price: 0,
        name: 'Gratis proefperiode',
        features: [
            '20 gratis generaties',
            'Alle 3 modi (model, product, 360°)',
            'Watermark aanpassen',
            'Download op hoge resolutie',
        ],
    },
    studio_starter: {
        price_id: process.env.STRIPE_PRICE_STUDIO_STARTER || 'price_studio_starter_placeholder',
        credits_limit: 200,
        price: 29,
        name: 'Studio Starter',
        features: [
            '200 credits/maand',
            'Alle 3 modi (model, product, 360°)',
            'Watermark aanpassen',
            'Download op hoge resolutie',
            'E-mail support',
        ],
    },
    studio_pro: {
        price_id: process.env.STRIPE_PRICE_STUDIO_PRO || 'price_studio_pro_placeholder',
        credits_limit: 500,
        price: 59,
        name: 'Studio Pro',
        popular: true,
        features: [
            '500 credits/maand',
            'Alle 3 modi (model, product, 360°)',
            'Watermark aanpassen',
            'Download op hoge resolutie',
            'Prioriteit support',
            'Credits ongebruikt? Rollen over',
        ],
    },
    studio_scale: {
        price_id: process.env.STRIPE_PRICE_STUDIO_SCALE || 'price_studio_scale_placeholder',
        credits_limit: 1000,
        price: 99,
        name: 'Studio Scale',
        features: [
            '1.000 credits/maand',
            'Alle 3 modi (model, product, 360°)',
            'Watermark aanpassen',
            'Download op hoge resolutie',
            'Prioriteit support',
            'Credits ongebruikt? Rollen over',
        ],
    },
};

// ═════════════════════════════════════════════════════════════════════════════
// Studio credit packs (one-time purchases)
// ═════════════════════════════════════════════════════════════════════════════

export interface CreditPackConfig {
    price_id: string;
    credits: number;
    price: number;           // EUR, one-time
    name: string;
    popular?: boolean;
}

export const STUDIO_CREDIT_PACKS: CreditPackConfig[] = [
    {
        price_id: process.env.STRIPE_PRICE_CREDITS_50 || 'price_credits_50_placeholder',
        credits: 50,
        price: 9,
        name: '50 credits',
    },
    {
        price_id: process.env.STRIPE_PRICE_CREDITS_150 || 'price_credits_150_placeholder',
        credits: 150,
        price: 24,
        name: '150 credits',
        popular: true,
    },
    {
        price_id: process.env.STRIPE_PRICE_CREDITS_300 || 'price_credits_300_placeholder',
        credits: 300,
        price: 45,
        name: '300 credits',
    },
];

// ── Studio lookup helpers ────────────────────────────────────────────────────

/** Find which StudioPlan a Stripe Price ID belongs to */
export function studioPlanByPriceId(priceId: string): StudioPlan | null {
    for (const [key, config] of Object.entries(STUDIO_PLANS)) {
        if (config.price_id === priceId) return key as StudioPlan;
    }
    return null;
}

/** Find which CreditPackConfig a Stripe Price ID belongs to */
export function creditPackByPriceId(priceId: string): CreditPackConfig | null {
    return STUDIO_CREDIT_PACKS.find(p => p.price_id === priceId) ?? null;
}

/** Get a Studio plan config by key, with fallback to trial */
export function getStudioPlanConfig(plan: StudioPlan): StudioPlanConfig {
    return STUDIO_PLANS[plan] ?? STUDIO_PLANS.studio_trial;
}
