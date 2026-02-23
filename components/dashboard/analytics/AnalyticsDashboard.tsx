'use client';

import { useState, useEffect, useCallback } from 'react';
import { colors, componentStyles, typography } from '@/lib/design-tokens';
import type { TryOnStatus } from '@/lib/supabase/types';
import StatusBadge from '@/components/dashboard/StatusBadge';
import StatCard from '@/components/dashboard/StatCard';
import AnalyticsLineChart from './AnalyticsLineChart';
import AnalyticsBarChart from './AnalyticsBarChart';
import DateRangePicker from './DateRangePicker';

// ── Types ───────────────────────────────────────────────────────────────────
interface OverviewData {
    tryons_this_period: number;
    tryons_last_period: number;
    tryons_change: number | null;
    conversions_this_period: number;
    conversions_change: number | null;
    conversion_rate: number;
    conversion_rate_change: number;
    success_rate: number;
    success_rate_change: number;
    top_products: {
        product_id: string;
        name: string;
        tryons: number;
        conversions: number;
        conversion_rate: number;
    }[];
}

interface TimeSeriesPoint {
    date: string;
    label: string;
    tryons: number;
    succeeded: number;
    failed: number;
    conversions: number;
}

interface RecentTryon {
    id: string;
    product_id: string | null;
    status: TryOnStatus;
    created_at: string;
    completed_at: string | null;
}

interface AnalyticsDashboardProps {
    shopId: string;
    initialOverview: OverviewData;
    initialTimeseries: TimeSeriesPoint[];
    recentTryons: RecentTryon[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function formatChange(val: number | null): string {
    if (val === null) return '—';
    const sign = val >= 0 ? '+' : '';
    return `${sign}${val.toFixed(1)}%`;
}

function trendDir(val: number | null): 'up' | 'down' | 'neutral' {
    if (val === null || val === 0) return 'neutral';
    return val > 0 ? 'up' : 'down';
}

function formatDuration(start: string, end: string | null): string {
    if (!end) return '—';
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const s = Math.round(ms / 1000);
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function relativeTime(iso: string): string {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return `${diff}s geleden`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min geleden`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}u geleden`;
    return `${Math.floor(diff / 86400)}d geleden`;
}

// ── Icons (inline SVGs using design tokens) ─────────────────────────────────
const TryonIcon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
            d="M3 7l7-5 7 5v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
            stroke={colors.blue}
            strokeWidth="1.5"
            strokeLinejoin="round"
            fill="none"
        />
    </svg>
);

const ConversionIcon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <polyline
            points="4,14 8,10 12,12 16,6"
            stroke={colors.green}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
    </svg>
);

const RateIcon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke={colors.amber} strokeWidth="1.5" fill="none" />
        <path d="M10 6v4l3 2" stroke={colors.amber} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const SuccessIcon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M5 10l4 4 6-6" stroke={colors.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// ── Download icon ───────────────────────────────────────────────────────────
const DownloadIcon = (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2v8m0 0l-3-3m3 3l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function AnalyticsDashboard({
    shopId,
    initialOverview,
    initialTimeseries,
    recentTryons,
}: AnalyticsDashboardProps) {
    const [days, setDays] = useState(30);
    const [overview, setOverview] = useState<OverviewData>(initialOverview);
    const [timeseries, setTimeseries] = useState<TimeSeriesPoint[]>(initialTimeseries);
    const [loading, setLoading] = useState(false);
    const [csvLoading, setCsvLoading] = useState(false);

    // ── Fetch data on range change ──────────────────────────────────────
    const fetchData = useCallback(async (d: number) => {
        setLoading(true);
        try {
            const [ovRes, tsRes] = await Promise.all([
                fetch(`/api/analytics/overview?shop_id=${shopId}&days=${d}`),
                fetch(`/api/analytics/timeseries?shop_id=${shopId}&days=${d}`),
            ]);
            if (ovRes.ok) {
                const ovData = await ovRes.json();
                setOverview(ovData);
            }
            if (tsRes.ok) {
                const tsData = await tsRes.json();
                setTimeseries(tsData.series);
            }
        } catch (err) {
            console.error('Analytics fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [shopId]);

    useEffect(() => {
        // Only re-fetch if changed from the initial 30
        if (days !== 30) {
            fetchData(days);
        }
    }, [days, fetchData]);

    function handleDaysChange(d: number) {
        setDays(d);
    }

    // ── CSV Export ───────────────────────────────────────────────────────
    async function handleExportCSV() {
        setCsvLoading(true);
        try {
            const res = await fetch(`/api/analytics/timeseries?shop_id=${shopId}&days=${days}`);
            if (!res.ok) throw new Error('Fetch failed');
            const data = await res.json();
            const series = data.series as TimeSeriesPoint[];

            const header = 'Datum,Try-ons,Geslaagd,Mislukt,Conversies\n';
            const rows = series.map(
                (d) => `${d.date},${d.tryons},${d.succeeded},${d.failed},${d.conversions}`
            ).join('\n');

            const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `drapit-analytics-${days}d-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('CSV export error:', err);
        } finally {
            setCsvLoading(false);
        }
    }

    // ── Render ───────────────────────────────────────────────────────────
    return (
        <div className="space-y-6 max-w-[1200px]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className={typography.h1} style={{ color: colors.gray900 }}>
                        Analytics
                    </h1>
                    <p className={`${typography.body} mt-1`} style={{ color: colors.gray500 }}>
                        Inzicht in de prestaties van je Drapit try-ons.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <DateRangePicker value={days} onChange={handleDaysChange} />
                    <button
                        onClick={handleExportCSV}
                        disabled={csvLoading}
                        className={`${componentStyles.buttonSecondary} flex items-center gap-2 disabled:opacity-50`}
                    >
                        {csvLoading ? (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : DownloadIcon}
                        CSV
                    </button>
                </div>
            </div>

            {/* Loading overlay */}
            {loading && (
                <div className="flex justify-center py-2">
                    <div
                        className="w-5 h-5 border-2 rounded-full animate-spin"
                        style={{
                            borderColor: colors.gray100,
                            borderTopColor: colors.blue,
                        }}
                    />
                </div>
            )}

            {/* ── Stat Cards ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Try-ons"
                    value={overview.tryons_this_period.toLocaleString('nl-NL')}
                    change={`${formatChange(overview.tryons_change)} vs vorige periode`}
                    trend={trendDir(overview.tryons_change)}
                    icon={TryonIcon}
                />
                <StatCard
                    label="Conversies"
                    value={overview.conversions_this_period.toLocaleString('nl-NL')}
                    change={`${formatChange(overview.conversions_change)} vs vorige periode`}
                    trend={trendDir(overview.conversions_change)}
                    icon={ConversionIcon}
                />
                <StatCard
                    label="Conversieratio"
                    value={`${overview.conversion_rate}%`}
                    change={`${overview.conversion_rate_change >= 0 ? '+' : ''}${overview.conversion_rate_change} pp`}
                    trend={trendDir(overview.conversion_rate_change)}
                    icon={RateIcon}
                />
                <StatCard
                    label="Succesratio"
                    value={`${overview.success_rate}%`}
                    change={`${overview.success_rate_change >= 0 ? '+' : ''}${overview.success_rate_change} pp`}
                    trend={trendDir(overview.success_rate_change)}
                    icon={SuccessIcon}
                />
            </div>

            {/* ── Line Chart ─────────────────────────────────────────────── */}
            <div className={componentStyles.dashboardCard}>
                <div className="flex items-center justify-between mb-1">
                    <div>
                        <h2 className={typography.h2} style={{ color: colors.gray900 }}>
                            Try-ons per dag
                        </h2>
                        <p className={typography.caption} style={{ color: colors.gray500 }}>
                            Laatste {days} dagen
                        </p>
                    </div>
                    {/* Legend */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: colors.blue }}
                            />
                            <span className="text-xs" style={{ color: colors.gray500 }}>
                                Try-ons
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: colors.green }}
                            />
                            <span className="text-xs" style={{ color: colors.gray500 }}>
                                Conversies
                            </span>
                        </div>
                    </div>
                </div>
                <AnalyticsLineChart data={timeseries} />
            </div>

            {/* ── Bar Chart + Recent Tryons row ──────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top 5 Products */}
                <div className={componentStyles.dashboardCard}>
                    <h2 className={`${typography.h2} mb-1`} style={{ color: colors.gray900 }}>
                        Top 5 producten
                    </h2>
                    <p className={`${typography.caption} mb-4`} style={{ color: colors.gray500 }}>
                        Op basis van aantal try-ons
                    </p>

                    {overview.top_products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                                style={{ backgroundColor: colors.blueLight }}
                            >
                                {TryonIcon}
                            </div>
                            <p className="text-sm" style={{ color: colors.gray500 }}>
                                Nog geen product-data beschikbaar.
                            </p>
                        </div>
                    ) : (
                        <AnalyticsBarChart data={overview.top_products} />
                    )}
                </div>

                {/* Recent try-ons table */}
                <div className={componentStyles.dashboardCard}>
                    <h2 className={`${typography.h2} mb-4`} style={{ color: colors.gray900 }}>
                        Recente sessies
                    </h2>

                    {recentTryons.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                                style={{ backgroundColor: colors.blueLight }}
                            >
                                {TryonIcon}
                            </div>
                            <p className="text-sm" style={{ color: colors.gray500 }}>
                                Nog geen try-on sessies.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr style={{ borderBottom: `1px solid ${colors.gray100}` }}>
                                        {['Product', 'Status', 'Duur', 'Tijd'].map((h) => (
                                            <th
                                                key={h}
                                                className="text-left text-xs font-medium uppercase tracking-wide pb-3"
                                                style={{ color: colors.gray500 }}
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentTryons.map((t) => (
                                        <tr
                                            key={t.id}
                                            style={{ borderBottom: `1px solid ${colors.gray100}` }}
                                            className="last:border-0"
                                        >
                                            <td className="py-3">
                                                <span
                                                    className="text-sm font-medium max-w-[140px] truncate block"
                                                    style={{ color: colors.gray900 }}
                                                >
                                                    {t.product_id || 'Onbekend'}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <StatusBadge status={t.status} />
                                            </td>
                                            <td
                                                className="py-3 text-sm"
                                                style={{ color: colors.gray500 }}
                                            >
                                                {formatDuration(t.created_at, t.completed_at)}
                                            </td>
                                            <td
                                                className="py-3 text-xs"
                                                style={{ color: colors.gray500 }}
                                            >
                                                {relativeTime(t.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
