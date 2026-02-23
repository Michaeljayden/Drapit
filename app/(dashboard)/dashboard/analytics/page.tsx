import { createClient } from '@/lib/supabase/server';
import AnalyticsDashboard from '@/components/dashboard/analytics/AnalyticsDashboard';

// ── Helpers ─────────────────────────────────────────────────────────────────
function pctChange(current: number, previous: number): number | null {
    if (previous === 0) return current > 0 ? 100 : null;
    return parseFloat((((current - previous) / previous) * 100).toFixed(1));
}

function bucketByDay(
    tryons: { created_at: string; status: string; converted: boolean }[],
    days: number,
) {
    const now = new Date();
    const dayMap: Record<string, { tryons: number; succeeded: number; failed: number; conversions: number }> = {};

    for (let i = 0; i < days; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - (days - 1 - i));
        const key = d.toISOString().split('T')[0];
        dayMap[key] = { tryons: 0, succeeded: 0, failed: 0, conversions: 0 };
    }

    for (const t of tryons) {
        const key = t.created_at.split('T')[0];
        if (!dayMap[key]) continue;
        dayMap[key].tryons++;
        if (t.status === 'succeeded') dayMap[key].succeeded++;
        if (t.status === 'failed') dayMap[key].failed++;
        if (t.converted) dayMap[key].conversions++;
    }

    return Object.entries(dayMap).map(([date, counts]) => ({
        date,
        label: new Date(date + 'T00:00:00').toLocaleDateString('nl-NL', {
            day: 'numeric',
            month: 'short',
        }),
        ...counts,
    }));
}

// ── Page ────────────────────────────────────────────────────────────────────
export default async function AnalyticsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // ── Shop lookup ─────────────────────────────────────────────────────
    const { data: shop } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id)
        .single();

    if (!shop) {
        return (
            <div className="flex items-center justify-center h-64 text-sm text-[#64748B]">
                Geen shop gevonden. Maak eerst een shop aan.
            </div>
        );
    }

    const shopId = shop.id as string;
    const days = 30;
    const now = new Date();

    const periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - days);

    const prevPeriodStart = new Date(periodStart);
    prevPeriodStart.setDate(prevPeriodStart.getDate() - days);

    // ── Current period ──────────────────────────────────────────────────
    const { data: currentRaw } = await supabase
        .from('tryons')
        .select('id, status, product_id, converted, created_at, completed_at')
        .eq('shop_id', shopId)
        .gte('created_at', periodStart.toISOString())
        .order('created_at', { ascending: false });

    // ── Previous period ─────────────────────────────────────────────────
    const { data: prevRaw } = await supabase
        .from('tryons')
        .select('id, status, converted')
        .eq('shop_id', shopId)
        .gte('created_at', prevPeriodStart.toISOString())
        .lt('created_at', periodStart.toISOString());

    const current = (currentRaw || []) as {
        id: string;
        status: string;
        product_id: string | null;
        converted: boolean;
        created_at: string;
        completed_at: string | null;
    }[];
    const prev = (prevRaw || []) as { id: string; status: string; converted: boolean }[];

    // ── Stats ───────────────────────────────────────────────────────────
    const tryonsThis = current.length;
    const tryonsLast = prev.length;
    const convertedThis = current.filter((t) => t.converted).length;
    const convertedLast = prev.filter((t) => t.converted).length;
    const succeededThis = current.filter((t) => t.status === 'succeeded').length;
    const succeededLast = prev.filter((t) => t.status === 'succeeded').length;

    const convRate = tryonsThis > 0 ? parseFloat(((convertedThis / tryonsThis) * 100).toFixed(1)) : 0;
    const prevConvRate = tryonsLast > 0 ? parseFloat(((convertedLast / tryonsLast) * 100).toFixed(1)) : 0;
    const successRate = tryonsThis > 0 ? parseFloat(((succeededThis / tryonsThis) * 100).toFixed(1)) : 0;
    const prevSuccessRate = tryonsLast > 0 ? parseFloat(((succeededLast / tryonsLast) * 100).toFixed(1)) : 0;

    // ── Top 5 products ──────────────────────────────────────────────────
    const productMap: Record<string, { tryons: number; conversions: number }> = {};
    for (const t of current) {
        const pid = t.product_id || 'onbekend';
        if (!productMap[pid]) productMap[pid] = { tryons: 0, conversions: 0 };
        productMap[pid].tryons++;
        if (t.converted) productMap[pid].conversions++;
    }

    const topProducts = Object.entries(productMap)
        .map(([id, c]) => ({
            product_id: id,
            name: id,
            tryons: c.tryons,
            conversions: c.conversions,
            conversion_rate: c.tryons > 0 ? parseFloat(((c.conversions / c.tryons) * 100).toFixed(1)) : 0,
        }))
        .sort((a, b) => b.tryons - a.tryons)
        .slice(0, 5);

    // Enrich product names
    const productIds = topProducts.map((p) => p.product_id).filter((id) => id !== 'onbekend');
    if (productIds.length > 0) {
        const { data: products } = await supabase
            .from('products')
            .select('id, name')
            .in('id', productIds);

        if (products) {
            const nameMap: Record<string, string> = {};
            for (const p of products as { id: string; name: string }[]) {
                nameMap[p.id] = p.name;
            }
            for (const tp of topProducts) {
                if (nameMap[tp.product_id]) tp.name = nameMap[tp.product_id];
            }
        }
    }

    // ── Time series ─────────────────────────────────────────────────────
    const timeseries = bucketByDay(
        current.map((t) => ({ created_at: t.created_at, status: t.status, converted: t.converted })),
        days,
    );

    // ── Recent 10 ───────────────────────────────────────────────────────
    const recentTryons = current.slice(0, 10).map((t) => ({
        id: t.id,
        product_id: t.product_id,
        status: t.status as 'pending' | 'processing' | 'succeeded' | 'failed',
        created_at: t.created_at,
        completed_at: t.completed_at,
    }));

    // ── Compose overview ────────────────────────────────────────────────
    const overview = {
        tryons_this_period: tryonsThis,
        tryons_last_period: tryonsLast,
        tryons_change: pctChange(tryonsThis, tryonsLast),
        conversions_this_period: convertedThis,
        conversions_last_period: convertedLast,
        conversions_change: pctChange(convertedThis, convertedLast),
        conversion_rate: convRate,
        prev_conversion_rate: prevConvRate,
        conversion_rate_change: parseFloat((convRate - prevConvRate).toFixed(1)),
        success_rate: successRate,
        prev_success_rate: prevSuccessRate,
        success_rate_change: parseFloat((successRate - prevSuccessRate).toFixed(1)),
        top_products: topProducts,
    };

    return (
        <AnalyticsDashboard
            shopId={shopId}
            initialOverview={overview}
            initialTimeseries={timeseries}
            recentTryons={recentTryons}
        />
    );
}
