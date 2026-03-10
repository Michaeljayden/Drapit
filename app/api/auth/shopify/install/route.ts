import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop');

    if (!shop) {
        return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 });
    }

    // Validate shop domain format to prevent open-redirect attacks
    if (!/^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/.test(shop)) {
        return NextResponse.json({ error: 'Invalid shop domain' }, { status: 400 });
    }

    const clientId = process.env.SHOPIFY_API_KEY;

    // Only request scopes we actually need:
    // - read_themes, write_themes: to inject the widget script tag into the store theme
    // (write_products removed — the widget reads product images from the Liquid context, not the Admin API)
    const scopes = 'read_themes,write_themes';

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/shopify/callback`;

    // Generate a cryptographically random nonce for CSRF protection
    const state = randomBytes(16).toString('hex');

    const installUrl =
        `https://${shop}/admin/oauth/authorize` +
        `?client_id=${clientId}` +
        `&scope=${scopes}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&state=${state}`;

    // Store the nonce in a short-lived HttpOnly cookie so we can verify it in the callback
    const response = NextResponse.redirect(installUrl);
    response.cookies.set('shopify_oauth_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600, // 10 minutes — plenty of time to complete the OAuth flow
        path: '/',
    });

    return response;
}
