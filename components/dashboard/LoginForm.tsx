'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/ui/Logo';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState<'password' | 'magic'>('password');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [magicSent, setMagicSent] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/dashboard';

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function handlePasswordLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError(error.message === 'Invalid login credentials'
                ? 'Ongeldige inloggegevens. Controleer je e-mail en wachtwoord.'
                : error.message
            );
            setLoading(false);
            return;
        }

        router.push(redirect);
        router.refresh();
    }

    async function handleMagicLink(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}${redirect}`,
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        setMagicSent(true);
        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
            <div className="w-full max-w-[420px]">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Logo size="lg" />
                    </div>
                    <p className="text-sm text-[#64748B]">
                        Log in op je dashboard
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-sm p-8">
                    {/* Magic link sent confirmation */}
                    {magicSent ? (
                        <div className="text-center py-4">
                            <div className="w-14 h-14 bg-[#DCFCE7] rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold text-[#0F172A] mb-2">Check je inbox</h2>
                            <p className="text-sm text-[#64748B] mb-6">
                                We hebben een inloglink gestuurd naar <strong className="text-[#0F172A]">{email}</strong>
                            </p>
                            <button
                                onClick={() => { setMagicSent(false); setMode('password'); }}
                                className="text-sm font-medium text-[#1D6FD8] hover:underline"
                            >
                                Terug naar inloggen
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Mode toggle */}
                            <div className="flex bg-[#F1F5F9] rounded-xl p-1 mb-6">
                                <button
                                    onClick={() => setMode('password')}
                                    className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all duration-200 ${mode === 'password'
                                        ? 'bg-white text-[#0F172A] shadow-sm'
                                        : 'text-[#64748B] hover:text-[#0F172A]'
                                        }`}
                                >
                                    Wachtwoord
                                </button>
                                <button
                                    onClick={() => setMode('magic')}
                                    className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all duration-200 ${mode === 'magic'
                                        ? 'bg-white text-[#0F172A] shadow-sm'
                                        : 'text-[#64748B] hover:text-[#0F172A]'
                                        }`}
                                >
                                    Magic link
                                </button>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="bg-[#FEE2E2] text-[#DC2626] text-sm px-4 py-3 rounded-xl mb-4 font-medium">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={mode === 'password' ? handlePasswordLogin : handleMagicLink}>
                                {/* Email */}
                                <div className="mb-4">
                                    <label htmlFor="login-email" className="block text-sm font-medium text-[#0F172A] mb-1.5">
                                        E-mailadres
                                    </label>
                                    <input
                                        id="login-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="naam@bedrijf.nl"
                                        required
                                        className="w-full border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6FD8] focus:border-transparent placeholder:text-[#94A3B8] bg-white"
                                    />
                                </div>

                                {/* Password (only in password mode) */}
                                {mode === 'password' && (
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label htmlFor="login-password" className="block text-sm font-medium text-[#0F172A]">
                                                Wachtwoord
                                            </label>
                                            <button type="button" className="text-xs font-medium text-[#1D6FD8] hover:underline">
                                                Vergeten?
                                            </button>
                                        </div>
                                        <input
                                            id="login-password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            className="w-full border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6FD8] focus:border-transparent placeholder:text-[#94A3B8] bg-white"
                                        />
                                    </div>
                                )}

                                {mode === 'magic' && (
                                    <div className="mb-6" />
                                )}

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
                                    ) : mode === 'password' ? 'Inloggen' : 'Stuur magic link'}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-[#64748B] mt-6">
                    © 2026 Drapit. Alle rechten voorbehouden.
                </p>
            </div>
        </div>
    );
}
