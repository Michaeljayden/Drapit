'use client';

import { colors } from '@/lib/design-tokens';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts';

// ── Shared Tooltip ──────────────────────────────────────────────────────────
function ChartTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: { name: string; value: number; color: string }[];
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div
            className="px-3 py-2 rounded-lg text-xs shadow-lg border"
            style={{
                backgroundColor: colors.navy,
                borderColor: 'transparent',
                color: colors.white,
            }}
        >
            <p className="font-medium mb-1">{label}</p>
            {payload.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                    <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span style={{ color: colors.sidebarText }}>{entry.name}:</span>
                    <span className="font-bold">{entry.value}</span>
                </div>
            ))}
        </div>
    );
}

// ── Types ───────────────────────────────────────────────────────────────────
interface TimeSeriesPoint {
    label: string;
    tryons: number;
    succeeded: number;
    failed: number;
    conversions: number;
}

interface AnalyticsLineChartProps {
    data: TimeSeriesPoint[];
}

// ── Component ───────────────────────────────────────────────────────────────
export default function AnalyticsLineChart({ data }: AnalyticsLineChartProps) {
    return (
        <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 8, right: 8, left: -16, bottom: 4 }}
                >
                    <defs>
                        <linearGradient id="gradientTryons" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={colors.blue} stopOpacity={0.15} />
                            <stop offset="100%" stopColor={colors.blue} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradientConversions" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={colors.green} stopOpacity={0.12} />
                            <stop offset="100%" stopColor={colors.green} stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={colors.gray100}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="label"
                        tick={{ fill: colors.gray500, fontSize: 11 }}
                        tickLine={false}
                        axisLine={{ stroke: colors.gray100 }}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        tick={{ fill: colors.gray500, fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip content={<ChartTooltip />} />

                    {/* Try-ons line */}
                    <Area
                        type="monotone"
                        dataKey="tryons"
                        name="Try-ons"
                        stroke={colors.blue}
                        strokeWidth={2.5}
                        fill="url(#gradientTryons)"
                        dot={false}
                        activeDot={{
                            r: 5,
                            fill: colors.blue,
                            stroke: colors.white,
                            strokeWidth: 2,
                        }}
                    />

                    {/* Conversions line */}
                    <Area
                        type="monotone"
                        dataKey="conversions"
                        name="Conversies"
                        stroke={colors.green}
                        strokeWidth={2}
                        fill="url(#gradientConversions)"
                        dot={false}
                        activeDot={{
                            r: 4,
                            fill: colors.green,
                            stroke: colors.white,
                            strokeWidth: 2,
                        }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
