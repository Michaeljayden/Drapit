import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', id);

    if (error) {
        console.error('[api/keys] Revoke error:', error);
        return NextResponse.json({ error: 'Failed to revoke key' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
