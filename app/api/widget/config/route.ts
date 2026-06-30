// =============================================================================
// GET /api/widget/config?shop=<domain>
// =============================================================================
// Zero-config support for the storefront widget.
// The theme app extension block passes the shop's permanent domain
// (e.g. {{ shop.permanent_domain }}). The widget calls this endpoint to fetch
// its publishable API key, so the merchant never has to paste a key manually.
//
// The returned key is a *publishable* key (it already lives in the public
// storefront HTML in the legacy flow), so serving it by shop domain does not
// expose anything new. All upload/try-on endpoints still enforce per-shop
// monthly limits.
//
// Returns: { key: string } | { error: string }
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } },
    );
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const shopParam = (searchParams.get('shop') || '').trim().toLowerCase();

    if (!shopParam) {
        return NextResponse.json(
            { error: 'Missing shop parameter' },
            { status: 400, headers: CORS_HEADERS },
        );
    }

    try {
        const supabase = getSupabaseAdmin();

        // Match on the Shopify permanent domain first, then on the custom domain.
        const { data: shop } = await supabase
            .from('shops')
            .select('id, widget_public_key, shopify_domain, domain')
            .or(`shopify_domain.eq.${shopParam},domain.eq.${shopParam}`)
            .limit(1)
            .maybeSingle();

        if (!shop) {
            return NextResponse.json(
                { error: 'Shop not found' },
                { status: 404, headers: CORS_HEADERS },
            );
        }

        let key = shop.widget_public_key as string | null;

        // Fallback: if no publishable key is cached yet, surface the prefix of an
        // active api key is NOT possible (keys are hashed), so we just report
        // that configuration is pending.
        if (!key) {
            return NextResponse.json(
                { error: 'Widget not configured yet' },
                { status: 409, headers: CORS_HEADERS },
            );
        }

        return NextResponse.json({ key }, { status: 200, headers: CORS_HEADERS });
    } catch (err) {
        console.error('[widget/config] Unexpected error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500, headers: CORS_HEADERS },
        );
    }
}
