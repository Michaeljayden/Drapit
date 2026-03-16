'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function SignupForm() {
    const t = useTranslations('signup');
    const tCommon = useTranslations('buttons');

    // Account gegevens
    const [shopName, setShopName] = useState('');
    const [domain, setDomain] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Contactgegevens
    const [contactPerson, setContactPerson] = useState('');
    const [phone, setPhone] = useState('');

    // Bedrijfsgegevens
    const [companyName, setCompanyName] = useState('');
    const [kvkNumber, setKvkNumber] = useState('');
    const [vatNumber, setVatNumber] = useState('');

    // Adres
    const [address, setAddress] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('Nederland');

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
            setError(t('errors.passwordMismatch'));
            return;
        }

        if (password.length < 6) {
            setError(t('errors.passwordTooShort'));
            return;
        }

        if (!phone.trim()) {
            setError(t('errors.phoneRequired'));
            return;
        }

        if (!domain.trim()) {
            setError(t('errors.domainRequired'));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Registreer via server-side API (bypass Supabase SMTP)
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    shopName,
                    domain,
                    phone,
                    contactPerson,
                    companyName,
                    kvkNumber,
                    vatNumber,
                    address,
                    postalCode,
                    city,
                    country,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || t('errors.generic'));
                setLoading(false);
                return;
            }

            // 2. Log in met het nieuwe account
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                // Account is aangemaakt maar inloggen faalde — toon succes en laat user handmatig inloggen
                setIsSuccess(true);
                setLoading(false);
                return;
            }

            // 3. Redirect naar dashboard
            router.push('/dashboard');
        } catch (err) {
            console.error('Signup failed:', err);
            setError(t('errors.generic'));
            setLoading(false);
        }
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
                        <h2 className="text-2xl font-bold text-[#0F172A] mb-3">{t('successTitle')}</h2>
                        <p className="text-[#64748B] mb-8">
                            {t('successMessage')} <strong className="text-[#0F172A]">{email}</strong>.
                            {' '}{t('successInstruction')}
                        </p>
                        <Link
                            href="/dashboard/login"
                            className="inline-block w-full bg-[#1D6FD8] hover:bg-[#1558B0] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors duration-200"
                        >
                            {t('goToLogin')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const inputClass = "w-full border border-[#CBD5E1] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6FD8] focus:border-transparent placeholder:text-[#94A3B8] bg-white";
    const labelClass = "block text-sm font-medium text-[#0F172A] mb-1.5";
    const sectionTitleClass = "text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3";
    const optionalBadge = <span className="ml-1 text-xs font-normal text-[#94A3B8]">{t('optional')}</span>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 py-12">
            <div className="w-full max-w-[560px]">
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
                    {error && (
                        <div className="bg-[#FEE2E2] text-[#DC2626] text-sm px-4 py-3 rounded-xl mb-4 font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-6">
                        {/* ── Section 1: Account gegevens ── */}
                        <div>
                            <h3 className={sectionTitleClass}>{t('sectionAccount')}</h3>
                            <div className="space-y-4">
                                {/* Shop Name */}
                                <div>
                                    <label htmlFor="shop-name" className={labelClass}>
                                        {t('shopName')} <span className="text-[#DC2626]">{t('required')}</span>
                                    </label>
                                    <input
                                        id="shop-name"
                                        type="text"
                                        value={shopName}
                                        onChange={(e) => setShopName(e.target.value)}
                                        placeholder={t('shopNamePlaceholder')}
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                {/* Webshop URL */}
                                <div>
                                    <label htmlFor="domain" className={labelClass}>
                                        {t('domain')} <span className="text-[#DC2626]">{t('required')}</span>
                                    </label>
                                    <input
                                        id="domain"
                                        type="url"
                                        value={domain}
                                        onChange={(e) => setDomain(e.target.value)}
                                        placeholder={t('domainPlaceholder')}
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="signup-email" className={labelClass}>
                                        {t('email')} <span className="text-[#DC2626]">{t('required')}</span>
                                    </label>
                                    <input
                                        id="signup-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={t('emailPlaceholder')}
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                {/* Password row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="signup-password" className={labelClass}>
                                            {t('password')} <span className="text-[#DC2626]">{t('required')}</span>
                                        </label>
                                        <input
                                            id="signup-password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder={t('passwordPlaceholder')}
                                            required
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="confirm-password" className={labelClass}>
                                            {t('confirmPassword')} <span className="text-[#DC2626]">{t('required')}</span>
                                        </label>
                                        <input
                                            id="confirm-password"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder={t('passwordPlaceholder')}
                                            required
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="border-[#F1F5F9]" />

                        {/* ── Section 2: Contactgegevens ── */}
                        <div>
                            <h3 className={sectionTitleClass}>{t('sectionContact')}</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Contact Person */}
                                    <div>
                                        <label htmlFor="contact-person" className={labelClass}>
                                            {t('contactPerson')} {optionalBadge}
                                        </label>
                                        <input
                                            id="contact-person"
                                            type="text"
                                            value={contactPerson}
                                            onChange={(e) => setContactPerson(e.target.value)}
                                            placeholder={t('contactPersonPlaceholder')}
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label htmlFor="phone" className={labelClass}>
                                            {t('phone')} <span className="text-[#DC2626]">{t('required')}</span>
                                        </label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder={t('phonePlaceholder')}
                                            required
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="border-[#F1F5F9]" />

                        {/* ── Section 3: Bedrijfsgegevens (optioneel) ── */}
                        <div>
                            <h3 className={sectionTitleClass}>{t('sectionCompany')} <span className="text-[#94A3B8] font-normal normal-case tracking-normal">{t('optionalSection')}</span></h3>
                            <div className="space-y-4">
                                {/* Company Name */}
                                <div>
                                    <label htmlFor="company-name" className={labelClass}>
                                        {t('companyName')} {optionalBadge}
                                    </label>
                                    <input
                                        id="company-name"
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder={t('companyNamePlaceholder')}
                                        className={inputClass}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* KVK Number */}
                                    <div>
                                        <label htmlFor="kvk-number" className={labelClass}>
                                            {t('kvkNumber')} {optionalBadge}
                                        </label>
                                        <input
                                            id="kvk-number"
                                            type="text"
                                            value={kvkNumber}
                                            onChange={(e) => setKvkNumber(e.target.value)}
                                            placeholder={t('kvkNumberPlaceholder')}
                                            maxLength={8}
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* VAT Number */}
                                    <div>
                                        <label htmlFor="vat-number" className={labelClass}>
                                            {t('vatNumber')} {optionalBadge}
                                        </label>
                                        <input
                                            id="vat-number"
                                            type="text"
                                            value={vatNumber}
                                            onChange={(e) => setVatNumber(e.target.value)}
                                            placeholder={t('vatNumberPlaceholder')}
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="border-[#F1F5F9]" />

                        {/* ── Section 4: Adres (optioneel) ── */}
                        <div>
                            <h3 className={sectionTitleClass}>{t('sectionAddress')} <span className="text-[#94A3B8] font-normal normal-case tracking-normal">{t('optionalSection')}</span></h3>
                            <div className="space-y-4">
                                {/* Street + house number */}
                                <div>
                                    <label htmlFor="address" className={labelClass}>
                                        {t('address')} {optionalBadge}
                                    </label>
                                    <input
                                        id="address"
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder={t('addressPlaceholder')}
                                        className={inputClass}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {/* Postal Code */}
                                    <div>
                                        <label htmlFor="postal-code" className={labelClass}>
                                            {t('postalCode')} {optionalBadge}
                                        </label>
                                        <input
                                            id="postal-code"
                                            type="text"
                                            value={postalCode}
                                            onChange={(e) => setPostalCode(e.target.value)}
                                            placeholder={t('postalCodePlaceholder')}
                                            maxLength={7}
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* City */}
                                    <div>
                                        <label htmlFor="city" className={labelClass}>
                                            {t('city')} {optionalBadge}
                                        </label>
                                        <input
                                            id="city"
                                            type="text"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            placeholder={t('cityPlaceholder')}
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* Country */}
                                    <div>
                                        <label htmlFor="country" className={labelClass}>
                                            {t('country')} {optionalBadge}
                                        </label>
                                        <input
                                            id="country"
                                            type="text"
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            placeholder={t('countryPlaceholder')}
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1D6FD8] hover:bg-[#1558B0] text-white font-semibold px-5 py-3 rounded-xl text-sm transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    {t('creatingAccount')}
                                </span>
                            ) : t('createAccount')}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-[#F1F5F9] text-center">
                        <p className="text-sm text-[#64748B]">
                            {t('hasAccount')}{' '}
                            <Link href="/dashboard/login" className="font-medium text-[#1D6FD8] hover:underline">
                                {t('loginLink')}
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-[#64748B] mt-6">
                    {t('termsText')}{' '}
                    <button className="underline hover:text-[#0F172A]">{t('termsLink')}</button>
                    {' '}{t('and')}{' '}
                    <button className="underline hover:text-[#0F172A]">{t('privacyLink')}</button>.
                </p>
            </div>
        </div>
    );
}
