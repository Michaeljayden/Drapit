import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { PLANS } from '@/lib/stripe';
import type { Plan } from '@/lib/supabase/types';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const body = await request.json();
    const { shopName, domain, plan } = body;

    if (!shopName || typeof shopName !== 'string' || shopName.trim().length === 0) {
        return NextResponse.json({ error: 'Shopnaam is verplicht' }, { status: 400 });
    }

    const selectedPlan = (plan as Plan) || 'trial';
    if (!PLANS[selectedPlan]) {
        return NextResponse.json({ error: 'Ongeldig abonnement' }, { status: 400 });
    }

    const planConfig = PLANS[selectedPlan];

    // Use service role to bypass RLS for INSERT
    const serviceClient = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if user already has a shop
    const { data: existingShop } = await serviceClient
        .from('shops')
        .select('id')
        .eq('owner_id', user.id)
        .single();

    if (existingShop) {
        return NextResponse.json({ error: 'Je hebt al een shop' }, { status: 409 });
    }

    // Create the shop with selected plan and matching try-on limit
    const { data: shop, error: insertError } = await serviceClient
        .from('shops')
        .insert({
            name: shopName.trim(),
            email: user.email!,
            owner_id: user.id,
            domain: domain?.trim() || null,
            plan: selectedPlan,
            monthly_tryon_limit: planConfig.limit,
        })
        .select('id')
        .single();

    if (insertError) {
        return NextResponse.json({ error: 'Kon shop niet aanmaken' }, { status: 500 });
    }

    // Send welcome email (fire-and-forget — non-blocking)
    if (user.email) {
        sendWelcomeEmail(user.email, shopName.trim()).catch(console.error);
    }

    return NextResponse.json({ shopId: shop.id, plan: selectedPlan });
}
