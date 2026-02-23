'use client';

import { colors, componentStyles, typography } from '@/lib/design-tokens';

interface StatCardProps {
    label: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon?: React.ReactNode;
}

export default function StatCard({ label, value, change, trend = 'neutral', icon }: StatCardProps) {
    const trendColor =
        trend === 'up'
            ? `text-[${colors.green}]`
            : trend === 'down'
                ? `text-[${colors.red}]`
                : `text-[${colors.gray500}]`;

    return (
        <div className={componentStyles.dashboardCard}>
            <div className="flex items-start justify-between">
                <div>
                    <p className={`${typography.caption} text-[${colors.gray500}] uppercase tracking-wide`}>
                        {label}
                    </p>
                    <p className="text-2xl font-bold text-[var(--drapit-gray-900)] mt-1">
                        {value}
                    </p>
                    {change && (
                        <p className={`text-xs font-medium mt-1 ${trendColor}`}>
                            {trend === 'up' && '↑ '}
                            {trend === 'down' && '↓ '}
                            {change}
                        </p>
                    )}
                </div>
                {icon && (
                    <div className="p-2 rounded-lg bg-[var(--drapit-blue-light)]">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}
