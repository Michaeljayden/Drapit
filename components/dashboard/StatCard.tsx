'use client';

interface StatCardProps {
    label: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon?: React.ReactNode;
    accentColor?: 'blue' | 'green' | 'amber';
}

export default function StatCard({ label, value, change, trend = 'neutral', icon, accentColor = 'blue' }: StatCardProps) {
    const trendColor =
        trend === 'up'
            ? 'text-emerald-600'
            : trend === 'down'
                ? 'text-red-500'
                : 'text-[#64748B]';

    const topBorderColor =
        accentColor === 'green'
            ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
            : accentColor === 'amber'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                : 'bg-gradient-to-r from-[#1D6FD8] to-[#3B9AF0]';

    const iconBg =
        accentColor === 'green'
            ? 'bg-emerald-50'
            : accentColor === 'amber'
                ? 'bg-amber-50'
                : 'bg-[#EBF3FF]';

    return (
        <div className="relative bg-white rounded-2xl border border-[#F1F5F9] shadow-[0_1px_3px_rgba(15,39,68,0.06)] overflow-hidden group hover:shadow-[0_4px_16px_rgba(15,39,68,0.1)] transition-shadow duration-200">
            {/* Top accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-[3px] ${topBorderColor}`} />

            <div className="p-5 pt-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider truncate">
                            {label}
                        </p>
                        <p className="text-3xl font-bold text-[#0F172A] mt-2 leading-none">
                            {value}
                        </p>
                        {change && (
                            <p className={`text-xs font-medium mt-2 ${trendColor}`}>
                                {trend === 'up' && '↑ '}
                                {trend === 'down' && '↓ '}
                                {change}
                            </p>
                        )}
                    </div>
                    {icon && (
                        <div className={`p-2.5 rounded-xl ${iconBg} shrink-0 ml-3`}>
                            {icon}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
