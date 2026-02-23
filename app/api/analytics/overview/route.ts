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

        // Current period start
        const periodStart = new Date(now);
        periodStart.setDate(periodStart.getDate() - days);

        // Previous period (for % change calculation)
        const prevPeriodStart = new Date(periodStart);
        prevPeriodStart.setDate(prevPeriodStart.getDate() - days);

        // ── Current period tryons ──────────────────────────────────────────
        const { data: currentTryons, error: currentErr } = await supabase
            .from('tryons')
            .select('id, status, product_id, converted')
            .eq('shop_id', shopId)
            .gte('created_at', periodStart.toISOString())
            .lte('created_at', now.toISOString());

        if (currentErr) {
            console.error('[analytics/overview] current query error:', currentErr);
            return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
        }

        // ── Previous period tryons ─────────────────────────────────────────
        const { data: prevTryons, error: prevErr } = await supabase
            .from('tryons')
            .select('id, status, converted')
            .eq('shop_id', shopId)
            .gte('created_at', prevPeriodStart.toISOString())
            .lt('created_at', periodStart.toISOString());

        if (prevErr) {
            console.error('[analytics/overview] previous query error:', prevErr);
        }

        const current = currentTryons || [];
        const prev = prevTryons || [];

        // ── Stats ──────────────────────────────────────────────────────────
        const tryonsThisPeriod = current.length;
        const tryonsLastPeriod = prev.length;

        const succeededCurrent = current.filter(
            (t: { status: string }) => t.status === 'succeeded'
        ).length;
        const succeededPrev = prev.filter(
            (t: { status: string }) => t.status === 'succeeded'
        ).length;

        const convertedCurrent = current.filter(
            (t: { converted: boolean }) => t.converted
        ).length;
        const convertedPrev = prev.filter(
            (t: { converted: boolean }) => t.converted
        ).length;

        const conversionRate = tryonsThisPeriod > 0
            ? ((convertedCurrent / tryonsThisPeriod) * 100)
            : 0;
        const prevConversionRate = tryonsLastPeriod > 0
            ? ((convertedPrev / tryonsLastPeriod) * 100)
            : 0;

        const successRate = tryonsThisPeriod > 0
            ? ((succeededCurrent / tryonsThisPeriod) * 100)
            : 0;
        const prevSuccessRate = tryonsLastPeriod > 0
            ? ((succeededPrev / tryonsLastPeriod) * 100)
            : 0;

        // ── % changes ─────────────────────────────────────────────────────
        function pctChange(current: number, previous: number): number | null {
            if (previous === 0) return current > 0 ? 100 : null;
            return ((current - previous) / previous) * 100;
        }

        // ── Top 5 products ────────────────────────────────────────────────
        const productCounts: Record<string, { tryons: number; conversions: number }> = {};
        for (const t of current) {
            const pid = (t as { product_id: string | null }).product_id || 'onbekend';
            if (!productCounts[pid]) productCounts[pid] = { tryons: 0, conversions: 0 };
            productCounts[pid].tryons++;
            if ((t as { converted: boolean }).converted) productCounts[pid].conversions++;
        }

        const topProducts = Object.entries(productCounts)
            .map(([product_id, counts]) => ({
                product_id,
                tryons: counts.tryons,
                conversions: counts.conversions,
                conversion_rate: counts.tryons > 0
                    ? parseFloat(((counts.conversions / counts.tryons) * 100).toFixed(1))
                    : 0,
            }))
            .sort((a, b) => b.tryons - a.tryons)
            .slice(0, 5);

        // ── Look up product names ─────────────────────────────────────────
        const productIds = topProducts
            .map((p) => p.product_id)
            .filter((id) => id !== 'onbekend');

        let productNames: Record<string, string> = {};
        if (productIds.length > 0) {
            const { data: products } = await supabase
                .from('products')
                .select('id, name')
                .in('id', productIds);

            if (products) {
                for (const p of products) {
                    productNames[(p as { id: string }).id] = (p as { name: string }).name;
                }
            }
        }

        const enrichedProducts = topProducts.map((p) => ({
            ...p,
            name: productNames[p.product_id] || p.product_id,
        }));

        return NextResponse.json({
            tryons_this_period: tryonsThisPeriod,
            tryons_last_period: tryonsLastPeriod,
            tryons_change: pctChange(tryonsThisPeriod, tryonsLastPeriod),
            conversions_this_period: convertedCurrent,
            conversions_last_period: convertedPrev,
            conversions_change: pctChange(convertedCurrent, convertedPrev),
            conversion_rate: parseFloat(conversionRate.toFixed(1)),
            prev_conversion_rate: parseFloat(prevConversionRate.toFixed(1)),
            conversion_rate_change: parseFloat((conversionRate - prevConversionRate).toFixed(1)),
            success_rate: parseFloat(successRate.toFixed(1)),
            prev_success_rate: parseFloat(prevSuccessRate.toFixed(1)),
            success_rate_change: parseFloat((successRate - prevSuccessRate).toFixed(1)),
            top_products: enrichedProducts,
            period_days: days,
        });
    } catch (err) {
        console.error('[analytics/overview] Unexpected error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
