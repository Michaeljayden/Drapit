'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';

export default function SignupForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [shopName, setShopName] = useState('');
    const [domain, setDomain] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Wachtwoorden komen niet overeen.');
            return;
        }

        if (password.length < 6) {
            setError('Wachtwoord moet minimaal 6 tekens bevatten.');
            return;
        }

        setLoading(true);
        setError(null);

        // 1. Sign up the user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard/onboarding`,
                data: {
                    full_name: shopName, // Temporary storage in user metadata
                }
            },
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        if (authData.user && authData.session) {
            // User is signed in immediately (depends on Supabase settings, usually requires email confirmation)
            // But we try to create the shop via API if session exists
            try {
                const res = await fetch('/api/onboarding', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ shopName, domain, plan: 'trial' }),
                });

                if (res.ok) {
                    router.push('/dashboard/onboarding'); // Go to plan selection
                    return;
                }
            } catch (err) {
                console.error('Failed to create shop during signup:', err);
            }
        }

        // If email confirmation is required or API call failed but user created
        setIsSuccess(true);
        setLoading(false);
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
                <div className="w-full max-w-[420px] text-center">
                    <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-sm p-8">
                        <div className="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-[#0F172A] mb-3">Check je e-mail</h2>
                        <p className="text-[#64748B] mb-8">
                            We hebben een bevestigingslink gestuurd naar <strong className="text-[#0F172A]">{email}</strong>.
                            Klik op de link in de mail om je account te activeren.
                        </p>
                        <Link
                            href="/dashboard/login"
                            className="inline-block w-full bg-[#1D6FD8] hover:bg-[#1558B0] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors duration-200"
                        >
                            Naar inloggen
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 py-12">
            <div className="w-full max-w-[420px]">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Logo size="lg" />
                    </div>
                    <p className="text-sm text-[#64748B]">
                        Maak je Drapit account aan
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-sm p-8">
                    {error && (
                        <div className="bg-[#FEE2E2] text-[#DC2626] text-sm px-4 py-3 rounded-xl mb-4 font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-4">
                        {/* Shop Name */}
                        <div>
                            <label htmlFor="shop-name" className="block text-sm font-medium text-[#0F172A] mb-1.5">
                                Webshop naam
                            </label>
                            <input
                                id="shop-name"
                                type="text"
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                                placeholder="Bijv. Modern Fashion"
                                required
                                className="w-full border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6FD8] focus:border-transparent placeholder:text-[#94A3B8] bg-white"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="signup-email" className="block text-sm font-medium text-[#0F172A] mb-1.5">
                                E-mailadres
                            </label>
                            <input
                                id="signup-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="naam@bedrijf.nl"
                                required
                                className="w-full border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6FD8] focus:border-transparent placeholder:text-[#94A3B8] bg-white"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="signup-password" className="block text-sm font-medium text-[#0F172A] mb-1.5">
                                Wachtwoord
                            </label>
                            <input
                                id="signup-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6FD8] focus:border-transparent placeholder:text-[#94A3B8] bg-white"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div className="pb-2">
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-[#0F172A] mb-1.5">
                                Bevestig wachtwoord
                            </label>
                            <input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
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
                                    Account aanmaken...
                                </span>
                            ) : 'Aanmelden'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-[#F1F5F9] text-center">
                        <p className="text-sm text-[#64748B]">
                            Heb je al een account?{' '}
                            <Link href="/dashboard/login" className="font-medium text-[#1D6FD8] hover:underline">
                                Inloggen
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-[#64748B] mt-6">
                    Bij aanmelding ga je akkoord met onze{' '}
                    <button className="underline hover:text-[#0F172A]">Voorwaarden</button>
                    {' '}en{' '}
                    <button className="underline hover:text-[#0F172A]">Privacybeleid</button>.
                </p>
            </div>
        </div>
    );
}
