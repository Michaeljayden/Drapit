import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Fallback to anonymous key for public auth routes if needed, 
// but here we use service role to upsert the shop record.
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const shop = searchParams.get('shop');
    const hmac = searchParams.get('hmac');

    if (!code || !shop || !hmac) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Verify HMAC (Crucial for Shopify security)
    // TODO: Implement hmac validation using crypto and SHOPIFY_API_SECRET

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

    const { access_token } = await tokenResponse.json();

    if (!access_token) {
        return NextResponse.json({ error: 'Failed to retrieve access token' }, { status: 500 });
    }

    // 3. Upsert shop in Supabase
    const { data, error } = await supabase
        .from('shops')
        .upsert({
            shopify_domain: shop,
            shopify_access_token: access_token,
            shopify_app_installed: true,
            name: shop.replace('.myshopify.com', ''),
            email: `${shop}@shopify-user.com`, // Placeholder, should fetch from Shopify API
        }, { onConflict: 'shopify_domain' })
        .select()
        .single();

    if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json({ error: 'Failed to save shop data' }, { status: 500 });
    }

    // 4. Redirect to dashboard
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?shop_id=${data.id}`);
}
