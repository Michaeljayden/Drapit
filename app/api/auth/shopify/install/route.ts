import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop');

    if (!shop) {
        return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 });
    }

    const clientId = process.env.SHOPIFY_API_KEY;
    const scopes = 'write_products,read_shipping'; // Match shopify.app.toml
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/shopify/callback`;

    const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}`;

    return NextResponse.redirect(installUrl);
}
