'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';

type PlanKey = 'trial' | 'starter' | 'growth' | 'scale' | 'enterprise';

const ONBOARDING_PLANS: {
    key: PlanKey;
    name: string;
    price: number;
    limit: string;
    features: string[];
    popular?: boolean;
}[] = [
    {
        key: 'trial',
        name: 'Proef',
        price: 0,
        limit: '20',
        features: ['20 try-ons per maand', '1 API-sleutel', 'E-mail support'],
    },
    {
        key: 'starter',
        name: 'Starter',
        price: 49,
        limit: '500',
        features: ['500 try-ons per maand', '1 API-sleutel', 'E-mail support', 'Widget personalisatie'],
    },
    {
        key: 'growth',
        name: 'Pro',
        price: 149,
        limit: '2.500',
        popular: true,
        features: ['2.500 try-ons per maand', 'Onbeperkt API-sleutels', 'Prioriteit support', 'Analytics dashboard', 'Webhook integraties'],
    },
    {
        key: 'scale',
        name: 'Scale',
        price: 249,
        limit: '5.000',
        features: ['5.000 try-ons per maand', 'Onbeperkt API-sleutels', 'Custom branding', 'Analytics dashboard', 'SLA garantie'],
    },
    {
        key: 'enterprise',
        name: 'Business',
        price: 399,
        limit: '10.000',
        features: ['10.000 try-ons per maand', 'Onbeperkt API-sleutels', 'Dedicated support', 'Custom branding', 'Custom integratie hulp'],
    },
];

export default function OnboardingForm({ email }: { email: string }) {
    const [step, setStep] = useState<1 | 2>(1);
    const [shopName, setShopName] = useState('');
    const [domain, setDomain] = useState('');
    const [selectedPlan, setSelectedPlan] = useState<PlanKey>('trial');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    function handleNextStep(e: React.FormEvent) {
        e.preventDefault();
        setStep(2);
    }

    async function handleSubmit() {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/onboarding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shopName, domain, plan: selectedPlan }),
        });

        const data = await res.json();

        if (!res.ok) {
            setError(data.error || 'Er ging iets mis');
            setLoading(false);
            return;
        }

        // For paid plans, redirect to Stripe checkout
        if (selectedPlan !== 'trial') {
            const checkoutRes = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: selectedPlan }),
            });
            const checkoutData = await checkoutRes.json();

            if (checkoutRes.ok && checkoutData.checkout_url) {
                window.location.href = checkoutData.checkout_url;
                return;
            }
            // If checkout fails, still go to dashboard (shop is created with the plan)
        }

        router.push('/dashboard');
        router.refresh();
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 py-12">
            <div className={step === 1 ? 'w-full max-w-[480px]' : 'w-full max-w-[960px]'}>
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Logo size="lg" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#0F172A] mb-2">
                        {step === 1 ? 'Welkom bij Drapit' : 'Kies je abonnement'}
                    </h1>
                    <p className="text-sm text-[#64748B]">
                        {step === 1
                            ? 'Stel je shop in om te beginnen met virtueel passen.'
                            : 'Selecteer een abonnement dat bij je past. Je kunt later altijd upgraden.'}
                    </p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className={`h-2 w-8 rounded-full transition-colors ${step === 1 ? 'bg-[#1D6FD8]' : 'bg-[#CBD5E1]'}`} />
                    <div className={`h-2 w-8 rounded-full transition-colors ${step === 2 ? 'bg-[#1D6FD8]' : 'bg-[#CBD5E1]'}`} />
                </div>

                {error && (
                    <div className="bg-[#FEE2E2] text-[#DC2626] text-sm px-4 py-3 rounded-xl mb-4 font-medium max-w-[480px] mx-auto">
                        {error}
                    </div>
                )}

                {/* ── Step 1: Shop details ── */}
                {step === 1 && (
                    <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-sm p-8">
                        <form onSubmit={handleNextStep}>
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

                            {/* Next */}
                            <button
                                type="submit"
                                className="w-full bg-[#1D6FD8] hover:bg-[#1558B0] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors duration-200 shadow-sm"
                            >
                                Volgende
                            </button>
                        </form>
                    </div>
                )}

                {/* ── Step 2: Plan selection ── */}
                {step === 2 && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            {ONBOARDING_PLANS.map((plan) => {
                                const isSelected = selectedPlan === plan.key;
                                return (
                                    <button
                                        key={plan.key}
                                        type="button"
                                        onClick={() => setSelectedPlan(plan.key)}
                                        className="relative text-left rounded-2xl border-2 p-5 transition-all duration-200 bg-white hover:shadow-md"
                                        style={{
                                            borderColor: isSelected
                                                ? '#1D6FD8'
                                                : plan.popular
                                                    ? 'rgba(29, 111, 216, 0.2)'
                                                    : '#F1F5F9',
                                            boxShadow: isSelected
                                                ? '0 0 0 1px #1D6FD8'
                                                : undefined,
                                        }}
                                    >
                                        {/* Popular badge */}
                                        {plan.popular && (
                                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-0.5 rounded-full bg-[#1D6FD8] text-white">
                                                Populair
                                            </span>
                                        )}

                                        {/* Selected indicator */}
                                        {isSelected && (
                                            <div className="absolute top-3 right-3 w-5 h-5 bg-[#1D6FD8] rounded-full flex items-center justify-center">
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        )}

                                        {/* Plan name + price */}
                                        <div className="mb-3 pt-1">
                                            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                                                {plan.name}
                                            </p>
                                            <div className="mt-1">
                                                <span className="text-2xl font-bold text-[#0F172A]">
                                                    {plan.price === 0 ? 'Gratis' : `€${plan.price}`}
                                                </span>
                                                {plan.price > 0 && (
                                                    <span className="text-sm text-[#64748B]">/maand</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-[#64748B] mt-0.5">
                                                {plan.limit} try-ons/maand
                                            </p>
                                        </div>

                                        {/* Features */}
                                        <ul className="space-y-1.5">
                                            {plan.features.map((feature) => (
                                                <li
                                                    key={feature}
                                                    className="flex items-start gap-1.5 text-xs text-[#64748B]"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5">
                                                        <path d="M3 7l3 3 5-5" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-3 max-w-[480px] mx-auto">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 bg-white hover:bg-[#F1F5F9] text-[#0F172A] font-medium border border-[#CBD5E1] px-5 py-2.5 rounded-xl text-sm transition-colors duration-200"
                            >
                                Terug
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 bg-[#1D6FD8] hover:bg-[#1558B0] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Bezig...
                                    </span>
                                ) : selectedPlan === 'trial'
                                    ? 'Start gratis'
                                    : 'Doorgaan naar betaling'}
                            </button>
                        </div>

                        {/* Footer note */}
                        <p className="text-center text-xs text-[#64748B] mt-6">
                            {selectedPlan === 'trial'
                                ? 'Je kunt later altijd upgraden naar een betaald abonnement.'
                                : 'Je wordt doorgestuurd naar een beveiligde betaalpagina.'}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
