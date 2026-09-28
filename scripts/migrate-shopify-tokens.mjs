// =============================================================================
// Eenmalig: zet alle legacy (niet-verlopende) Shopify offline tokens om naar
// expiring tokens, en ververs expiring tokens waarvan de refresh token binnen
// 14 dagen verloopt (houdt inactieve shops gekoppeld).
//
// Gebruik (in de projectmap, met .env.local geladen):
//   node --env-file=.env.local scripts/migrate-shopify-tokens.mjs          (dry run)
//   node --env-file=.env.local scripts/migrate-shopify-tokens.mjs --apply
//
// LET OP: token exchange is onomkeerbaar — Shopify trekt het oude token in.
// Deploy eerst de nieuwe code (lib/shopify-token.ts) vóór je --apply draait.
// =============================================================================

import { createClient } from '@supabase/supabase-js';

const APPLY = process.argv.includes('--apply');
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
});

async function tokenRequest(shop, params) {
    const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
        body: new URLSearchParams({
            client_id: process.env.SHOPIFY_API_KEY,
            client_secret: process.env.SHOPIFY_API_SECRET,
            ...params,
        }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.access_token) throw new Error(`${res.status} ${JSON.stringify(data)}`);
    return data;
}

function columns(t) {
    const now = Date.now();
    return {
        shopify_access_token: t.access_token,
        shopify_token_expires_at: t.expires_in ? new Date(now + t.expires_in * 1000).toISOString() : null,
        shopify_refresh_token: t.refresh_token ?? null,
        shopify_refresh_token_expires_at: t.refresh_token_expires_in
            ? new Date(now + t.refresh_token_expires_in * 1000).toISOString()
            : null,
    };
}

const { data: shops, error } = await admin
    .from('shops')
    .select('id, shopify_domain, shopify_access_token, shopify_refresh_token, shopify_refresh_token_expires_at')
    .not('shopify_domain', 'is', null)
    .not('shopify_access_token', 'is', null);

if (error) throw error;

const soon = Date.now() + 14 * 24 * 3600 * 1000;
let ok = 0, failed = 0, skipped = 0;

for (const s of shops) {
    const legacy = !s.shopify_refresh_token;
    const refreshSoon = !legacy && s.shopify_refresh_token_expires_at && new Date(s.shopify_refresh_token_expires_at).getTime() < soon;
    if (!legacy && !refreshSoon) { skipped++; continue; }

    const action = legacy ? 'migrate' : 'refresh';
    if (!APPLY) { console.log(`[dry-run] ${action} ${s.shopify_domain}`); continue; }

    try {
        const t = legacy
            ? await tokenRequest(s.shopify_domain, {
                grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
                subject_token: s.shopify_access_token,
                subject_token_type: 'urn:shopify:params:oauth:token-type:offline-access-token',
                requested_token_type: 'urn:shopify:params:oauth:token-type:offline-access-token',
                expiring: '1',
            })
            : await tokenRequest(s.shopify_domain, { grant_type: 'refresh_token', refresh_token: s.shopify_refresh_token });

        const { error: upErr } = await admin.from('shops').update(columns(t)).eq('id', s.id);
        if (upErr) throw upErr;
        console.log(`✓ ${action} ${s.shopify_domain}`);
        ok++;
    } catch (e) {
        console.error(`✗ ${action} ${s.shopify_domain}: ${e.message}`);
        failed++;
    }
}

console.log(`\nKlaar${APPLY ? '' : ' (dry run — gebruik --apply)'}: ${ok} ok, ${failed} mislukt, ${skipped} al up-to-date, ${shops.length} totaal.`);
