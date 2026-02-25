'use client';

import { useState, useEffect } from 'react';
import Logo from '@/components/ui/Logo';

interface Shop {
    id: string;
    name: string;
    email: string;
    plan: string;
    created_at: string;
    monthly_tryon_limit: number;
    tryons_this_month: number;
    domain: string | null;
}

export default function AdminDashboard() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function fetchShops() {
            try {
                const res = await fetch('/api/admin/shops');
                if (!res.ok) throw new Error('Kon shops niet ophalen');
                const data = await res.json();
                setShops(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchShops();
    }, []);

    const filteredShops = shops.filter(shop =>
        shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: shops.length,
        growth: shops.filter(s => s.plan === 'growth').length,
        starter: shops.filter(s => s.plan === 'starter').length,
        scale: shops.filter(s => s.plan === 'scale').length,
        enterprise: shops.filter(s => s.plan === 'enterprise').length,
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="animate-pulse text-sm text-[#64748B]">Admin data laden...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Logo size="sm" />
                        <h1 className="text-2xl font-bold text-[#0F172A]">Admin Dashboard</h1>
                    </div>
                    <div className="text-sm font-medium px-3 py-1 bg-[#F1F5F9] rounded-full text-[#64748B]">
                        {stats.total} Actieve Shops
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-2xl border border-[#F1F5F9] shadow-sm">
                        <p className="text-sm font-medium text-[#64748B]">Totaal Shops</p>
                        <p className="text-3xl font-bold text-[#0F172A] mt-1">{stats.total}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-[#F1F5F9] shadow-sm">
                        <p className="text-sm font-medium text-[#64748B]">Pro (Growth)</p>
                        <p className="text-3xl font-bold text-[#1D6FD8] mt-1">{stats.growth}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-[#F1F5F9] shadow-sm">
                        <p className="text-sm font-medium text-[#64748B]">Starter</p>
                        <p className="text-3xl font-bold text-[#0F172A] mt-1">{stats.starter}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-[#F1F5F9] shadow-sm">
                        <p className="text-sm font-medium text-[#64748B]">Scale/Ent</p>
                        <p className="text-3xl font-bold text-[#0F172A] mt-1">{stats.scale + stats.enterprise}</p>
                    </div>
                </div>

                {/* Search & Table */}
                <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[#F1F5F9]">
                        <input
                            type="text"
                            placeholder="Zoek op shopnaam of e-mail..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full max-w-sm border border-[#CBD5E1] rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6FD8] bg-[#F8FAFC]"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                                    <th className="px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Shop & E-mail</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Plan</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Gebruik (Maand)</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Datum</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider text-right">Acties</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F1F5F9]">
                                {filteredShops.map((shop) => (
                                    <tr key={shop.id} className="hover:bg-[#F8FAFC] transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-[#0F172A]">{shop.name}</p>
                                            <p className="text-xs text-[#64748B]">{shop.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${shop.plan === 'growth' ? 'bg-[#DBEAFE] text-[#1D6FD8]' :
                                                    shop.plan === 'trial' ? 'bg-[#F1F5F9] text-[#64748B]' :
                                                        'bg-[#DCFCE7] text-[#16A34A]'
                                                }`}>
                                                {shop.plan.charAt(0).toUpperCase() + shop.plan.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-[#0F172A] font-medium">
                                                {shop.tryons_this_month} / {shop.monthly_tryon_limit}
                                            </p>
                                            <div className="mt-1 w-full max-w-[100px] h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${(shop.tryons_this_month / shop.monthly_tryon_limit) > 0.8 ? 'bg-[#EF4444]' : 'bg-[#1D6FD8]'
                                                        }`}
                                                    style={{ width: `${Math.min(100, (shop.tryons_this_month / shop.monthly_tryon_limit) * 100)}%` }}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#64748B]">
                                            {new Date(shop.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-xs font-semibold text-[#1D6FD8] hover:underline">Details</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
