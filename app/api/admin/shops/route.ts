import { NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // SECURITY: Only allow specific admin emails
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!user || !user.email || user.email !== adminEmail) {
        return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 });
    }

    const serviceClient = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: shops, error } = await serviceClient
        .from('shops')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(shops);
}
