'use client';

import { colors } from '@/lib/design-tokens';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
} from 'recharts';

// ── Types ───────────────────────────────────────────────────────────────────
interface ProductBarData {
    name: string;
    tryons: number;
    conversions: number;
    conversion_rate: number;
}

interface AnalyticsBarChartProps {
    data: ProductBarData[];
}

// ── Custom Tooltip ──────────────────────────────────────────────────────────
function BarTooltip({
    active,
    payload,
}: {
    active?: boolean;
    payload?: { payload: ProductBarData }[];
}) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div
            className="px-3 py-2.5 rounded-lg text-xs shadow-lg"
            style={{ backgroundColor: colors.navy, color: colors.white }}
        >
            <p className="font-semibold mb-1.5 max-w-[180px] truncate">{d.name}</p>
            <div className="space-y-0.5">
                <div className="flex justify-between gap-4">
                    <span style={{ color: colors.sidebarText }}>Try-ons</span>
                    <span className="font-bold">{d.tryons}</span>
                </div>
                <div className="flex justify-between gap-4">
                    <span style={{ color: colors.sidebarText }}>Conversies</span>
                    <span className="font-bold" style={{ color: colors.green }}>{d.conversions}</span>
                </div>
                <div className="flex justify-between gap-4">
                    <span style={{ color: colors.sidebarText }}>Ratio</span>
                    <span className="font-bold">{d.conversion_rate}%</span>
                </div>
            </div>
        </div>
    );
}

// ── Custom XAxis label ──────────────────────────────────────────────────────
function TruncatedLabel({
    x,
    y,
    payload,
}: {
    x?: number;
    y?: number;
    payload?: { value: string };
}) {
    const text = payload?.value || '';
    const truncated = text.length > 14 ? text.slice(0, 12) + '…' : text;
    return (
        <text
            x={x}
            y={(y || 0) + 12}
            textAnchor="middle"
            fill={colors.gray500}
            fontSize={11}
        >
            {truncated}
        </text>
    );
}

// ── Bar colors: staggered blue shades ───────────────────────────────────────
const barColors = [
    colors.blue,
    '#3B82F6',
    '#60A5FA',
    '#93C5FD',
    '#BFDBFE',
];

// ── Component ───────────────────────────────────────────────────────────────
export default function AnalyticsBarChart({ data }: AnalyticsBarChartProps) {
    return (
        <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 8, right: 8, left: -16, bottom: 4 }}
                    barCategoryGap="20%"
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={colors.gray100}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="name"
                        tick={<TruncatedLabel />}
                        tickLine={false}
                        axisLine={{ stroke: colors.gray100 }}
                    />
                    <YAxis
                        tick={{ fill: colors.gray500, fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip
                        content={<BarTooltip />}
                        cursor={{ fill: colors.blueLight, opacity: 0.5 }}
                    />
                    <Bar dataKey="tryons" name="Try-ons" radius={[6, 6, 0, 0]}>
                        {data.map((_, i) => (
                            <Cell
                                key={`bar-${i}`}
                                fill={barColors[i % barColors.length]}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
