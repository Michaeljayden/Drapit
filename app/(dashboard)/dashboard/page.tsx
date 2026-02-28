import { createClient } from '@/lib/supabase/server';
import StatCard from '@/components/dashboard/StatCard';
import TryonChart from '@/components/dashboard/TryonChart';
import StatusBadge from '@/components/dashboard/StatusBadge';
import type { TryOnStatus } from '@/lib/supabase/types';

// Generate last-30-days chart data from tryons
function generateChartData(tryons: { created_at: string }[]) {
    const days: Record<string, number> = {};
    const now = new Date();

    // Pre-fill last 30 days with 0
    for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
        days[key] = 0;
    }

    // Count tryons per day
    for (const t of tryons) {
        const d = new Date(t.created_at);
        const key = d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
        if (key in days) {
            days[key]++;
        }
    }

    return Object.entries(days).map(([date, tryons]) => ({ date, tryons }));
}

function getRelativeTime(dateStr: string): string {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return `${diff}s geleden`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min geleden`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}u geleden`;
    return `${Math.floor(diff / 86400)}d geleden`;
}

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null; // Middleware handles redirect
    }

    // Fetch shop
    const { data: shop } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', user.id)
        .single();

    const shopId = shop?.id;
    const tryonsUsed = shop?.tryons_this_month ?? 0;
    const tryonsLimit = shop?.monthly_tryon_limit ?? 500;
    const usagePercent = tryonsLimit > 0 ? ((tryonsUsed / tryonsLimit) * 100).toFixed(1) : '0';
    const planName = shop?.plan === 'pro' ? 'Pro' : shop?.plan === 'business' ? 'Business' : 'Starter';

    // Fetch recent tryons (last 30 days for chart + recent list)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: allTryons } = shopId
        ? await supabase
            .from('tryons')
            .select('id, product_id, status, created_at, buy_url')
            .eq('shop_id', shopId)
            .gte('created_at', thirtyDaysAgo.toISOString())
            .order('created_at', { ascending: false })
        : { data: [] };

    const tryons = allTryons || [];
    const chartData = generateChartData(tryons);

    // Calc stats
    const successCount = tryons.filter((t: { status: string }) => t.status === 'succeeded').length;
    const totalCount = tryons.length;
    const conversionRate = totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : '0';

    // Recent 5 for table
    const recentTryons = tryons.slice(0, 5);

    return (
        <div className="space-y-6 max-w-[1200px]">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#0F172A]">Dashboard</h1>
                <p className="text-sm text-[#64748B] mt-1">
                    Welkom terug. Hier is een overzicht van je try-on activiteit.
                </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    label="Try-ons deze maand"
                    value={tryonsUsed}
                    icon={
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 2L4 8v8a1 1 0 001 1h4v-5h2v5h4a1 1 0 001-1V8l-6-6z" stroke="#1D6FD8" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                        </svg>
                    }
                />
                <StatCard
                    label="Conversieratio"
                    value={`${conversionRate}%`}
                    icon={
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <polyline points="4,14 8,10 12,12 16,6" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                    }
                />
                <StatCard
                    label="Abonnement"
                    value={planName}
                    change={`${tryonsUsed}/${tryonsLimit} verbruikt`}
                    trend="neutral"
                    icon={
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <rect x="2" y="4" width="16" height="12" rx="2" stroke="#D97706" strokeWidth="1.5" />
                            <line x1="2" y1="9" x2="18" y2="9" stroke="#D97706" strokeWidth="1.5" />
                        </svg>
                    }
                />
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-[0_1px_2px_rgba(15,39,68,0.06)] p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-[#0F172A]">Try-ons per dag</h2>
                        <p className="text-xs text-[#64748B] mt-0.5">Laatste 30 dagen</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-[#0F172A]">{totalCount}</p>
                        <p className="text-xs text-[#64748B]">totaal</p>
                    </div>
                </div>
                <TryonChart data={chartData} />
            </div>

            {/* Usage bar */}
            <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-[0_1px_2px_rgba(15,39,68,0.06)] p-6">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="text-base font-bold text-[#0F172A]">Maandelijks verbruik</h3>
                        <p className="text-xs text-[#64748B] mt-0.5">
                            {tryonsUsed} van {tryonsLimit} try-ons gebruikt
                        </p>
                    </div>
                    <span className="text-sm font-semibold text-[#1D6FD8]">{usagePercent}%</span>
                </div>
                <div className="w-full h-3 bg-[#EBF3FF] rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                            width: `${Math.min(parseFloat(usagePercent as string), 100)}%`,
                            backgroundColor: parseFloat(usagePercent as string) > 90 ? '#DC2626' : parseFloat(usagePercent as string) > 75 ? '#D97706' : '#1D6FD8',
                        }}
                    />
                </div>
            </div>

            {/* Recent try-ons */}
            <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-[0_1px_2px_rgba(15,39,68,0.06)] p-6">
                <h2 className="text-lg font-bold text-[#0F172A] mb-4">Recente try-ons</h2>
                {recentTryons.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 bg-[#EBF3FF] rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M10 2L4 8v8a1 1 0 001 1h4v-5h2v5h4a1 1 0 001-1V8l-6-6z" stroke="#1D6FD8" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                            </svg>
                        </div>
                        <p className="text-sm text-[#64748B]">Nog geen try-ons. Installeer de widget om te beginnen.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#F1F5F9]">
                                    <th className="text-left text-xs font-medium text-[#64748B] uppercase tracking-wide pb-3">Product</th>
                                    <th className="text-left text-xs font-medium text-[#64748B] uppercase tracking-wide pb-3">Status</th>
                                    <th className="text-right text-xs font-medium text-[#64748B] uppercase tracking-wide pb-3">Tijd</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTryons.map((tryon: { id: string; product_id: string | null; status: string; created_at: string }) => (
                                    <tr key={tryon.id} className="border-b border-[#F1F5F9] last:border-0">
                                        <td className="py-3 text-sm font-medium text-[#0F172A]">
                                            {tryon.product_id || 'Onbekend product'}
                                        </td>
                                        <td className="py-3">
                                            <StatusBadge status={tryon.status as TryOnStatus} />
                                        </td>
                                        <td className="py-3 text-right text-xs text-[#64748B]">
                                            {getRelativeTime(tryon.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
