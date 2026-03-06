'use client';

import { useState } from 'react';
import { componentStyles, typography, colors } from '@/lib/design-tokens';
import ApiKeysManager from '@/components/dashboard/ApiKeysManager';
import Link from 'next/link';

interface SettingsClientProps {
    shop: any;
    initialApiKeys: any[];
}

const tabs = ['Account', 'API-sleutels', 'Abonnement'] as const;
type Tab = (typeof tabs)[number];

export default function SettingsClient({ shop, initialApiKeys }: SettingsClientProps) {
    const [activeTab, setActiveTab] = useState<Tab>('Account');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        name: shop.name || '',
        domain: shop.domain || '',
        phone: shop.phone || '',
        contact_person: shop.contact_person || '',
        company_name: shop.company_name || '',
        kvk_number: shop.kvk_number || '',
        vat_number: shop.vat_number || '',
        address: shop.address || '',
        postal_code: shop.postal_code || '',
        city: shop.city || '',
        country: shop.country || 'Nederland',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/shops/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Er ging iets mis bij het opslaan.');
            }

            setMessage({ type: 'success', text: 'Instellingen succesvol opgeslagen!' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className={typography.h1}>Instellingen</h1>
                <p className={`${typography.body} text-[#64748B] mt-1`}>
                    Beheer je account, API keys en abonnement.
                </p>
            </div>

            {/* Tab navigation */}
            <div className="flex flex-wrap gap-1 border-b border-[#F1F5F9]">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${activeTab === tab
                            ? 'text-[#1D6FD8]'
                            : 'text-[#64748B] hover:text-[#0F172A]'
                            }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1D6FD8] rounded-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === 'Account' && (
                <div className="space-y-6">
                    <form onSubmit={handleSubmit} className={componentStyles.dashboardCard}>
                        <h2 className={`${typography.h2} mb-6`}>Account gegevens</h2>

                        {message && (
                            <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">Algemeen</h3>
                                <div>
                                    <label className={`${typography.caption} text-[#64748B] block mb-1.5`}>
                                        Webshop naam
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={componentStyles.input}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={`${typography.caption} text-[#64748B] block mb-1.5`}>
                                        E-mailadres (Auth)
                                    </label>
                                    <input
                                        type="email"
                                        value={shop.email}
                                        disabled
                                        className={`${componentStyles.input} bg-gray-50 cursor-not-allowed opacity-70`}
                                    />
                                </div>
                                <div>
                                    <label className={`${typography.caption} text-[#64748B] block mb-1.5`}>
                                        Website URL
                                    </label>
                                    <input
                                        type="url"
                                        name="domain"
                                        value={formData.domain}
                                        onChange={handleChange}
                                        className={componentStyles.input}
                                        placeholder="https://jouwshop.nl"
                                    />
                                </div>
                                <div>
                                    <label className={`${typography.caption} text-[#64748B] block mb-1.5`}>
                                        Telefoonnummer
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={componentStyles.input}
                                    />
                                </div>
                                <div>
                                    <label className={`${typography.caption} text-[#64748B] block mb-1.5`}>
                                        Contactpersoon
                                    </label>
                                    <input
                                        type="text"
                                        name="contact_person"
                                        value={formData.contact_person}
                                        onChange={handleChange}
                                        className={componentStyles.input}
                                    />
                                </div>
                            </div>

                            {/* Company Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">Bedrijfsgegevens</h3>
                                <div>
                                    <label className={`${typography.caption} text-[#64748B] block mb-1.5`}>
                                        Bedrijfsnaam
                                    </label>
                                    <input
                                        type="text"
                                        name="company_name"
                                        value={formData.company_name}
                                        onChange={handleChange}
                                        className={componentStyles.input}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={`${typography.caption} text-[#64748B] block mb-1.5`}>
                                            KVK Nummer
                                        </label>
                                        <input
                                            type="text"
                                            name="kvk_number"
                                            value={formData.kvk_number}
                                            onChange={handleChange}
                                            className={componentStyles.input}
                                        />
                                    </div>
                                    <div>
                                        <label className={`${typography.caption} text-[#64748B] block mb-1.5`}>
                                            BTW Nummer
                                        </label>
                                        <input
                                            type="text"
                                            name="vat_number"
                                            value={formData.vat_number}
                                            onChange={handleChange}
                                            className={componentStyles.input}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={`${typography.caption} text-[#64748B] block mb-1.5`}>
                                        Adres
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className={componentStyles.input}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={`${typography.caption} text-[#64748B] block mb-1.5`}>
                                            Postcode
                                        </label>
                                        <input
                                            type="text"
                                            name="postal_code"
                                            value={formData.postal_code}
                                            onChange={handleChange}
                                            className={componentStyles.input}
                                        />
                                    </div>
                                    <div>
                                        <label className={`${typography.caption} text-[#64748B] block mb-1.5`}>
                                            Stad
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className={componentStyles.input}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-[#F1F5F9] mt-8 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`${componentStyles.buttonPrimary} min-w-[140px] flex items-center justify-center gap-2`}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Opslaan...
                                    </>
                                ) : (
                                    'Wijzigingen opslaan'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'API-sleutels' && (
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className={`text-sm text-[#64748B]`}>
                            Gebruik API keys om de Drapit widget te authenticeren op je webshop.
                        </p>
                    </div>
                    <ApiKeysManager initialKeys={initialApiKeys} shopId={shop.id} />
                </div>
            )}

            {activeTab === 'Abonnement' && (
                <div className={componentStyles.dashboardCard}>
                    <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
                        <div>
                            <h2 className={`${typography.h2} mb-1`}>Jouw Abonnement</h2>
                            <p className="text-sm text-[#64748B]">Bekijk en beheer je huidige plannen en verbruik.</p>
                        </div>
                        <Link
                            href="/dashboard/billing"
                            className={componentStyles.buttonSecondary}
                        >
                            Volledig overzicht & Facturatie
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* VTON Plan */}
                        <div className="p-5 rounded-2xl border border-[#F1F5F9] bg-[#F8FAFC]">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-[#EBF3FF]">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1D6FD8" strokeWidth="2">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">VTON Plan</p>
                                    <p className="text-lg font-bold text-[#0F172A] capitalize">{shop.plan || 'Starter'}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-[#64748B]">
                                    <span>Try-ons dit kwartaal/maand</span>
                                    <span className="font-bold text-[#0F172A]">{shop.tryons_this_month} / {shop.monthly_tryon_limit}</span>
                                </div>
                                <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-[#F1F5F9]">
                                    <div
                                        className="h-full bg-[#1D6FD8] rounded-full"
                                        style={{ width: `${Math.min((shop.tryons_this_month / (shop.monthly_tryon_limit || 500)) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Studio Plan */}
                        <div className="p-5 rounded-2xl border border-[#F1F5F9] bg-[#F8FAFC]">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-[#F5F3FF]">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="12" cy="13" r="4" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Studio Plan</p>
                                    <p className="text-lg font-bold text-[#0F172A] capitalize">{(shop.studio_plan || 'TRIAL').replace('studio_', '')}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-[#64748B]">
                                    <span>Credits beschikbaar</span>
                                    <span className="font-bold text-[#0F172A]">{shop.studio_credits_limit - shop.studio_credits_used + (shop.studio_extra_credits || 0)}</span>
                                </div>
                                <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-[#F1F5F9]">
                                    <div
                                        className="h-full bg-[#7C3AED] rounded-full"
                                        style={{ width: `${Math.min((shop.studio_credits_used / (shop.studio_credits_limit || 20)) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
