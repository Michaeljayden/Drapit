'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

/* ─────────────────────────────────────────────────────────────────────────────
   DRAPIT — LANDING PAGE
   Aesthetic: Dark luxury-tech. Deep space meets high-fashion editorial.
   Fonts: Plus Jakarta Sans (display + body — single family, maximum readability)
───────────────────────────────────────────────────────────────────────────── */

const PLANS = [
    {
        key: 'trial',
        name: 'Proef',
        price: 0,
        limit: '20',
        features: ['20 try-ons/maand', '1 API-sleutel', 'E-mail support'],
        popular: false,
        cta: 'Gratis starten',
    },
    {
        key: 'starter',
        name: 'Starter',
        price: 49,
        limit: '500',
        features: ['500 try-ons/maand', '1 API-sleutel', 'Widget personalisatie', 'E-mail support'],
        popular: false,
        cta: 'Begin nu',
    },
    {
        key: 'pro',
        name: 'Pro',
        price: 149,
        limit: '2.500',
        features: ['2.500 try-ons/maand', 'Onbeperkt API-sleutels', 'Analytics dashboard', 'Webhook integraties', 'Prioriteit support', 'Widget personalisatie'],
        popular: true,
        cta: 'Populairste keuze',
    },
    {
        key: 'scale',
        name: 'Scale',
        price: 249,
        limit: '5.000',
        features: ['5.000 try-ons/maand', 'Onbeperkt API-sleutels', 'Custom branding', 'Analytics dashboard', 'Webhook integraties', 'SLA garantie'],
        popular: false,
        cta: 'Schaal op',
    },
    {
        key: 'business',
        name: 'Business',
        price: 399,
        limit: '10.000',
        features: ['10.000 try-ons/maand', 'Dedicated support', 'Custom integratie hulp', 'Custom branding', 'SLA garantie', 'Onbeperkt alles'],
        popular: false,
        cta: 'Neem contact op',
    },
];

const FAQS = [
    {
        q: 'Hoe snel is de integratie klaar?',
        a: 'Minder dan 10 minuten. Kopieer één script-tag vanuit je dashboard, plak het in de <head> van je webshop — Shopify, WooCommerce of maatwerk — en de widget is live.',
    },
    {
        q: 'Wat als ik mijn maandlimiet bereik?',
        a: 'De API weigert nieuwe verzoeken tot het volgende maand. Je kunt altijd direct upgraden via je dashboard om meer try-ons te activeren.',
    },
    {
        q: 'Werkt Drapit op Shopify?',
        a: 'Ja. Drapit werkt op elk platform dat custom scripts ondersteunt: Shopify, WooCommerce, Magento, maatwerk — alles. Er is geen app-installatie nodig.',
    },
    {
        q: 'Hoe werkt de AI onder de motorkap?',
        a: 'We gebruiken IDM-VTON, een state-of-the-art diffusion model gespecialiseerd in virtual try-on. De klant uploadt een foto, wij verwerken beide afbeeldingen en leveren binnen seconden een realistisch resultaat.',
    },
    {
        q: 'Kan ik het abonnement op elk moment opzeggen?',
        a: 'Ja, je houdt toegang tot het einde van je factureringsperiode. Geen verborgen kosten, geen contracten.',
    },
];

function useInView(threshold = 0.12) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) setInView(true); },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return { ref, inView };
}

function TryOnVisual() {
    const [phase, setPhase] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setPhase(p => (p + 1) % 4), 1800);
        return () => clearInterval(t);
    }, []);

    return (
        <div style={{ position: 'relative', width: '100%', maxWidth: 480, margin: '0 auto' }}>
            {/* Outer ambient glow */}
            <div style={{
                position: 'absolute', inset: -40, borderRadius: '50%',
                background: 'radial-gradient(ellipse at center, rgba(29,111,216,0.2) 0%, transparent 70%)',
                filter: 'blur(30px)', pointerEvents: 'none',
            }} />

            {/* Main card */}
            <div style={{
                position: 'relative', borderRadius: 24,
                background: 'linear-gradient(135deg, rgba(13,24,41,0.95) 0%, rgba(6,9,15,0.98) 100%)',
                border: '1px solid rgba(29,111,216,0.25)',
                boxShadow: '0 40px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)',
                overflow: 'hidden', padding: '28px 24px 24px',
            }}>
                {/* Browser chrome */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28CA41' }} />
                    <div style={{ flex: 1, marginLeft: 8, height: 22, borderRadius: 6, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', paddingLeft: 10 }}>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>drapit.io/widget — live demo</span>
                    </div>
                </div>

                {/* Two-panel try-on */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {/* Person panel */}
                    <div style={{
                        borderRadius: 16, overflow: 'hidden', position: 'relative',
                        background: 'linear-gradient(180deg, #0D1829 0%, #1a2540 100%)',
                        border: '1px solid rgba(255,255,255,0.07)', aspectRatio: '3/4',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg width="72" height="114" viewBox="0 0 72 114" fill="none">
                            <circle cx="36" cy="16" r="13" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                            <path d="M21 40 Q36 35 51 40 L56 82 Q36 87 16 82 Z" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.13)" strokeWidth="1" />
                            <path d="M21 42 L8 70" stroke="rgba(255,255,255,0.13)" strokeWidth="6" strokeLinecap="round" />
                            <path d="M51 42 L64 70" stroke="rgba(255,255,255,0.13)" strokeWidth="6" strokeLinecap="round" />
                            <path d="M26 82 L23 112" stroke="rgba(255,255,255,0.1)" strokeWidth="6" strokeLinecap="round" />
                            <path d="M46 82 L49 112" stroke="rgba(255,255,255,0.1)" strokeWidth="6" strokeLinecap="round" />
                        </svg>
                        <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.35)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.06em' }}>KLANT FOTO</div>
                    </div>

                    {/* Result panel */}
                    <div style={{
                        borderRadius: 16, overflow: 'hidden', position: 'relative',
                        background: phase >= 2 ? 'linear-gradient(180deg, #0a1628 0%, #0d2040 100%)' : 'linear-gradient(180deg, #0D1829 0%, #1a2540 100%)',
                        border: `1px solid ${phase >= 2 ? 'rgba(29,111,216,0.45)' : 'rgba(255,255,255,0.07)'}`,
                        aspectRatio: '3/4', transition: 'border-color 0.6s ease',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        {phase < 2 ? (
                            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                                <div style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid rgba(29,111,216,0.4)', borderTopColor: '#1D6FD8', animation: 'drapit-spin 0.9s linear infinite' }} />
                                <span style={{ fontSize: 9, color: 'rgba(29,111,216,0.7)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.04em' }}>AI VERWERKT...</span>
                                <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(29,111,216,0.9), transparent)', animation: 'drapit-scan 1.6s ease-in-out infinite', boxShadow: '0 0 10px rgba(29,111,216,0.7)' }} />
                            </div>
                        ) : (
                            <>
                                <svg width="72" height="114" viewBox="0 0 72 114" fill="none">
                                    <circle cx="36" cy="16" r="13" fill="rgba(255,255,255,0.13)" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                                    <path d="M21 40 Q36 35 51 40 L56 82 Q36 87 16 82 Z" fill="rgba(29,111,216,0.55)" stroke="rgba(29,111,216,0.9)" strokeWidth="1" />
                                    <path d="M29 40 L36 48 L43 40" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" />
                                    <path d="M21 42 L8 70" stroke="rgba(29,111,216,0.65)" strokeWidth="7" strokeLinecap="round" />
                                    <path d="M51 42 L64 70" stroke="rgba(29,111,216,0.65)" strokeWidth="7" strokeLinecap="round" />
                                    <path d="M26 82 L23 112" stroke="rgba(255,255,255,0.1)" strokeWidth="6" strokeLinecap="round" />
                                    <path d="M46 82 L49 112" stroke="rgba(255,255,255,0.1)" strokeWidth="6" strokeLinecap="round" />
                                </svg>
                                {phase === 3 && (
                                    <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(22,163,74,0.9)', borderRadius: 20, padding: '3px 9px', fontSize: 9, color: 'white', fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.04em', animation: 'drapit-fadein 0.4s ease' }}>✓ KLAAR</div>
                                )}
                            </>
                        )}
                        <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', fontSize: 9, color: phase >= 2 ? 'rgba(29,111,216,0.85)' : 'rgba(255,255,255,0.35)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.06em', transition: 'color 0.4s' }}>
                            {phase >= 2 ? 'AI RESULTAAT' : 'VERWERKEN...'}
                        </div>
                    </div>
                </div>

                {/* Product swatches */}
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    {[{ color: '#1D6FD8', label: 'Blazer' }, { color: '#7C3AED', label: 'Jurk' }, { color: '#DC2626', label: 'Jas' }, { color: '#059669', label: 'Shirt' }].map((item, i) => (
                        <div key={i} style={{ flex: 1, height: 34, borderRadius: 8, background: `linear-gradient(135deg, ${item.color}33, ${item.color}66)`, border: `1px solid ${item.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.65)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{item.label}</span>
                        </div>
                    ))}
                </div>

                {/* CTA button */}
                <button style={{ marginTop: 12, width: '100%', padding: '10px 0', borderRadius: 10, background: 'linear-gradient(135deg, #1D6FD8, #2563EB)', border: 'none', color: 'white', fontSize: 12, fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.06em', cursor: 'pointer', boxShadow: '0 4px 20px rgba(29,111,216,0.45)' }}>
                    VIRTUEEL PASSEN →
                </button>
            </div>

            {/* Floating badge */}
            <div style={{ position: 'absolute', top: -16, right: -16, background: 'linear-gradient(135deg, #1D6FD8, #0EA5E9)', borderRadius: 12, padding: '8px 14px', boxShadow: '0 8px 24px rgba(29,111,216,0.55)', fontSize: 11, fontWeight: 800, color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                AI-POWERED
            </div>
        </div>
    );
}

function FAQItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
    return (
        <div onClick={onToggle} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '22px 0', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9', fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1.3 }}>{q}</span>
                <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, border: '1px solid rgba(29,111,216,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D6FD8', fontSize: 20, transition: 'transform 0.3s', transform: isOpen ? 'rotate(45deg)' : 'none', fontWeight: 300 }}>+</div>
            </div>
            <div style={{ overflow: 'hidden', maxHeight: isOpen ? 160 : 0, transition: 'max-height 0.35s ease', marginTop: isOpen ? 12 : 0 }}>
                <p style={{ fontSize: 15, color: 'rgba(241,245,249,0.55)', lineHeight: 1.7, fontFamily: 'Plus Jakarta Sans, sans-serif', margin: 0, paddingRight: 40 }}>{a}</p>
            </div>
        </div>
    );
}

function PlatformLogos() {
    const { ref, inView } = useInView(0.05);

    const logos = [
        {
            name: 'Shopify',
            src: '/images/logos/Shopify_logo_2018.svg.png',
            width: 120,
        },
        {
            name: 'WooCommerce',
            src: '/images/logos/Woocommerce.png',
            width: 140,
        },
        {
            name: 'Magento',
            src: '/images/logos/Magento.png',
            width: 110,
        },
        {
            name: 'Wix',
            src: '/images/logos/wIX.png',
            width: 70,
        }
    ];

    return (
        <div ref={ref} style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(241,245,249,0.3)', fontFamily: 'Plus Jakarta Sans, sans-serif', textTransform: 'uppercase', marginBottom: 20, display: 'block' }}>
                Werkt met elk ecommerce platform
            </span>
            <div className={`d-in d-d1 ${inView ? 'visible' : ''}`} style={{ display: 'flex', gap: '32px 52px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                {logos.map((logo) => (
                    <div key={logo.name} style={{ display: 'flex', alignItems: 'center', filter: 'grayscale(100%) brightness(1.2)', opacity: 0.4, transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                        onMouseEnter={e => {
                            e.currentTarget.style.filter = 'grayscale(0%) brightness(1)';
                            e.currentTarget.style.opacity = '1';
                            e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.filter = 'grayscale(100%) brightness(1.2)';
                            e.currentTarget.style.opacity = '0.4';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        <img
                            src={logo.src}
                            alt={logo.name}
                            style={{
                                width: logo.width,
                                height: 'auto',
                                display: 'block',
                                objectFit: 'contain'
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function LandingPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [scrolled, setScrolled] = useState(false);

    const hero = useInView(0.05);
    const stats = useInView(0.1);
    const how = useInView(0.1);
    const feats = useInView(0.1);
    const pricing = useInView(0.08);
    const faqSec = useInView(0.1);
    const ctaSec = useInView(0.1);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                html { scroll-behavior: smooth; }

                body {
                    background: #06090F;
                    color: #F1F5F9;
                    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
                    -webkit-font-smoothing: antialiased;
                    overflow-x: hidden;
                }

                /* Grain overlay */
                body::after {
                    content: '';
                    position: fixed;
                    inset: 0;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
                    opacity: 0.022;
                    pointer-events: none;
                    z-index: 9998;
                }

                .drapit-grid-bg {
                    background-image:
                        linear-gradient(rgba(29,111,216,0.055) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(29,111,216,0.055) 1px, transparent 1px);
                    background-size: 64px 64px;
                }

                @keyframes drapit-scan {
                    0%   { top: 5%; opacity: 1; }
                    100% { top: 95%; opacity: 0.2; }
                }
                @keyframes drapit-spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes drapit-fadein {
                    from { opacity: 0; transform: scale(0.75); }
                    to   { opacity: 1; transform: scale(1); }
                }
                @keyframes drapit-float {
                    0%, 100% { transform: translateY(0px); }
                    50%      { transform: translateY(-14px); }
                }
                @keyframes drapit-slideup {
                    from { opacity: 0; transform: translateY(36px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes drapit-shimmer {
                    0%   { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes drapit-pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(29,111,216,0.35); }
                    50%      { box-shadow: 0 0 0 10px rgba(29,111,216,0); }
                }
                @keyframes drapit-border {
                    0%, 100% { border-color: rgba(29,111,216,0.3); }
                    50%      { border-color: rgba(29,111,216,0.65); }
                }

                .d-in   { opacity: 0; }
                .d-in.visible { animation: drapit-slideup 0.7s ease forwards; }
                .d-d1 { animation-delay: 0.05s; }
                .d-d2 { animation-delay: 0.15s; }
                .d-d3 { animation-delay: 0.25s; }
                .d-d4 { animation-delay: 0.35s; }
                .d-d5 { animation-delay: 0.45s; }
                .d-d6 { animation-delay: 0.55s; }

                .d-float { animation: drapit-float 6s ease-in-out infinite; }

                .d-shimmer {
                    background: linear-gradient(90deg, #F1F5F9 0%, #93C5FD 25%, #60A5FA 50%, #93C5FD 75%, #F1F5F9 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: drapit-shimmer 5s linear infinite;
                }
                .d-gradient {
                    background: linear-gradient(135deg, #F1F5F9 0%, #93C5FD 55%, #3B82F6 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .d-btn-primary {
                    display: inline-block;
                    background: linear-gradient(135deg, #1D6FD8, #2563EB);
                    color: white !important;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-weight: 700;
                    letter-spacing: 0.04em;
                    border-radius: 12px;
                    border: none;
                    cursor: pointer;
                    text-decoration: none;
                    transition: transform 0.25s, box-shadow 0.25s;
                    box-shadow: 0 8px 28px rgba(29,111,216,0.45);
                }
                .d-btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 14px 40px rgba(29,111,216,0.65) !important;
                }

                .d-plan {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .d-plan:hover {
                    transform: translateY(-7px);
                    box-shadow: 0 36px 64px rgba(0,0,0,0.55), 0 0 44px rgba(29,111,216,0.14) !important;
                }
                .d-plan-pop {
                    animation: drapit-border 3s ease-in-out infinite;
                }

                .d-feat {
                    transition: transform 0.25s, background 0.25s, border-color 0.25s;
                }
                .d-feat:hover {
                    transform: translateY(-5px);
                    background: rgba(29,111,216,0.09) !important;
                    border-color: rgba(29,111,216,0.28) !important;
                }

                .d-nav-link {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-weight: 500;
                    font-size: 14px;
                    color: rgba(241,245,249,0.6);
                    text-decoration: none;
                    padding: 8px 14px;
                    border-radius: 8px;
                    transition: color 0.2s, background 0.2s;
                }
                .d-nav-link:hover { color: #F1F5F9; background: rgba(255,255,255,0.05); }

                @media (max-width: 860px) {
                    .d-hero-grid  { grid-template-columns: 1fr !important; }
                    .d-how-grid   { grid-template-columns: 1fr !important; }
                    .d-plans-grid { grid-template-columns: repeat(3, 1fr) !important; }
                    .d-feat-grid  { grid-template-columns: 1fr 1fr !important; }
                    .d-stats-grid { grid-template-columns: 1fr 1fr !important; }
                    .d-hero-title { font-size: clamp(34px, 7vw, 52px) !important; }
                    .d-hero-visual { display: none !important; }
                }
                @media (max-width: 540px) {
                    .d-plans-grid { grid-template-columns: 1fr !important; }
                    .d-feat-grid  { grid-template-columns: 1fr !important; }
                }
            `}</style>

            <div style={{ background: '#06090F', minHeight: '100vh' }}>

                {/* ─── NAV ─────────────────────────────────────────────── */}
                <nav style={{
                    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
                    background: scrolled ? 'rgba(6,9,15,0.88)' : 'transparent',
                    backdropFilter: scrolled ? 'blur(24px) saturate(1.5)' : 'none',
                    borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    transition: 'all 0.4s ease',
                }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
                            <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
                                <path d="M9.5 3.5C9.5 2.67 8.83 2 8 2S6.5 2.67 6.5 3.5" stroke="#1D6FD8" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M8 5L2.5 10.5C2.18 10.77 2 11.15 2 11.56C2 12.35 2.65 13 3.44 13H12.56C13.35 13 14 12.35 14 11.56C14 11.15 13.82 10.77 13.5 10.5L8 5Z" stroke="#1D6FD8" strokeWidth="1.5" strokeLinejoin="round" />
                            </svg>
                            <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 20, color: '#F1F5F9', letterSpacing: '-0.015em' }}>Drapit</span>
                        </a>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {[['Hoe het werkt', '#hoe-het-werkt'], ['Prijzen', '#prijzen'], ['FAQ', '#faq']].map(([label, href]) => (
                                <a key={label} href={href} className="d-nav-link">{label}</a>
                            ))}
                            <Link href="/dashboard/login" style={{ marginLeft: 8, padding: '9px 18px', fontSize: 14, fontWeight: 600, color: 'rgba(241,245,249,0.75)', fontFamily: 'Plus Jakarta Sans, sans-serif', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, textDecoration: 'none', transition: 'all 0.2s' }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = '#F1F5F9'; e.currentTarget.style.borderColor = 'rgba(29,111,216,0.4)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(241,245,249,0.75)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                            >
                                Inloggen
                            </Link>
                            <Link href="/dashboard/login" className="d-btn-primary" style={{ padding: '9px 20px', fontSize: 14, marginLeft: 4 }}>
                                Gratis starten →
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* ─── HERO ───────────────────────────────────────────── */}
                <section className="drapit-grid-bg" style={{ paddingTop: 148, paddingBottom: 128, position: 'relative', overflow: 'hidden' }}>
                    {/* Ambient orbs */}
                    <div style={{ position: 'absolute', top: '5%', left: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,111,216,0.14) 0%, transparent 68%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 65%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

                    <div ref={hero.ref} style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px' }}>
                        <div className="d-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>

                            {/* Left copy */}
                            <div>
                                {/* Eyebrow chip */}
                                <div className={`d-in d-d1 ${hero.inView ? 'visible' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(29,111,216,0.1)', border: '1px solid rgba(29,111,216,0.22)', borderRadius: 100, padding: '6px 16px', marginBottom: 30 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22D3EE', boxShadow: '0 0 8px #22D3EE', animation: 'drapit-pulse 2s ease-in-out infinite' }} />
                                    <span style={{ fontSize: 11, fontWeight: 700, color: '#93C5FD', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.1em' }}>AI VIRTUAL TRY-ON VOOR WEBSHOPS</span>
                                </div>

                                {/* Headline */}
                                <h1 className={`d-hero-title d-in d-d2 ${hero.inView ? 'visible' : ''}`} style={{ fontSize: 'clamp(40px, 4.5vw, 70px)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, lineHeight: 1.03, letterSpacing: '-0.025em', marginBottom: 26, color: '#F1F5F9' }}>
                                    Laat klanten kleding{' '}
                                    <span className="d-shimmer">virtueel passen</span>
                                    <br />in seconden.
                                </h1>

                                {/* Body */}
                                <p className={`d-in d-d3 ${hero.inView ? 'visible' : ''}`} style={{ fontSize: 18, color: 'rgba(241,245,249,0.58)', lineHeight: 1.72, marginBottom: 40, maxWidth: 460, fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 400 }}>
                                    Eén script-tag. Elke webshop. Klanten uploaden een foto en zien zichzelf in elk kledingstuk — aangedreven door state-of-the-art AI diffusion technologie.
                                </p>

                                {/* CTAs */}
                                <div className={`d-in d-d4 ${hero.inView ? 'visible' : ''}`} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                                    <Link href="/dashboard/login" className="d-btn-primary" style={{ padding: '14px 30px', fontSize: 16 }}>
                                        Begin gratis →
                                    </Link>
                                    <a href="#hoe-het-werkt" style={{ padding: '14px 28px', fontSize: 16, fontWeight: 500, color: 'rgba(241,245,249,0.72)', fontFamily: 'Plus Jakarta Sans, sans-serif', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, textDecoration: 'none', transition: 'all 0.2s' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#F1F5F9'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(241,245,249,0.72)'; }}
                                    >
                                        Bekijk hoe het werkt ↓
                                    </a>
                                </div>

                                {/* Social proof */}
                                <div className={`d-in d-d5 ${hero.inView ? 'visible' : ''}`} style={{ marginTop: 36, display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ display: 'flex' }}>
                                        {['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'].map((c, i) => (
                                            <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: '2px solid #06090F', marginLeft: i > 0 ? -9 : 0 }} />
                                        ))}
                                    </div>
                                    <span style={{ fontSize: 13, color: 'rgba(241,245,249,0.42)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                        Vertrouwd door groeiende fashion webshops
                                    </span>
                                </div>
                            </div>

                            {/* Right visual */}
                            <div className={`d-hero-visual d-float d-in d-d3 ${hero.inView ? 'visible' : ''}`}>
                                <TryOnVisual />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── PLATFORMS ─────────────────────────────────────────── */}
                <div style={{ maxWidth: 1200, margin: '-60px auto 100px', position: 'relative', zIndex: 10 }}>
                    <PlatformLogos />
                </div>

                {/* ─── STATS ─────────────────────────────────────────── */}
                <div ref={stats.ref} style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '52px 28px', background: 'rgba(13,24,41,0.45)' }}>
                    <div className="d-stats-grid" style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32 }}>
                        {[
                            { num: '< 10 min', label: 'Installatietijd', note: 'Één script-tag' },
                            { num: '+34%', label: 'Hogere conversie', note: 'Gemiddeld na launch' },
                            { num: '−28%', label: 'Minder retours', note: 'Bewezen resultaat' },
                            { num: '99.9%', label: 'Uptime SLA', note: 'Enterprise plan' },
                        ].map((s, i) => (
                            <div key={i} className={`d-in d-d${i + 1} ${stats.inView ? 'visible' : ''}`} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 30, fontWeight: 800, fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#F1F5F9', letterSpacing: '-0.028em', lineHeight: 1 }}>{s.num}</div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#93C5FD', marginTop: 6, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.label}</div>
                                <div style={{ fontSize: 11, color: 'rgba(241,245,249,0.3)', marginTop: 3, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.note}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ─── HOW IT WORKS ──────────────────────────────────── */}
                <section id="hoe-het-werkt" style={{ padding: '128px 28px', position: 'relative' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        <div ref={how.ref} style={{ textAlign: 'center', marginBottom: 72 }}>
                            <div className={`d-in d-d1 ${how.inView ? 'visible' : ''}`} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#1D6FD8', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 18, textTransform: 'uppercase' }}>
                                HOE HET WERKT
                            </div>
                            <h2 className={`d-gradient d-in d-d2 ${how.inView ? 'visible' : ''}`} style={{ fontSize: 'clamp(30px, 4vw, 52px)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.08 }}>
                                Van installatie tot live<br />in drie stappen
                            </h2>
                        </div>

                        <div className="d-how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28 }}>
                            {[
                                { num: '01', icon: '⬡', title: 'Script toevoegen', desc: 'Kopieer één regel code vanuit je Drapit dashboard en plak het in de <head> van je webshop. Geen plugin, geen developer vereist. Klaar in 5 minuten.', tag: '< 5 minuten', tagColor: '#22D3EE' },
                                { num: '02', icon: '◈', title: 'Widget verschijnt', desc: 'De "Virtueel passen" knop verschijnt automatisch bij elk product met het juiste data-attribuut. Volledig aanpasbaar qua kleur en tekst via het dashboard.', tag: 'Zero-code setup', tagColor: '#8B5CF6' },
                                { num: '03', icon: '◉', title: 'AI doet de rest', desc: 'Klant uploadt een foto. Onze AI verwerkt het kledingstuk virtueel om het lichaam. Resultaat binnen seconden, directe koopknop inbegrepen.', tag: 'State-of-art AI', tagColor: '#1D6FD8' },
                            ].map((step, i) => (
                                <div key={i} className={`d-feat d-in d-d${i + 2} ${how.inView ? 'visible' : ''}`} style={{ background: 'rgba(13,24,41,0.6)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '32px 28px', backdropFilter: 'blur(10px)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                                        <div style={{ width: 50, height: 50, borderRadius: 15, background: 'rgba(29,111,216,0.1)', border: '1px solid rgba(29,111,216,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#1D6FD8' }}>{step.icon}</div>
                                        <span style={{ fontSize: 52, fontWeight: 800, fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'rgba(29,111,216,0.1)', lineHeight: 1 }}>{step.num}</span>
                                    </div>
                                    <h3 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#F1F5F9', marginBottom: 12, letterSpacing: '-0.015em' }}>{step.title}</h3>
                                    <p style={{ fontSize: 14, color: 'rgba(241,245,249,0.52)', lineHeight: 1.68, fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 22 }}>{step.desc}</p>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${step.tagColor}14`, border: `1px solid ${step.tagColor}28`, borderRadius: 100, padding: '4px 12px' }}>
                                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: step.tagColor }} />
                                        <span style={{ fontSize: 11, fontWeight: 600, color: step.tagColor, fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.06em' }}>{step.tag}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── FEATURES ──────────────────────────────────────── */}
                <section style={{ padding: '0 28px 128px' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        <div ref={feats.ref} style={{ marginBottom: 56 }}>
                            <div className={`d-in d-d1 ${feats.inView ? 'visible' : ''}`} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#1D6FD8', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 18 }}>WAAROM DRAPIT</div>
                            <h2 className={`d-gradient d-in d-d2 ${feats.inView ? 'visible' : ''}`} style={{ fontSize: 'clamp(26px, 3.5vw, 46px)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.08, maxWidth: 520 }}>
                                Alles wat je nodig hebt,<br />niets wat je niet nodig hebt
                            </h2>
                        </div>

                        <div className="d-feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
                            {[
                                { icon: '⚡', title: 'Platform-agnostisch', desc: 'Shopify, WooCommerce, Magento of maatwerk — als het HTML accepteert, werkt Drapit direct.', accent: '#F59E0B' },
                                { icon: '🎨', title: 'Volledig aanpasbaar', desc: 'Pas kleur, tekst en stijl van de widget aan je merk aan vanuit het dashboard. Geen code.', accent: '#8B5CF6' },
                                { icon: '📊', title: 'Real-time analytics', desc: 'Hoeveel try-ons per product, conversie-impact en trends — alles in één overzichtelijk dashboard.', accent: '#22D3EE' },
                                { icon: '🔑', title: 'API-sleutels beheer', desc: 'Meerdere keys per shop, direct activeren of deactiveren, met gebruik- en datum-tracking.', accent: '#1D6FD8' },
                                { icon: '🛡️', title: 'Privacy-first', desc: "Foto's worden na AI-verwerking niet opgeslagen. GDPR-compliant by design, geen datarisico.", accent: '#10B981' },
                                { icon: '⚙️', title: 'Webhook integraties', desc: 'Koppel try-on events aan je CRM, analytics of retargeting tool via webhooks.', accent: '#EC4899' },
                            ].map((f, i) => (
                                <div key={i} className={`d-feat d-in d-d${(i % 3) + 1} ${feats.inView ? 'visible' : ''}`} style={{ background: 'rgba(13,24,41,0.5)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '26px 24px 30px' }}>
                                    <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#F1F5F9', marginBottom: 10, letterSpacing: '-0.01em' }}>{f.title}</h3>
                                    <p style={{ fontSize: 14, color: 'rgba(241,245,249,0.48)', lineHeight: 1.62, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{f.desc}</p>
                                    <div style={{ marginTop: 18, height: 2, width: 36, background: `linear-gradient(90deg, ${f.accent}, transparent)`, borderRadius: 4 }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── PRICING ───────────────────────────────────────── */}
                <section id="prijzen" style={{ padding: '128px 28px', background: 'rgba(13,24,41,0.4)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 600, background: 'radial-gradient(ellipse, rgba(29,111,216,0.065) 0%, transparent 68%)', pointerEvents: 'none' }} />
                    <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
                        <div ref={pricing.ref} style={{ textAlign: 'center', marginBottom: 64 }}>
                            <div className={`d-in d-d1 ${pricing.inView ? 'visible' : ''}`} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#1D6FD8', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 18 }}>TRANSPARANTE PRIJZEN</div>
                            <h2 className={`d-gradient d-in d-d2 ${pricing.inView ? 'visible' : ''}`} style={{ fontSize: 'clamp(30px, 4vw, 52px)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.08, marginBottom: 18 }}>
                                Schaal mee met je webshop
                            </h2>
                            <p className={`d-in d-d3 ${pricing.inView ? 'visible' : ''}`} style={{ fontSize: 17, color: 'rgba(241,245,249,0.45)', fontFamily: 'Plus Jakarta Sans, sans-serif', maxWidth: 440, margin: '0 auto' }}>
                                Geen setupkosten. Geen verborgen fees. Betaal per maand, stop wanneer je wilt.
                            </p>
                        </div>

                        <div className="d-plans-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 16, alignItems: 'start' }}>
                            {PLANS.map((plan, i) => (
                                <div key={plan.key} className={`d-plan ${plan.popular ? 'd-plan-pop' : ''} d-in d-d${i + 1} ${pricing.inView ? 'visible' : ''}`}
                                    style={{
                                        background: plan.popular ? 'linear-gradient(180deg, rgba(29,111,216,0.16) 0%, rgba(13,24,41,0.96) 100%)' : 'rgba(13,24,41,0.72)',
                                        border: plan.popular ? '1px solid rgba(29,111,216,0.5)' : '1px solid rgba(255,255,255,0.07)',
                                        borderRadius: 22, padding: plan.popular ? '36px 24px' : '28px 22px',
                                        position: 'relative', backdropFilter: 'blur(12px)',
                                        boxShadow: plan.popular ? '0 28px 56px rgba(0,0,0,0.45), 0 0 40px rgba(29,111,216,0.14)' : '0 4px 16px rgba(0,0,0,0.22)',
                                        marginTop: plan.popular ? -16 : 0,
                                    }}>
                                    {plan.popular && (
                                        <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #1D6FD8, #2563EB)', borderRadius: 100, padding: '5px 16px', fontSize: 10, fontWeight: 800, color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.1em', whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(29,111,216,0.55)' }}>
                                            MEEST GEKOZEN
                                        </div>
                                    )}
                                    <div style={{ marginBottom: 22 }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif', color: plan.popular ? '#93C5FD' : 'rgba(241,245,249,0.4)', letterSpacing: '0.08em', marginBottom: 10 }}>{plan.name.toUpperCase()}</div>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                            <span style={{ fontSize: 42, fontWeight: 800, fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#F1F5F9', letterSpacing: '-0.028em', lineHeight: 1 }}>{plan.price === 0 ? 'Gratis' : `€${plan.price}`}</span>
                                            {plan.price > 0 && <span style={{ fontSize: 13, color: 'rgba(241,245,249,0.35)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>/maand</span>}
                                        </div>
                                        <div style={{ marginTop: 8, fontSize: 13, color: 'rgba(241,245,249,0.4)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{plan.limit} try-ons/maand</div>
                                    </div>

                                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 18 }} />

                                    <ul style={{ listStyle: 'none', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 9 }}>
                                        {plan.features.map((f) => (
                                            <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, color: 'rgba(241,245,249,0.62)', fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1.4 }}>
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginTop: 1, flexShrink: 0 }}>
                                                    <circle cx="7" cy="7" r="6" fill={plan.popular ? 'rgba(29,111,216,0.18)' : 'rgba(255,255,255,0.05)'} />
                                                    <path d="M4.5 7l2 2 3-3" stroke={plan.popular ? '#60A5FA' : '#64748B'} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    <Link href="/dashboard/login"
                                        className={plan.popular ? 'd-btn-primary' : ''}
                                        style={{
                                            display: 'block', textAlign: 'center', padding: '12px 0',
                                            borderRadius: 12, fontSize: 13, fontWeight: 700,
                                            fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.04em',
                                            textDecoration: 'none',
                                            ...(plan.popular ? { boxShadow: '0 8px 28px rgba(29,111,216,0.45)' } : {
                                                background: 'rgba(255,255,255,0.05)',
                                                color: 'rgba(241,245,249,0.72)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                transition: 'all 0.2s',
                                            }),
                                        }}
                                        onMouseEnter={!plan.popular ? (e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#F1F5F9'; } : undefined}
                                        onMouseLeave={!plan.popular ? (e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(241,245,249,0.72)'; } : undefined}
                                    >
                                        {plan.popular ? plan.cta + ' →' : plan.cta}
                                    </Link>
                                </div>
                            ))}
                        </div>

                        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 13, color: 'rgba(241,245,249,0.25)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                            Alle plannen excl. BTW · Annuleer op elk moment · 14 dagen tevredenheidsgarantie
                        </p>
                    </div>
                </section>

                {/* ─── FAQ ───────────────────────────────────────────── */}
                <section id="faq" style={{ padding: '128px 28px' }}>
                    <div style={{ maxWidth: 740, margin: '0 auto' }}>
                        <div ref={faqSec.ref} style={{ textAlign: 'center', marginBottom: 60 }}>
                            <div className={`d-in d-d1 ${faqSec.inView ? 'visible' : ''}`} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#1D6FD8', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 18 }}>FAQ</div>
                            <h2 className={`d-gradient d-in d-d2 ${faqSec.inView ? 'visible' : ''}`} style={{ fontSize: 'clamp(28px, 3.5vw, 46px)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.08 }}>
                                Veelgestelde vragen
                            </h2>
                        </div>
                        <div className={`d-in d-d3 ${faqSec.inView ? 'visible' : ''}`}>
                            {FAQS.map((faq, i) => (
                                <FAQItem key={i} q={faq.q} a={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── FINAL CTA ─────────────────────────────────────── */}
                <section style={{ padding: '60px 28px 120px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(29,111,216,0.09) 0%, transparent 60%)', pointerEvents: 'none' }} />
                    <div ref={ctaSec.ref} style={{ maxWidth: 780, margin: '0 auto', position: 'relative' }}>
                        <div className={`d-in d-d1 ${ctaSec.inView ? 'visible' : ''}`} style={{ background: 'linear-gradient(135deg, rgba(13,24,41,0.92) 0%, rgba(6,9,15,0.97) 100%)', border: '1px solid rgba(29,111,216,0.18)', borderRadius: 28, padding: '68px 52px', textAlign: 'center', boxShadow: '0 40px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#22D3EE', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 22 }}>KLAAR OM TE BEGINNEN?</div>
                            <h2 className="d-gradient" style={{ fontSize: 'clamp(30px, 5vw, 52px)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, letterSpacing: '-0.028em', lineHeight: 1.05, marginBottom: 20 }}>
                                Zet virtual try-on live<br />in minder dan 10 minuten
                            </h2>
                            <p style={{ fontSize: 17, color: 'rgba(241,245,249,0.45)', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 36, maxWidth: 420, margin: '0 auto 36px' }}>
                                Geen creditcard nodig. Verbind je webshop en zie direct het verschil in conversie.
                            </p>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Link href="/dashboard/login" className="d-btn-primary" style={{ padding: '16px 38px', fontSize: 16 }}>
                                    BEGIN GRATIS →
                                </Link>
                                <a href="mailto:hello@drapit.io" style={{ padding: '16px 30px', fontSize: 16, fontWeight: 500, color: 'rgba(241,245,249,0.68)', fontFamily: 'Plus Jakarta Sans, sans-serif', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, textDecoration: 'none', transition: 'all 0.2s' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#F1F5F9'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(241,245,249,0.68)'; }}
                                >
                                    Neem contact op
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── FOOTER ────────────────────────────────────────── */}
                <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '44px 28px 40px' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32, marginBottom: 40 }}>
                            {/* Brand */}
                            <div style={{ maxWidth: 260 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
                                    <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                                        <path d="M9.5 3.5C9.5 2.67 8.83 2 8 2S6.5 2.67 6.5 3.5" stroke="#1D6FD8" strokeWidth="1.5" strokeLinecap="round" />
                                        <path d="M8 5L2.5 10.5C2.18 10.77 2 11.15 2 11.56C2 12.35 2.65 13 3.44 13H12.56C13.35 13 14 12.35 14 11.56C14 11.15 13.82 10.77 13.5 10.5L8 5Z" stroke="#1D6FD8" strokeWidth="1.5" strokeLinejoin="round" />
                                    </svg>
                                    <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 19, color: '#F1F5F9', letterSpacing: '-0.015em' }}>Drapit</span>
                                </div>
                                <p style={{ fontSize: 13, color: 'rgba(241,245,249,0.3)', fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1.6 }}>
                                    AI Virtual Try-On voor fashion webshops. Minder retours, meer conversie.
                                </p>
                            </div>

                            {/* Links */}
                            <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(241,245,249,0.35)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.1em', marginBottom: 14 }}>PRODUCT</div>
                                    {['Hoe het werkt', 'Prijzen', 'Dashboard', 'API docs'].map(link => (
                                        <div key={link} style={{ marginBottom: 10 }}>
                                            <a href="#" style={{ fontSize: 14, color: 'rgba(241,245,249,0.38)', textDecoration: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'color 0.2s' }}
                                                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(241,245,249,0.75)')}
                                                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(241,245,249,0.38)')}
                                            >{link}</a>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(241,245,249,0.35)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.1em', marginBottom: 14 }}>BEDRIJF</div>
                                    {['Over ons', 'Contact', 'Privacy', 'Voorwaarden'].map(link => (
                                        <div key={link} style={{ marginBottom: 10 }}>
                                            <a href="#" style={{ fontSize: 14, color: 'rgba(241,245,249,0.38)', textDecoration: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'color 0.2s' }}
                                                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(241,245,249,0.75)')}
                                                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(241,245,249,0.38)')}
                                            >{link}</a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                            <p style={{ fontSize: 12, color: 'rgba(241,245,249,0.2)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>© 2026 Drapit. Alle rechten voorbehouden.</p>
                            <p style={{ fontSize: 12, color: 'rgba(241,245,249,0.2)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Gebouwd met ❤️ voor fashion webshops</p>
                        </div>
                    </div>
                </footer>

            </div>
        </>
    );
}
