import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWelcomeEmail } from '@/lib/email';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    if (!code || !shop) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
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
            name: shopDisplayName,
            email: shopEmail,
        }, { onConflict: 'shopify_domain' })
        .select()
        .single();

    if (error) {
        console.error('[shopify/callback] Supabase error:', error);
        return NextResponse.json({ error: 'Failed to save shop data' }, { status: 500 });
    }

    // 6. Send welcome email on first install (fire-and-forget)
    if (isNewInstall && shopEmail && !shopEmail.includes('shopify-placeholder')) {
        sendWelcomeEmail(shopEmail, shopDisplayName).catch(console.error);
    }

    // 7. Redirect to dashboard
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?shop_id=${data.id}`);
}
