import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const creditAdjustmentSchema = z.object({
    shop_id: z.string().uuid(),
    tryons_amount: z.number().int().min(0).optional().default(0),
    studio_credits_amount: z.number().int().min(0).optional().default(0),
    reason: z.string().max(500).optional(),
}).refine(
    (data) => data.tryons_amount > 0 || data.studio_credits_amount > 0,
    { message: 'Minstens één van tryons_amount of studio_credits_amount moet > 0 zijn' }
);

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const adminEmail = process.env.ADMIN_EMAIL;

    if (!user || !user.email || user.email !== adminEmail) {
        return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 });
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Ongeldige JSON' }, { status: 400 });
    }

    const parseResult = creditAdjustmentSchema.safeParse(body);
    if (!parseResult.success) {
        return NextResponse.json({
            error: 'Validatiefout',
            details: parseResult.error.issues
        }, { status: 400 });
    }

    const { shop_id, tryons_amount, studio_credits_amount, reason } = parseResult.data;

    const serviceClient = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch current shop
    const { data: shop, error: shopError } = await serviceClient
        .from('shops')
        .select('id, name, email, extra_tryons, studio_extra_credits')
        .eq('id', shop_id)
        .single();

    if (shopError || !shop) {
        return NextResponse.json({ error: 'Shop niet gevonden' }, { status: 404 });
    }

    // Build update
    const updates: Record<string, number> = {};
    if (tryons_amount > 0) {
        updates.extra_tryons = (shop.extra_tryons ?? 0) + tryons_amount;
    }
    if (studio_credits_amount > 0) {
        updates.studio_extra_credits = (shop.studio_extra_credits ?? 0) + studio_credits_amount;
    }

    const { error: updateError } = await serviceClient
        .from('shops')
        .update(updates)
        .eq('id', shop_id);

    if (updateError) {
        return NextResponse.json({ error: 'Update mislukt: ' + updateError.message }, { status: 500 });
    }

    // Audit: log VTON try-on adjustment
    if (tryons_amount > 0) {
        await serviceClient.from('topup_transactions').insert({
            shop_id,
            tryons_added: tryons_amount,
            amount_eur: 0,
            status: 'succeeded',
            trigger_type: 'admin',
            admin_email: user.email,
            admin_reason: reason || null,
        });
    }

    // Audit: log studio credit adjustment
    if (studio_credits_amount > 0) {
        await serviceClient.from('studio_credit_adjustments').insert({
            shop_id,
            credits_added: studio_credits_amount,
            admin_email: user.email!,
            reason: reason || null,
        });
    }

    return NextResponse.json({
        success: true,
        shop_id,
        new_extra_tryons: updates.extra_tryons ?? shop.extra_tryons,
        new_studio_extra_credits: updates.studio_extra_credits ?? shop.studio_extra_credits,
        tryons_added: tryons_amount,
        studio_credits_added: studio_credits_amount,
    });
}
