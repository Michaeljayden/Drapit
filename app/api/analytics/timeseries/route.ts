import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const shopId = searchParams.get('shop_id');
        const days = parseInt(searchParams.get('days') || '30', 10);

        if (!shopId) {
            return NextResponse.json({ error: 'shop_id is required' }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();
        const now = new Date();
        const start = new Date(now);
        start.setDate(start.getDate() - days);

        // ── Fetch all tryons in the window ─────────────────────────────────
        const { data: tryons, error } = await supabase
            .from('tryons')
            .select('created_at, status, converted')
            .eq('shop_id', shopId)
            .gte('created_at', start.toISOString())
            .lte('created_at', now.toISOString())
            .order('created_at', { ascending: true });

        if (error) {
            console.error('[analytics/timeseries] query error:', error);
            return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
        }

        // ── Pre-fill every day in the range with zeros ─────────────────────
        const dayMap: Record<string, { tryons: number; succeeded: number; failed: number; conversions: number }> = {};

        for (let i = 0; i < days; i++) {
            const d = new Date(now);
            d.setDate(d.getDate() - (days - 1 - i));
            const key = d.toISOString().split('T')[0]; // YYYY-MM-DD
            dayMap[key] = { tryons: 0, succeeded: 0, failed: 0, conversions: 0 };
        }

        // ── Bucket each tryon into its day ─────────────────────────────────
        for (const t of (tryons || [])) {
            const row = t as { created_at: string; status: string; converted: boolean };
            const key = row.created_at.split('T')[0];
            if (!dayMap[key]) continue; // out of range (edge case)

            dayMap[key].tryons++;

            if (row.status === 'succeeded') dayMap[key].succeeded++;
            if (row.status === 'failed') dayMap[key].failed++;
            if (row.converted) dayMap[key].conversions++;
        }

        // ── Convert to array ───────────────────────────────────────────────
        const series = Object.entries(dayMap).map(([date, counts]) => ({
            date,
            // Human-readable label for chart x-axis
            label: new Date(date + 'T00:00:00').toLocaleDateString('nl-NL', {
                day: 'numeric',
                month: 'short',
            }),
            ...counts,
        }));

        return NextResponse.json({
            series,
            period_days: days,
            total: series.reduce((sum, d) => sum + d.tryons, 0),
        });
    } catch (err) {
        console.error('[analytics/timeseries] Unexpected error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
