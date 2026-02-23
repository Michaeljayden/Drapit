'use client';

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Area,
    AreaChart,
} from 'recharts';

interface TryonChartDataPoint {
    date: string;
    tryons: number;
}

interface TryonChartProps {
    data: TryonChartDataPoint[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
    if (!active || !payload?.length) return null;

    return (
        <div className="bg-[#0F2744] text-white px-3 py-2 rounded-lg text-xs shadow-lg">
            <p className="font-medium">{label}</p>
            <p className="text-[#94A3B8] mt-0.5">
                <span className="text-white font-bold">{payload[0].value}</span> try-ons
            </p>
        </div>
    );
}

export default function TryonChart({ data }: TryonChartProps) {
    return (
        <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <defs>
                        <linearGradient id="tryonGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1D6FD8" stopOpacity={0.15} />
                            <stop offset="100%" stopColor="#1D6FD8" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#F1F5F9"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="date"
                        tick={{ fill: '#64748B', fontSize: 12 }}
                        tickLine={false}
                        axisLine={{ stroke: '#F1F5F9' }}
                    />
                    <YAxis
                        tick={{ fill: '#64748B', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="tryons"
                        stroke="#1D6FD8"
                        strokeWidth={2.5}
                        fill="url(#tryonGradient)"
                        dot={false}
                        activeDot={{
                            r: 5,
                            fill: '#1D6FD8',
                            stroke: '#fff',
                            strokeWidth: 2,
                        }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
