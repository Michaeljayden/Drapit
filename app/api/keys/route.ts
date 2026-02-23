import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

// Generate a UUID-style API key
function generateApiKey(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const segments = [8, 4, 4, 4, 12];
    return 'Drapit_' + segments
        .map(len => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join(''))
        .join('-');
}

// SHA-256 hash
async function hashKey(key: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, shop_id } = body;

        if (!name || !shop_id) {
            return NextResponse.json({ error: 'Name and shop_id are required' }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        // Generate key
        const rawKey = generateApiKey();
        const keyHash = await hashKey(rawKey);
        const keyPrefix = rawKey.slice(0, 8);

        // Insert
        const { data, error } = await supabase
            .from('api_keys')
            .insert({
                shop_id,
                key_hash: keyHash,
                key_prefix: keyPrefix,
                name,
                is_active: true,
            })
            .select('id')
            .single();

        if (error) {
            console.error('[api/keys] Insert error:', error);
            return NextResponse.json({ error: 'Failed to create key' }, { status: 500 });
        }

        // Return the raw key ONCE — it's hashed in the database
        return NextResponse.json({
            id: data.id,
            key: rawKey,
            key_prefix: keyPrefix,
        });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
