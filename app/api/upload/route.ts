// =============================================================================
// POST /api/upload — Temporary image upload for the widget
// =============================================================================
// The widget needs to upload a user photo (File) and get back a public URL
// that the /api/tryon route can fetch. We store it in Supabase Storage.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';

// CORS — widget calls this from external shop domains
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Drapit-Key',
};

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

// SHA-256 for API key lookup
async function sha256(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: NextRequest) {
    try {
        const supabase = getSupabaseAdmin();

        // ── Authenticate via X-Drapit-Key ────────────────────────────────
        const apiKey = request.headers.get('X-Drapit-Key');
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Missing X-Drapit-Key header' },
                { status: 401, headers: CORS_HEADERS }
            );
        }

        const keyHash = await sha256(apiKey);
        const { data: keyRow, error: keyErr } = await supabase
            .from('api_keys')
            .select('shop_id, is_active')
            .eq('key_hash', keyHash)
            .single();

        if (keyErr || !keyRow || !keyRow.is_active) {
            return NextResponse.json(
                { error: 'Invalid or inactive API key' },
                { status: 401, headers: CORS_HEADERS }
            );
        }

        // ── Parse multipart form data ───────────────────────────────────
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file || !file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'No valid image file provided' },
                { status: 400, headers: CORS_HEADERS }
            );
        }

        // Limit file size to 10MB
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File too large (max 10MB)' },
                { status: 400, headers: CORS_HEADERS }
            );
        }

        // ── Upload to Supabase Storage ──────────────────────────────────
        const ext = file.name.split('.').pop() || 'jpg';
        const uniqueId = crypto.randomUUID();
        const storagePath = `${keyRow.shop_id}/uploads/${uniqueId}.${ext}`;

        const buffer = await file.arrayBuffer();
        const { error: uploadErr } = await supabase.storage
            .from('tryons')
            .upload(storagePath, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadErr) {
            console.error('[drapit/upload] Storage error:', uploadErr);
            return NextResponse.json(
                { error: 'Upload failed' },
                { status: 500, headers: CORS_HEADERS }
            );
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('tryons')
            .getPublicUrl(storagePath);

        return NextResponse.json({ url: urlData.publicUrl }, { status: 201, headers: CORS_HEADERS });
    } catch (err) {
        console.error('[drapit/upload] Unexpected error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500, headers: CORS_HEADERS }
        );
    }
}
