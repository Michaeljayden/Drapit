'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Logo from '@/components/ui/Logo';

export default function ResetPasswordPage() {
    const t = useTranslations('resetPassword');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function handleReset(e: React.FormEvent) {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError(t('errors.mismatch'));
            return;
        }

        if (password.length < 6) {
            setError(t('errors.tooShort'));
            return;
        }

        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        setSuccess(true);
        setLoading(false);

        // Redirect naar dashboard na 2 seconden
        setTimeout(() => router.push('/dashboard'), 2000);
    }

    const inputClass = "w-full border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6FD8] focus:border-transparent placeholder:text-[#94A3B8] bg-white";

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
            <div className="w-full max-w-[420px]">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Logo size="lg" />
                    </div>
                    <p className="text-sm text-[#64748B]">{t('title')}</p>
                </div>

                <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-sm p-8">
                    {success ? (
                        <div className="text-center py-4">
                            <div className="w-14 h-14 bg-[#DCFCE7] rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 6L9 17l-5-5" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold text-[#0F172A] mb-2">{t('successTitle')}</h2>
                            <p className="text-sm text-[#64748B]">{t('successMessage')}</p>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="bg-[#FEE2E2] text-[#DC2626] text-sm px-4 py-3 rounded-xl mb-4 font-medium">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleReset} className="space-y-4">
                                <div>
                                    <label htmlFor="new-password" className="block text-sm font-medium text-[#0F172A] mb-1.5">
                                        {t('newPassword')}
                                    </label>
                                    <input
                                        id="new-password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="confirm-new-password" className="block text-sm font-medium text-[#0F172A] mb-1.5">
                                        {t('confirmPassword')}
                                    </label>
                                    <input
                                        id="confirm-new-password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#1D6FD8] hover:bg-[#1558B0] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? t('saving') : t('saveButton')}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
