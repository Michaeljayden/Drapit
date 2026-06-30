// =============================================================================
// lib/shopify-onboarding.ts
// =============================================================================
// Helpers used by the Shopify OAuth callback to make a freshly installed store
// usable without manual steps:
//
//   1. ensureShopAuthUser()  — link the Shopify shop to a dedicated Supabase
//      auth user (owner_id) so the merchant is recognised in the dashboard as a
//      Shopify (billing_source = 'shopify') merchant. A dedicated synthetic
//      login email guarantees a clean 1 shop ↔ 1 user mapping and never clashes
//      with a direct drapit.io (Stripe) account that uses the same store email.
//
//   2. ensureWidgetKey()     — generate a publishable API key for the store and
//      cache it on shops.widget_public_key so the storefront widget works
//      zero-config (see /api/widget/config + the theme app extension block).
//
// Direct drapit.io customers are untouched — this only runs on Shopify install.
// =============================================================================

import type { SupabaseClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Deterministic synthetic login email for a Shopify store.
// e.g. "demo-store.myshopify.com" → "shopify+demo-store@drapit.io"
// ---------------------------------------------------------------------------
export function shopifyLoginEmail(shopDomain: string): string {
    const handle = shopDomain.replace(/\.myshopify\.com$/i, '').toLowerCase();
    return `shopify+${handle}@drapit.io`;
}

// ---------------------------------------------------------------------------
// API key generation (mirrors app/api/keys/route.ts)
// ---------------------------------------------------------------------------
function generateApiKey(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const segments = [8, 4, 4, 4, 12];
    return 'Drapit_' + segments
        .map((len) =>
            Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join(''),
        )
        .join('-');
}

async function hashKey(key: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

// ---------------------------------------------------------------------------
// ensureShopAuthUser — returns { userId, loginEmail }
// Creates (or reuses) a dedicated Supabase auth user and sets shops.owner_id.
// ---------------------------------------------------------------------------
export async function ensureShopAuthUser(
    admin: SupabaseClient,
    shop: { id: string; owner_id: string | null; shopify_domain: string; email: string | null },
): Promise<{ userId: string; loginEmail: string }> {
    const loginEmail = shopifyLoginEmail(shop.shopify_domain);

    // Already linked → nothing to do.
    if (shop.owner_id) {
        return { userId: shop.owner_id, loginEmail };
    }

    // Try to create the dedicated auth user.
    let userId: string | null = null;
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: loginEmail,
        email_confirm: true,
        user_metadata: {
            shopify_domain: shop.shopify_domain,
            store_email: shop.email,
        },
    });

    if (created?.user) {
        userId = created.user.id;
    } else if (createErr) {
        // User probably already exists (re-install) — look it up by email.
        const { data: list } = await admin.auth.admin.listUsers();
        const match = list?.users?.find((u) => u.email?.toLowerCase() === loginEmail.toLowerCase());
        if (match) userId = match.id;
    }

    if (!userId) {
        throw new Error(`Could not create or find auth user for ${shop.shopify_domain}`);
    }

    await admin.from('shops').update({ owner_id: userId }).eq('id', shop.id);
    return { userId, loginEmail };
}

// ---------------------------------------------------------------------------
// ensureWidgetKey — generates an API key + caches the publishable key.
// Idempotent: skips if the shop already has a cached widget_public_key.
// ---------------------------------------------------------------------------
export async function ensureWidgetKey(
    admin: SupabaseClient,
    shop: { id: string; widget_public_key?: string | null },
): Promise<string | null> {
    if (shop.widget_public_key) return shop.widget_public_key;

    const rawKey = generateApiKey();
    const keyHash = await hashKey(rawKey);
    const keyPrefix = rawKey.slice(0, 8);

    const { error: insertErr } = await admin.from('api_keys').insert({
        shop_id: shop.id,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        name: 'Shopify widget (auto)',
        is_active: true,
    });

    if (insertErr) {
        console.error('[shopify-onboarding] Could not create api key:', insertErr.message);
        return null;
    }

    await admin.from('shops').update({ widget_public_key: rawKey }).eq('id', shop.id);
    return rawKey;
}
