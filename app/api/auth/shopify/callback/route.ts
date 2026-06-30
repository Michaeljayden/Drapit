import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWelcomeEmail } from '@/lib/email';
import { ensureShopAuthUser, ensureWidgetKey, shopifyLoginEmail } from '@/lib/shopify-onboarding';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://drapit.io';

// ---------------------------------------------------------------------------
// HMAC validation — verifies the request is genuinely from Shopify
// ---------------------------------------------------------------------------
async function verifyShopifyHmac(searchParams: URLSearchParams): Promise<boolean> {
    const secret = process.env.SHOPIFY_API_SECRET;
    if (!secret) {
        console.warn('[shopify/callback] SHOPIFY_API_SECRET not set — skipping HMAC verification');
        return true;
    }

    const hmac = searchParams.get('hmac');
    if (!hmac) return false;

    // Build the message: all query params except 'hmac', sorted and joined
    const params: string[] = [];
    searchParams.forEach((value, key) => {
        if (key !== 'hmac') {
            params.push(`${key}=${value}`);
        }
    });
    params.sort();
    const message = params.join('&');

    // HMAC-SHA256 using Web Crypto
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const msgData = encoder.encode(message);

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const computedHmac = signatureArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    // Constant-time comparison to prevent timing attacks
    if (computedHmac.length !== hmac.length) return false;
    let mismatch = 0;
    for (let i = 0; i < computedHmac.length; i++) {
        mismatch |= computedHmac.charCodeAt(i) ^ hmac.charCodeAt(i);
    }
    return mismatch === 0;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const shop = searchParams.get('shop');
    const state = searchParams.get('state');

    if (!code || !shop) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 0. Verify CSRF state nonce
    const storedState = request.cookies.get('shopify_oauth_state')?.value;
    if (!state || !storedState || state !== storedState) {
        console.error('[shopify/callback] State mismatch — possible CSRF attack for shop:', shop);
        return NextResponse.json({ error: 'Invalid state parameter' }, { status: 403 });
    }

    // 1. Verify HMAC signature
    const isValid = await verifyShopifyHmac(searchParams);
    if (!isValid) {
        console.error('[shopify/callback] HMAC validation failed for shop:', shop);
        return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
    }

    // 2. Exchange code for access token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            client_id: process.env.SHOPIFY_API_KEY,
            client_secret: process.env.SHOPIFY_API_SECRET,
            code,
        }),
    });

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    if (!access_token) {
        console.error('[shopify/callback] Failed to get access token:', tokenData);
        return NextResponse.json({ error: 'Failed to retrieve access token' }, { status: 500 });
    }

    // 3. Fetch shop email from Shopify API
    let shopEmail = `${shop.replace('.myshopify.com', '')}@shopify-placeholder.com`;
    try {
        const shopRes = await fetch(`https://${shop}/admin/api/2024-01/shop.json`, {
            headers: { 'X-Shopify-Access-Token': access_token },
        });
        if (shopRes.ok) {
            const shopData = await shopRes.json();
            shopEmail = shopData.shop?.email || shopEmail;
        }
    } catch {
        console.warn('[shopify/callback] Could not fetch shop email, using placeholder');
    }

    // 4. Check if this is a new shop (for welcome email)
    const { data: existingShop } = await supabase
        .from('shops')
        .select('id')
        .eq('shopify_domain', shop)
        .maybeSingle();

    const isNewInstall = !existingShop;

    // 5. Upsert shop in Supabase
    const shopDisplayName = shop.replace('.myshopify.com', '');
    const { data, error } = await supabase
        .from('shops')
        .upsert({
            shopify_domain: shop,
            shopify_access_token: access_token,
            shopify_app_installed: true,
            billing_source: 'shopify',   // Shopify App Store installs always use Shopify billing
            name: shopDisplayName,
            email: shopEmail,
        }, { onConflict: 'shopify_domain' })
        .select()
        .single();

    if (error) {
        console.error('[shopify/callback] Supabase error:', error);
        return NextResponse.json({ error: 'Failed to save shop data' }, { status: 500 });
    }

    // 6. Link the store to a dedicated dashboard account (owner_id) so the
    //    merchant is recognised as a Shopify (billing_source = 'shopify')
    //    merchant, and auto-generate the publishable widget key so the
    //    storefront widget works without manual configuration.
    try {
        await ensureShopAuthUser(supabase, {
            id: data.id,
            owner_id: data.owner_id ?? null,
            shopify_domain: shop,
            email: shopEmail,
        });
        await ensureWidgetKey(supabase, {
            id: data.id,
            widget_public_key: data.widget_public_key ?? null,
        });
    } catch (linkErr) {
        // Non-fatal: the merchant can still complete setup from the dashboard.
        console.error('[shopify/callback] Onboarding linking error:', linkErr);
    }

    // 7. Send welcome email on first install (fire-and-forget)
    if (isNewInstall && shopEmail && !shopEmail.includes('shopify-placeholder')) {
        sendWelcomeEmail(shopEmail, shopDisplayName).catch(console.error);
    }

    // 8. Auto-login the merchant via a one-time magic link, then land them in
    //    the dashboard. New installs go to billing (Shopify Managed Pricing),
    //    re-installs go straight to the dashboard.
    const next = isNewInstall ? '/dashboard/billing' : '/dashboard';
    const loginEmail = shopifyLoginEmail(shop);

    let redirectUrl = `${APP_URL}${next}`; // fallback if magic-link generation fails

    try {
        const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email: loginEmail,
            options: {
                redirectTo: `${APP_URL}/auth/callback?next=${encodeURIComponent(next)}`,
            },
        });
        if (!linkErr && linkData?.properties?.action_link) {
            redirectUrl = linkData.properties.action_link;
        } else if (linkErr) {
            console.error('[shopify/callback] generateLink error:', linkErr.message);
        }
    } catch (err) {
        console.error('[shopify/callback] generateLink threw:', err);
    }

    const redirectResponse = NextResponse.redirect(redirectUrl);
    // Clear the OAuth state cookie — one-time use only
    redirectResponse.cookies.set('shopify_oauth_state', '', { maxAge: 0, path: '/' });
    return redirectResponse;
}
