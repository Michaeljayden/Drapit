// =============================================================================
// GET /api/tryon/[id] — Retrieve try-on status
// =============================================================================
// Authenticated endpoint: requires valid X-Drapit-Key header.
// Returns the current status of a try-on, including result_image_url when done.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Drapit-Key',
};

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ---------------------------------------------------------------------------
// Supabase admin client (service role — bypasses RLS)
// ---------------------------------------------------------------------------
function getSupabaseAdmin(): SupabaseClient {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        throw new Error('Missing Supabase environment variables');
    }
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

// ---------------------------------------------------------------------------
// SHA-256 hashing (Web Crypto — works in Edge runtime)
// ---------------------------------------------------------------------------
async function sha256(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = getSupabaseAdmin();
        const { id: tryonId } = await params;

        // ---------------------------------------------------------------
        // 1. AUTHENTICATION — X-Drapit-Key header
        // ---------------------------------------------------------------
        const apiKey = request.headers.get('X-Drapit-Key');
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Missing X-Drapit-Key header' },
                { status: 401, headers: CORS_HEADERS }
            );
        }

        const keyHash = await sha256(apiKey);

        const { data: keyRow, error: keyError } = await supabase
            .from('api_keys')
            .select('shop_id, is_active')
            .eq('key_hash', keyHash)
            .single();

        if (keyError || !keyRow) {
            return NextResponse.json(
                { error: 'Invalid API key' },
                { status: 401 }
            );
        }

        if (!keyRow.is_active) {
            return NextResponse.json(
                { error: 'API key is deactivated' },
                { status: 401 }
            );
        }

        // ---------------------------------------------------------------
        // 2. FETCH try-on record (scoped to shop)
        // ---------------------------------------------------------------
        const { data: tryon, error: tryonError } = await supabase
            .from('tryons')
            .select(
                'id, status, product_id, product_image_url, user_photo_url, result_image_url, created_at, completed_at'
            )
            .eq('id', tryonId)
            .eq('shop_id', keyRow.shop_id)
            .single();

        if (tryonError || !tryon) {
            return NextResponse.json(
                { error: 'Try-on not found' },
                { status: 404 }
            );
        }

        // ---------------------------------------------------------------
        // 3. RESPONSE
        // ---------------------------------------------------------------
        return NextResponse.json({
            tryon_id: tryon.id,
            status: tryon.status,
            product_id: tryon.product_id,
            product_image_url: tryon.product_image_url,
            user_photo_url: tryon.user_photo_url,
            result_image_url: tryon.result_image_url,
            created_at: tryon.created_at,
            completed_at: tryon.completed_at,
        });
    } catch (error) {
        console.error('[tryon/status] Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
