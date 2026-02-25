'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';

export default function OnboardingForm({ email }: { email: string }) {
    const [shopName, setShopName] = useState('');
    const [domain, setDomain] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const res = await fetch('/api/onboarding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shopName, domain }),
        });

        if (!res.ok) {
            const data = await res.json();
            setError(data.error || 'Er ging iets mis');
            setLoading(false);
            return;
        }

        router.push('/dashboard');
        router.refresh();
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
            <div className="w-full max-w-[480px]">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Logo size="lg" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#0F172A] mb-2">
                        Welkom bij Drapit
                    </h1>
                    <p className="text-sm text-[#64748B]">
                        Stel je shop in om te beginnen met virtueel passen.
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-sm p-8">
                    {error && (
                        <div className="bg-[#FEE2E2] text-[#DC2626] text-sm px-4 py-3 rounded-xl mb-4 font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Email (read-only) */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
                                E-mailadres
                            </label>
                            <input
                                type="email"
                                value={email}
                                disabled
                                className="w-full border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-sm bg-[#F8FAFC] text-[#64748B] cursor-not-allowed"
                            />
                        </div>

                        {/* Shop name */}
                        <div className="mb-4">
                            <label htmlFor="shop-name" className="block text-sm font-medium text-[#0F172A] mb-1.5">
                                Webshop naam <span className="text-[#DC2626]">*</span>
                            </label>
                            <input
                                id="shop-name"
                                type="text"
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                                placeholder="Bijv. Mijn Modeshop"
                                required
                                className="w-full border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6FD8] focus:border-transparent placeholder:text-[#94A3B8] bg-white"
                            />
                        </div>

                        {/* Domain */}
                        <div className="mb-6">
                            <label htmlFor="shop-domain" className="block text-sm font-medium text-[#0F172A] mb-1.5">
                                Website URL <span className="text-[#94A3B8] font-normal">(optioneel)</span>
                            </label>
                            <input
                                id="shop-domain"
                                type="url"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                placeholder="https://mijnwebshop.nl"
                                className="w-full border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6FD8] focus:border-transparent placeholder:text-[#94A3B8] bg-white"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1D6FD8] hover:bg-[#1558B0] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Bezig...
                                </span>
                            ) : 'Shop aanmaken'}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-[#64748B] mt-6">
                    Je kunt je gegevens later altijd wijzigen in de instellingen.
                </p>
            </div>
        </div>
    );
}
