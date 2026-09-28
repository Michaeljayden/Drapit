// =============================================================================
// POST /api/cron/trial-emails — dagelijkse onboardingreeks (dag 3 / 10 / 14)
// =============================================================================
// Wordt elke dag om 08:00 UTC aangeroepen door pg_cron in Supabase (migratie
// 018_trial_emails_cron.sql) met header `x-cron-secret: $CRON_SECRET`.
//
// Per shop: leeftijd in dagen sinds created_at bepaalt welke stap aan de beurt
// is. Verstuurde stappen staan in shops.trial_emails_sent (int[]), dus een
// stap gaat nooit twee keer. Dag 14 wordt overgeslagen als de shop geen plan
// (meer) heeft — dan klopt "je plan loopt door" niet.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTrialStepEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const STEPS: Array<{ step: 3 | 10 | 14; minAge: number; maxAge: number }> = [
    { step: 3, minAge: 3, maxAge: 6 },
    { step: 10, minAge: 10, maxAge: 13 },
    { step: 14, minAge: 14, maxAge: 20 },
];

export async function POST(request: NextRequest) {
    const secret = process.env.CRON_SECRET;
    if (!secret || request.headers.get('x-cron-secret') !== secret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const since = new Date(Date.now() - 21 * 24 * 3600 * 1000).toISOString();
    const { data: shops, error } = await supabase
        .from('shops')
        .select('id, name, email, plan, created_at, tryons_this_month, trial_emails_sent')
        .gte('created_at', since);

    if (error) {
        console.error('[cron/trial-emails] query failed:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const results: Array<{ shop: string; step: number; sent: boolean }> = [];

    for (const shop of shops ?? []) {
        if (!shop.email || shop.email.includes('shopify-placeholder')) continue;
        const ageDays = Math.floor((Date.now() - new Date(shop.created_at).getTime()) / 86_400_000);
        const sent: number[] = shop.trial_emails_sent ?? [];

        for (const { step, minAge, maxAge } of STEPS) {
            if (ageDays < minAge || ageDays > maxAge || sent.includes(step)) continue;
            if (step === 14 && shop.plan === 'trial') continue;

            const ok = await sendTrialStepEmail(step, shop.email, shop.name, shop.tryons_this_month ?? 0);
            results.push({ shop: shop.name, step, sent: ok });
            if (ok) {
                await supabase
                    .from('shops')
                    .update({ trial_emails_sent: [...sent, step] })
                    .eq('id', shop.id);
            }
            break; // hooguit één stap per shop per dag
        }
    }

    console.log(`[cron/trial-emails] ${results.length} mails verwerkt`);
    return NextResponse.json({ processed: results.length, results });
}
