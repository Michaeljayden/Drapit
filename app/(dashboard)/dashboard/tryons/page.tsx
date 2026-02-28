'use client';

import { useState } from 'react';
import { componentStyles, typography, colors } from '@/lib/design-tokens';
import StatusBadge from '@/components/dashboard/StatusBadge';
import type { TryOnStatus } from '@/lib/supabase/types';

// Mock data
const mockTryOns = [
    { id: 'to-001', product: 'Slim Fit Blazer - Navy', product_id: 'P-1001', status: 'succeeded' as TryOnStatus, created_at: '2026-02-21T15:30:00', converted: true },
    { id: 'to-002', product: 'Cotton T-Shirt - White', product_id: 'P-1002', status: 'processing' as TryOnStatus, created_at: '2026-02-21T15:25:00', converted: false },
    { id: 'to-003', product: 'Denim Jacket - Blue', product_id: 'P-1003', status: 'succeeded' as TryOnStatus, created_at: '2026-02-21T15:12:00', converted: false },
    { id: 'to-004', product: 'Wool Sweater - Grey', product_id: 'P-1004', status: 'failed' as TryOnStatus, created_at: '2026-02-21T14:58:00', converted: false },
    { id: 'to-005', product: 'Linen Shirt - Beige', product_id: 'P-1005', status: 'succeeded' as TryOnStatus, created_at: '2026-02-21T14:44:00', converted: true },
    { id: 'to-006', product: 'Chinos - Khaki', product_id: 'P-1006', status: 'succeeded' as TryOnStatus, created_at: '2026-02-21T14:30:00', converted: true },
    { id: 'to-007', product: 'Polo Shirt - Green', product_id: 'P-1007', status: 'pending' as TryOnStatus, created_at: '2026-02-21T14:20:00', converted: false },
    { id: 'to-008', product: 'Leather Jacket - Black', product_id: 'P-1008', status: 'succeeded' as TryOnStatus, created_at: '2026-02-21T14:10:00', converted: false },
];

const filters: { label: string; value: TryOnStatus | 'all' }[] = [
    { label: 'Alle', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Processing', value: 'processing' },
    { label: 'Succeeded', value: 'succeeded' },
    { label: 'Failed', value: 'failed' },
];

export default function TryOnsPage() {
    const [activeFilter, setActiveFilter] = useState<TryOnStatus | 'all'>('all');

    const filtered =
        activeFilter === 'all'
            ? mockTryOns
            : mockTryOns.filter((t) => t.status === activeFilter);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h1 className={typography.h1}>Try-ons</h1>
                    <p className={`${typography.body} text-[${colors.gray500}] mt-1`}>
                        Alle virtual try-on verzoeken van je webshop.
                    </p>
                </div>
                <div className="text-right">
                    <p className={`text-sm font-medium text-[${colors.gray900}]`}>127 try-ons</p>
                    <p className={`text-xs text-[${colors.gray500}]`}>deze maand</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {filters.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setActiveFilter(f.value)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 ${activeFilter === f.value
                            ? `bg-[${colors.blue}] text-white`
                            : `bg-white text-[${colors.gray500}] border border-[${colors.gray300}] hover:bg-[${colors.gray100}]`
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className={componentStyles.dashboardCard}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--drapit-gray-100)]">
                                {['ID', 'Product', 'Product ID', 'Status', 'Conversie', 'Datum'].map((h) => (
                                    <th
                                        key={h}
                                        className={`text-left text-xs font-medium text-[var(--drapit-gray-500)] uppercase tracking-wide pb-3 ${h === 'Datum' ? 'text-right' : ''
                                            }`}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((tryon) => (
                                <tr key={tryon.id} className="border-b border-[var(--drapit-gray-100)] last:border-0 hover:bg-[var(--drapit-gray-50)] transition-colors">
                                    <td className="py-3 text-xs font-mono text-[var(--drapit-gray-500)]">
                                        {tryon.id}
                                    </td>
                                    <td className="py-3 text-sm font-medium text-[var(--drapit-gray-900)]">
                                        {tryon.product}
                                    </td>
                                    <td className="py-3 text-xs font-mono text-[var(--drapit-gray-500)]">
                                        {tryon.product_id}
                                    </td>
                                    <td className="py-3">
                                        <StatusBadge status={tryon.status} />
                                    </td>
                                    <td className="py-3">
                                        {tryon.converted ? (
                                            <span className="inline-flex items-center text-xs font-medium text-[var(--drapit-green)]">
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mr-1">
                                                    <path d="M3 7l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                Verkocht
                                            </span>
                                        ) : (
                                            <span className="text-xs text-[var(--drapit-gray-500)]">—</span>
                                        )}
                                    </td>
                                    <td className="py-3 text-right text-xs text-[var(--drapit-gray-500)]">
                                        {new Date(tryon.created_at).toLocaleString('nl-NL', {
                                            day: '2-digit',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-sm text-[var(--drapit-gray-500)]">Geen try-ons gevonden met dit filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
