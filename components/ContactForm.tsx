'use client';

import { useState } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   ContactForm — Dark luxury-tech stijl passend bij de Drapit landingspagina
   Verstuurt via POST /api/contact → EmailJS → info@drapit.io
───────────────────────────────────────────────────────────────────────────── */

type Field = 'name' | 'email' | 'phone' | 'webshopName' | 'brandClothing' | 'subject' | 'message';

interface FormState {
    name: string;
    email: string;
    phone: string;
    webshopName: string;
    brandClothing: string;
    subject: string;
    message: string;
}

const SUBJECTS = [
    'Ik heb een vraag over Drapit',
    'Ik wil een demo aanvragen',
    'Technische ondersteuning',
    'Samenwerking / partnership',
    'Iets anders',
];

export default function ContactForm() {
    const [form, setForm] = useState<FormState>({
        name: '',
        email: '',
        phone: '',
        webshopName: '',
        brandClothing: '',
        subject: SUBJECTS[0],
        message: '',
    });
    const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    function update(field: Field, value: string) {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    function validate(): boolean {
        const newErrors: Partial<Record<Field, string>> = {};
        if (!form.name.trim()) newErrors.name = 'Naam is verplicht';
        if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Ongeldig e-mailadres';
        if (!form.subject) newErrors.subject = 'Kies een onderwerp';
        if (form.message.trim().length < 10) newErrors.message = 'Schrijf minimaal 10 tekens';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;

        setStatus('loading');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                setStatus('success');
                setForm({ name: '', email: '', phone: '', webshopName: '', brandClothing: '', subject: SUBJECTS[0], message: '' });
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        }
    }

    // ── Shared input style ──────────────────────────────────────────────────
    const inputStyle: React.CSSProperties = {
        width: '100%',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 12,
        padding: '13px 16px',
        fontSize: 15,
        color: '#F1F5F9',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        outline: 'none',
        transition: 'border-color 0.2s, background 0.2s',
        boxSizing: 'border-box',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: 13,
        fontWeight: 600,
        color: 'rgba(241,245,249,0.60)',
        marginBottom: 8,
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        letterSpacing: '0.02em',
    };

    const errorStyle: React.CSSProperties = {
        fontSize: 12,
        color: '#F87171',
        marginTop: 6,
        fontFamily: 'Plus Jakarta Sans, sans-serif',
    };

    // ── Success state ───────────────────────────────────────────────────────
    if (status === 'success') {
        return (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{
                    width: 64, height: 64,
                    background: 'rgba(34,197,94,0.12)',
                    border: '1px solid rgba(34,197,94,0.25)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontSize: 28,
                }}>
                    ✓
                </div>
                <h3 style={{ color: '#F1F5F9', fontSize: 22, fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif', margin: '0 0 10px' }}>
                    Bericht ontvangen!
                </h3>
                <p style={{ color: 'rgba(241,245,249,0.50)', fontSize: 15, fontFamily: 'Plus Jakarta Sans, sans-serif', margin: 0, lineHeight: 1.6 }}>
                    We nemen zo snel mogelijk contact met je op via <strong style={{ color: 'rgba(241,245,249,0.75)' }}>{form.email || 'je e-mail'}</strong>.
                    Normaal gesproken reageren we binnen één werkdag.
                </p>
            </div>
        );
    }

    // ── Form ────────────────────────────────────────────────────────────────
    return (
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Name + Email — two columns on wider screens */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                {/* Name */}
                <div>
                    <label style={labelStyle}>Naam</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={e => update('name', e.target.value)}
                        placeholder="Jan de Vries"
                        style={{ ...inputStyle, ...(errors.name ? { borderColor: '#F87171' } : {}) }}
                        onFocus={e => { e.target.style.borderColor = 'rgba(29,111,216,0.6)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                        onBlur={e => { e.target.style.borderColor = errors.name ? '#F87171' : 'rgba(255,255,255,0.10)'; e.target.style.background = 'rgba(255,255,255,0.04)'; }}
                    />
                    {errors.name && <p style={errorStyle}>{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                    <label style={labelStyle}>E-mailadres</label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={e => update('email', e.target.value)}
                        placeholder="jan@mijnshop.nl"
                        style={{ ...inputStyle, ...(errors.email ? { borderColor: '#F87171' } : {}) }}
                        onFocus={e => { e.target.style.borderColor = 'rgba(29,111,216,0.6)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                        onBlur={e => { e.target.style.borderColor = errors.email ? '#F87171' : 'rgba(255,255,255,0.10)'; e.target.style.background = 'rgba(255,255,255,0.04)'; }}
                    />
                    {errors.email && <p style={errorStyle}>{errors.email}</p>}
                </div>
            </div>

            {/* Phone + Webshop name — two columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                {/* Phone */}
                <div>
                    <label style={labelStyle}>Telefoonnummer <span style={{ color: 'rgba(241,245,249,0.25)', fontWeight: 400 }}>(optioneel)</span></label>
                    <input
                        type="tel"
                        value={form.phone}
                        onChange={e => update('phone', e.target.value)}
                        placeholder="+31 6 12345678"
                        style={inputStyle}
                        onFocus={e => { e.target.style.borderColor = 'rgba(29,111,216,0.6)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; e.target.style.background = 'rgba(255,255,255,0.04)'; }}
                    />
                </div>

                {/* Webshop name */}
                <div>
                    <label style={labelStyle}>Webshopnaam <span style={{ color: 'rgba(241,245,249,0.25)', fontWeight: 400 }}>(optioneel)</span></label>
                    <input
                        type="text"
                        value={form.webshopName}
                        onChange={e => update('webshopName', e.target.value)}
                        placeholder="Mijn Webshop"
                        style={inputStyle}
                        onFocus={e => { e.target.style.borderColor = 'rgba(29,111,216,0.6)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; e.target.style.background = 'rgba(255,255,255,0.04)'; }}
                    />
                </div>
            </div>

            {/* Brand clothing */}
            <div>
                <label style={labelStyle}>Verkoopt u merkkleding? <span style={{ color: 'rgba(241,245,249,0.25)', fontWeight: 400 }}>(optioneel)</span></label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {['Ja', 'Nee', 'Gedeeltelijk'].map(option => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => update('brandClothing', form.brandClothing === option ? '' : option)}
                            style={{
                                padding: '10px 20px',
                                fontSize: 14,
                                fontWeight: 600,
                                fontFamily: 'Plus Jakarta Sans, sans-serif',
                                color: form.brandClothing === option ? '#FFFFFF' : 'rgba(241,245,249,0.55)',
                                background: form.brandClothing === option
                                    ? 'linear-gradient(135deg, #1D6FD8, #2563EB)'
                                    : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${form.brandClothing === option ? 'rgba(29,111,216,0.6)' : 'rgba(255,255,255,0.10)'}`,
                                borderRadius: 10,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: form.brandClothing === option ? '0 4px 16px rgba(29,111,216,0.30)' : 'none',
                            }}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            {/* Subject */}
            <div>
                <label style={labelStyle}>Onderwerp</label>
                <select
                    value={form.subject}
                    onChange={e => update('subject', e.target.value)}
                    style={{
                        ...inputStyle,
                        cursor: 'pointer',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 14px center',
                        paddingRight: 40,
                    }}
                >
                    {SUBJECTS.map(s => (
                        <option key={s} value={s} style={{ background: '#0D1829', color: '#F1F5F9' }}>{s}</option>
                    ))}
                </select>
            </div>

            {/* Message */}
            <div>
                <label style={labelStyle}>Bericht</label>
                <textarea
                    value={form.message}
                    onChange={e => update('message', e.target.value)}
                    placeholder="Vertel ons waar je mee kunt helpen..."
                    rows={5}
                    style={{
                        ...inputStyle,
                        resize: 'vertical',
                        minHeight: 120,
                        ...(errors.message ? { borderColor: '#F87171' } : {}),
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(29,111,216,0.6)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                    onBlur={e => { e.target.style.borderColor = errors.message ? '#F87171' : 'rgba(255,255,255,0.10)'; e.target.style.background = 'rgba(255,255,255,0.04)'; }}
                />
                {errors.message && <p style={errorStyle}>{errors.message}</p>}
                <p style={{ fontSize: 12, color: 'rgba(241,245,249,0.25)', margin: '6px 0 0', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {form.message.length}/5000
                </p>
            </div>

            {/* Error banner */}
            {status === 'error' && (
                <div style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.20)', borderRadius: 10, color: '#FCA5A5', fontSize: 14, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Verzenden mislukt. Controleer je verbinding en probeer het opnieuw.
                </div>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={status === 'loading'}
                style={{
                    background: status === 'loading'
                        ? 'rgba(29,111,216,0.5)'
                        : 'linear-gradient(135deg, #1D6FD8, #2563EB)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 12,
                    padding: '14px 32px',
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    transition: 'opacity 0.2s, transform 0.15s',
                    boxShadow: '0 4px 20px rgba(29,111,216,0.30)',
                    alignSelf: 'flex-start',
                    minWidth: 180,
                }}
                onMouseEnter={e => { if (status !== 'loading') { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
                {status === 'loading' ? (
                    <>
                        <svg style={{ animation: 'spin 1s linear infinite' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                        Verzenden...
                    </>
                ) : (
                    <>
                        Stuur bericht →
                    </>
                )}
            </button>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>

        </form>
    );
}
