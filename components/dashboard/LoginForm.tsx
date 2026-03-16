'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Logo from '@/components/ui/Logo';
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function LoginForm() {
    const t = useTranslations('login');
    const tCommon = useTranslations('buttons');
    const tFooter = useTranslations('footer');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState<'password' | 'magic'>('password');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [magicSent, setMagicSent] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/dashboard';

    // Handle initial error from URL
    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam) {
            setError(decodeURIComponent(errorParam));
        }
    }, [searchParams]);

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
                ? t('errors.invalidCredentials')
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
                emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
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

    async function handleForgotPassword() {
        if (!email.trim()) {
            setError(t('errors.emailRequired'));
            return;
        }

        setResetLoading(true);
        setError(null);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/reset-password`,
        });

        if (error) {
            setError(error.message);
            setResetLoading(false);
            return;
        }

        setResetSent(true);
        setResetLoading(false);
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
                        {t('title')}
                    </p>
                    <div className="flex justify-center mt-4">
                        <LanguageSwitcher />
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-sm p-8">
                    {/* Reset password sent confirmation */}
                    {resetSent ? (
                        <div className="text-center py-4">
                            <div className="w-14 h-14 bg-[#DCFCE7] rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold text-[#0F172A] mb-2">{t('checkInbox')}</h2>
                            <p className="text-sm text-[#64748B] mb-6">
                                {t('resetSent')} <strong className="text-[#0F172A]">{email}</strong>
                            </p>
                            <button
                                onClick={() => { setResetSent(false); }}
                                className="text-sm font-medium text-[#1D6FD8] hover:underline"
                            >
                                {t('backToLogin')}
                            </button>
                        </div>
                    ) : magicSent ? (
                        <div className="text-center py-4">
                            <div className="w-14 h-14 bg-[#DCFCE7] rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold text-[#0F172A] mb-2">{t('checkInbox')}</h2>
                            <p className="text-sm text-[#64748B] mb-6">
                                {t('magicLinkSent')} <strong className="text-[#0F172A]">{email}</strong>
                            </p>
                            <button
                                onClick={() => { setMagicSent(false); setMode('password'); }}
                                className="text-sm font-medium text-[#1D6FD8] hover:underline"
                            >
                                {t('backToLogin')}
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
                                    {t('passwordMode')}
                                </button>
                                <button
                                    onClick={() => setMode('magic')}
                                    className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all duration-200 ${mode === 'magic'
                                        ? 'bg-white text-[#0F172A] shadow-sm'
                                        : 'text-[#64748B] hover:text-[#0F172A]'
                                        }`}
                                >
                                    {t('magicLink')}
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
                                        {t('email')}
                                    </label>
                                    <input
                                        id="login-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={t('emailPlaceholder')}
                                        required
                                        className="w-full border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6FD8] focus:border-transparent placeholder:text-[#94A3B8] bg-white"
                                    />
                                </div>

                                {/* Password (only in password mode) */}
                                {mode === 'password' && (
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label htmlFor="login-password" className="block text-sm font-medium text-[#0F172A]">
                                                {t('password')}
                                            </label>
                                            <button
                                                type="button"
                                                onClick={handleForgotPassword}
                                                disabled={resetLoading}
                                                className="text-xs font-medium text-[#1D6FD8] hover:underline disabled:opacity-50"
                                            >
                                                {resetLoading ? tCommon('loading') : t('forgotPassword')}
                                            </button>
                                        </div>
                                        <input
                                            id="login-password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder={t('passwordPlaceholder')}
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
                                            {tCommon('loading')}
                                        </span>
                                    ) : mode === 'password' ? t('loginButton') : t('sendMagicLink')}
                                </button>
                            </form>

                            <div className="mt-6 pt-6 border-t border-[#F1F5F9] text-center">
                                <p className="text-sm text-[#64748B]">
                                    {t('noAccount')}{' '}
                                    <Link href="/auth/signup" className="font-medium text-[#1D6FD8] hover:underline">
                                        {t('signupLink')}
                                    </Link>
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-[#64748B] mt-6">
                    {tFooter('copyright')}
                </p>
            </div>
        </div>
    );
}
