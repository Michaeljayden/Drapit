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
            .select('id, product_id, status, created_at')
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

    const usageValue = parseFloat(usagePercent as string);

    return (
        <div className="space-y-6 max-w-[1200px]">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#0F172A]">Dashboard</h1>
                    <p className="text-sm text-[#64748B] mt-1">
                        Welkom terug — hier is een overzicht van je try-on activiteit.
                    </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-[#F1F5F9] shadow-[0_1px_2px_rgba(15,39,68,0.04)] text-xs text-[#64748B]">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Live</span>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    label="Try-ons deze maand"
                    value={tryonsUsed}
                    accentColor="blue"
                    icon={
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 2L4 8v8a1 1 0 001 1h4v-5h2v5h4a1 1 0 001-1V8l-6-6z" stroke="#1D6FD8" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                        </svg>
                    }
                />
                <StatCard
                    label="Conversieratio"
                    value={`${conversionRate}%`}
                    accentColor="green"
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
                    accentColor="amber"
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
                <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-[#0F172A]">Try-ons per dag</h2>
                        <p className="text-xs text-[#94A3B8] mt-0.5">Laatste 30 dagen</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <p className="text-2xl font-bold text-[#0F172A]">{totalCount}</p>
                        <p className="text-xs text-[#94A3B8]">totaal</p>
                    </div>
                </div>
                <TryonChart data={chartData} />
            </div>

            {/* Usage bar */}
            <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-[0_1px_2px_rgba(15,39,68,0.06)] p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-base font-bold text-[#0F172A]">Maandelijks verbruik</h3>
                        <p className="text-xs text-[#94A3B8] mt-0.5">
                            {tryonsUsed} van {tryonsLimit} try-ons gebruikt
                        </p>
                    </div>
                    <span className="text-lg font-bold text-[#1D6FD8]">{usagePercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                            width: `${Math.min(usageValue, 100)}%`,
                            background: usageValue > 90
                                ? 'linear-gradient(90deg, #EF4444, #DC2626)'
                                : usageValue > 75
                                    ? 'linear-gradient(90deg, #F59E0B, #D97706)'
                                    : 'linear-gradient(90deg, #1D6FD8, #3B9AF0)',
                        }}
                    />
                </div>
                <div className="flex justify-between text-[11px] text-[#CBD5E1] mt-1.5">
                    <span>0</span>
                    <span>{tryonsLimit}</span>
                </div>
            </div>

            {/* Recent try-ons */}
            <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-[0_1px_2px_rgba(15,39,68,0.06)] p-6">
                <h2 className="text-lg font-bold text-[#0F172A] mb-5">Recente try-ons</h2>
                {recentTryons.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-[#EBF3FF] rounded-2xl mb-3">
                            <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                                <path d="M10 2L4 8v8a1 1 0 001 1h4v-5h2v5h4a1 1 0 001-1V8l-6-6z" stroke="#1D6FD8" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                            </svg>
                        </div>
                        <p className="text-sm font-semibold text-[#0F172A]">Nog geen try-ons</p>
                        <p className="text-xs text-[#94A3B8] mt-1">Installeer de widget op je webshop om te beginnen.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#F1F5F9]">
                                    <th className="text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider pb-3">Product</th>
                                    <th className="text-left text-xs font-semibold text-[#94A3B8] uppercase tracking-wider pb-3">Status</th>
                                    <th className="text-right text-xs font-semibold text-[#94A3B8] uppercase tracking-wider pb-3">Tijd</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTryons.map((tryon: { id: string; product_id: string | null; status: string; created_at: string }) => (
                                    <tr key={tryon.id} className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#F8FAFC] transition-colors">
                                        <td className="py-3.5 text-sm font-medium text-[#0F172A]">
                                            {tryon.product_id || 'Onbekend product'}
                                        </td>
                                        <td className="py-3.5">
                                            <StatusBadge status={tryon.status as TryOnStatus} />
                                        </td>
                                        <td className="py-3.5 text-right text-xs text-[#94A3B8] font-medium">
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
