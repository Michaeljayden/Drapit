'use client';

import { useState } from 'react';
import { componentStyles, typography, colors } from '@/lib/design-tokens';

const tabs = ['Account', 'API Keys', 'Abonnement'] as const;
type Tab = (typeof tabs)[number];

const mockApiKeys = [
    { id: 'key-1', prefix: 'fk_live_•••••8a2f', created: '12 feb 2026', lastUsed: '3 uur geleden', active: true },
    { id: 'key-2', prefix: 'fk_test_•••••1c9e', created: '5 jan 2026', lastUsed: '2 weken geleden', active: false },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('Account');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className={typography.h1}>Instellingen</h1>
                <p className={`${typography.body} text-[${colors.gray500}] mt-1`}>
                    Beheer je account, API keys en abonnement.
                </p>
            </div>

            {/* Tab navigation */}
            <div className="flex gap-1 border-b border-[var(--drapit-gray-100)]">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${activeTab === tab
                                ? 'text-[var(--drapit-blue)]'
                                : 'text-[var(--drapit-gray-500)] hover:text-[var(--drapit-gray-900)]'
                            }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--drapit-blue)] rounded-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === 'Account' && (
                <div className={`${componentStyles.dashboardCard} max-w-xl`}>
                    <h2 className={`${typography.h2} mb-6`}>Account gegevens</h2>
                    <div className="space-y-4">
                        <div>
                            <label className={`${typography.caption} text-[${colors.gray500}] block mb-1.5`}>
                                Webshop naam
                            </label>
                            <input
                                type="text"
                                defaultValue="Mijn Webshop"
                                className={componentStyles.input}
                            />
                        </div>
                        <div>
                            <label className={`${typography.caption} text-[${colors.gray500}] block mb-1.5`}>
                                E-mailadres
                            </label>
                            <input
                                type="email"
                                defaultValue="info@mijnwebshop.nl"
                                className={componentStyles.input}
                            />
                        </div>
                        <div>
                            <label className={`${typography.caption} text-[${colors.gray500}] block mb-1.5`}>
                                Website URL
                            </label>
                            <input
                                type="url"
                                defaultValue="https://mijnwebshop.nl"
                                className={componentStyles.input}
                            />
                        </div>
                        <div className="pt-2">
                            <button className={componentStyles.buttonPrimary}>
                                Opslaan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'API Keys' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className={`text-sm text-[${colors.gray500}]`}>
                            Gebruik API keys om de Drapit widget te authenticeren op je webshop.
                        </p>
                        <button className={componentStyles.buttonPrimary}>
                            + Nieuwe key
                        </button>
                    </div>

                    <div className={componentStyles.dashboardCard}>
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[var(--drapit-gray-100)]">
                                    {['Key', 'Aangemaakt', 'Laatst gebruikt', 'Status', ''].map((h) => (
                                        <th key={h} className="text-left text-xs font-medium text-[var(--drapit-gray-500)] uppercase tracking-wide pb-3">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {mockApiKeys.map((key) => (
                                    <tr key={key.id} className="border-b border-[var(--drapit-gray-100)] last:border-0">
                                        <td className="py-3 text-sm font-mono text-[var(--drapit-gray-900)]">
                                            {key.prefix}
                                        </td>
                                        <td className="py-3 text-sm text-[var(--drapit-gray-500)]">{key.created}</td>
                                        <td className="py-3 text-sm text-[var(--drapit-gray-500)]">{key.lastUsed}</td>
                                        <td className="py-3">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${key.active
                                                        ? 'bg-[var(--drapit-green-light)] text-[var(--drapit-green)]'
                                                        : 'bg-[var(--drapit-gray-100)] text-[var(--drapit-gray-500)]'
                                                    }`}
                                            >
                                                {key.active ? 'Actief' : 'Inactief'}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right">
                                            <button className="text-xs text-[var(--drapit-red)] hover:underline font-medium">
                                                Intrekken
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'Abonnement' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Starter */}
                    <div className={`${componentStyles.dashboardCard} border-2 border-[var(--drapit-blue)] relative`}>
                        <div className="absolute -top-3 left-4 px-2 py-0.5 bg-[var(--drapit-blue)] text-white text-xs font-bold rounded-md">
                            Huidig plan
                        </div>
                        <h3 className={`${typography.h3} mt-2`}>Starter</h3>
                        <p className="text-2xl font-bold text-[var(--drapit-gray-900)] mt-2">
                            €0 <span className="text-sm font-normal text-[var(--drapit-gray-500)]">/maand</span>
                        </p>
                        <ul className="mt-4 space-y-2">
                            {['500 try-ons / maand', '1 widget', 'Basis analytics', 'E-mail support'].map((f) => (
                                <li key={f} className="flex items-center gap-2 text-sm text-[var(--drapit-gray-500)]">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M3 7l3 3 5-5" stroke="var(--drapit-green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Growth */}
                    <div className={componentStyles.dashboardCard}>
                        <h3 className={typography.h3}>Growth</h3>
                        <p className="text-2xl font-bold text-[var(--drapit-gray-900)] mt-2">
                            €49 <span className="text-sm font-normal text-[var(--drapit-gray-500)]">/maand</span>
                        </p>
                        <ul className="mt-4 space-y-2">
                            {['5.000 try-ons / maand', 'Onbeperkte widgets', 'Geavanceerde analytics', 'Priority support', 'Custom branding'].map((f) => (
                                <li key={f} className="flex items-center gap-2 text-sm text-[var(--drapit-gray-500)]">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M3 7l3 3 5-5" stroke="var(--drapit-green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <button className={`${componentStyles.buttonPrimary} w-full mt-6`}>
                            Upgraden
                        </button>
                    </div>

                    {/* Enterprise */}
                    <div className={componentStyles.dashboardCard}>
                        <h3 className={typography.h3}>Enterprise</h3>
                        <p className="text-2xl font-bold text-[var(--drapit-gray-900)] mt-2">
                            Op maat
                        </p>
                        <ul className="mt-4 space-y-2">
                            {['Onbeperkte try-ons', 'Dedicated server', 'SLA garantie', 'Persoonlijke onboarding', 'API toegang'].map((f) => (
                                <li key={f} className="flex items-center gap-2 text-sm text-[var(--drapit-gray-500)]">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M3 7l3 3 5-5" stroke="var(--drapit-green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <button className={`${componentStyles.buttonSecondary} w-full mt-6`}>
                            Contact opnemen
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
