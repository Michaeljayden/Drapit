// =============================================================================
// Shopify expiring offline access tokens
// =============================================================================
// Shopify requires expiring offline tokens for all public apps from
// 1 January 2027. An expiring token lives ~1 hour and comes with a refresh
// token (~90 days) that rotates on every refresh.
//
// getShopifyAccessToken(shopId) is the ONLY way code should obtain a token for
// Shopify API calls. It:
//   • returns the stored token while it is still valid,
//   • refreshes it when it is (almost) expired,
//   • migrates a legacy non-expiring token via token exchange (one-time,
//     irreversible — Shopify revokes the old token).
//
// Docs: https://shopify.dev/docs/apps/build/authentication-authorization/migrate-to-expiring-offline-access-tokens
// =============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const REFRESH_MARGIN_MS = 5 * 60 * 1000; // refresh 5 min before expiry

export interface ShopifyTokenResponse {
    access_token: string;
    scope?: string;
    expires_in?: number;
    refresh_token?: string;
    refresh_token_expires_in?: number;
}

interface ShopTokenRow {
    id: string;
    shopify_domain: string | null;
    shopify_access_token: string | null;
    shopify_token_expires_at: string | null;
    shopify_refresh_token: string | null;
    shopify_refresh_token_expires_at: string | null;
}

const TOKEN_COLUMNS =
    'id, shopify_domain, shopify_access_token, shopify_token_expires_at, shopify_refresh_token, shopify_refresh_token_expires_at';

function getAdmin(): SupabaseClient {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } },
    );
}

/** Converts a Shopify token response into the columns we store on `shops`. */
export function tokenColumnsFromResponse(t: ShopifyTokenResponse) {
    const now = Date.now();
    return {
        shopify_access_token: t.access_token,
        shopify_token_expires_at: t.expires_in
            ? new Date(now + t.expires_in * 1000).toISOString()
            : null,
        shopify_refresh_token: t.refresh_token ?? null,
        shopify_refresh_token_expires_at: t.refresh_token_expires_in
            ? new Date(now + t.refresh_token_expires_in * 1000).toISOString()
            : null,
    };
}

async function postTokenEndpoint(
    shopDomain: string,
    params: Record<string, string>,
): Promise<ShopifyTokenResponse> {
    const body = new URLSearchParams({
        client_id: process.env.SHOPIFY_API_KEY!,
        client_secret: process.env.SHOPIFY_API_SECRET!,
        ...params,
    });

    const res = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
        },
        body,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.access_token) {
        throw new Error(
            `Shopify token request failed (${res.status}) for ${shopDomain}: ${JSON.stringify(data)}`,
        );
    }
    return data as ShopifyTokenResponse;
}

/** Authorization-code grant (install / re-auth) — requests an expiring token. */
export function exchangeAuthCodeForExpiringToken(shopDomain: string, code: string) {
    return postTokenEndpoint(shopDomain, { code, expiring: '1' });
}

/** Refresh an expiring token. Shopify rotates the refresh token. */
export function refreshShopifyToken(shopDomain: string, refreshToken: string) {
    return postTokenEndpoint(shopDomain, {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
    });
}

/** One-time migration of a legacy non-expiring offline token. Revokes the old token. */
export function migrateLegacyShopifyToken(shopDomain: string, legacyToken: string) {
    return postTokenEndpoint(shopDomain, {
        grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
        subject_token: legacyToken,
        subject_token_type: 'urn:shopify:params:oauth:token-type:offline-access-token',
        requested_token_type: 'urn:shopify:params:oauth:token-type:offline-access-token',
        expiring: '1',
    });
}

function isStillValid(row: ShopTokenRow): boolean {
    if (!row.shopify_token_expires_at) return false;
    return new Date(row.shopify_token_expires_at).getTime() - Date.now() > REFRESH_MARGIN_MS;
}

/**
 * Returns a valid Shopify Admin API access token for the shop, refreshing or
 * migrating it when needed. Returns null when the shop has no Shopify link.
 * Throws when refresh fails (e.g. refresh token expired → merchant must
 * reopen the app to re-authorize).
 */
export async function getShopifyAccessToken(
    shopId: string,
    admin: SupabaseClient = getAdmin(),
): Promise<string | null> {
    const { data: row } = await admin
        .from('shops')
        .select(TOKEN_COLUMNS)
        .eq('id', shopId)
        .single<ShopTokenRow>();

    if (!row?.shopify_domain || !row.shopify_access_token) return null;

    // 1. Current token still valid
    if (isStillValid(row)) return row.shopify_access_token;

    // 2. Legacy non-expiring token (no refresh token stored) → migrate once
    if (!row.shopify_refresh_token) {
        let fresh: ShopifyTokenResponse;
        try {
            fresh = await migrateLegacyShopifyToken(row.shopify_domain, row.shopify_access_token);
        } catch (err) {
            // Another request may have migrated it concurrently
            const winner = await rereadIfChanged(admin, row);
            if (winner) return winner;
            throw err;
        }

        await admin
            .from('shops')
            .update(tokenColumnsFromResponse(fresh))
            .eq('id', row.id)
            .eq('shopify_access_token', row.shopify_access_token);
        console.log(`[shopify-token] Migrated legacy token to expiring token for ${row.shopify_domain}`);
        return fresh.access_token;
    }

    // 3. Expired / expiring → refresh (refresh token rotates)
    try {
        const fresh = await refreshShopifyToken(row.shopify_domain, row.shopify_refresh_token);
        // Optimistic lock: only write if nobody else rotated the refresh token meanwhile
        await admin
            .from('shops')
            .update(tokenColumnsFromResponse(fresh))
            .eq('id', row.id)
            .eq('shopify_refresh_token', row.shopify_refresh_token);
        return fresh.access_token;
    } catch (err) {
        // A concurrent request may already have refreshed with this refresh token
        const winner = await rereadIfChanged(admin, row);
        if (winner) return winner;
        console.error('[shopify-token] Refresh failed — merchant must reopen the app:', err);
        throw err;
    }
}

/** Re-reads the row; returns the new access token if another request replaced it. */
async function rereadIfChanged(admin: SupabaseClient, before: ShopTokenRow): Promise<string | null> {
    const { data } = await admin
        .from('shops')
        .select(TOKEN_COLUMNS)
        .eq('id', before.id)
        .single<ShopTokenRow>();
    if (data?.shopify_access_token && data.shopify_access_token !== before.shopify_access_token && isStillValid(data)) {
        return data.shopify_access_token;
    }
    return null;
}
