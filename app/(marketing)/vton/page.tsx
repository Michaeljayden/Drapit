'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

/* ─────────────────────────────────────────────────────────────────────────────
   DRAPIT — VTON TECHNOLOGIE PAGINA
   Professionele uitleg over de Virtual Try-On technologie.
   Focus op snelheid, beleving en conversie.
───────────────────────────────────────────────────────────────────────────── */

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

const VTON_PROCESS = [
    {
        num: '01',
        title: 'Product Selectie',
        description: 'De klant bladert door je catalogus en selecteert een item dat ze willen passen. De VTON-widget op de productpagina nodigt hen direct uit.',
        img: '/images/Schermafbeelding 2026-03-11 130313.png',
    },
    {
        num: '02',
        title: 'Foto Uploaden',
        description: 'Met één klik kan de klant een foto van zichzelf uploaden of een live foto maken. Onze interface geeft duidelijke tips voor het beste resultaat.',
        img: '/images/Schermafbeelding 2026-03-11 130337.png',
    },
    {
        num: '03',
        title: 'AI Magie',
        description: 'Onze geavanceerde AI-modellen verwerken de afbeeldingen. In slechts 15 tot 30 seconden wordt het kledingstuk realistisch op de klant geplaatst.',
        img: '/images/Schermafbeelding 2026-03-11 130425.png',
    },
    {
        num: '04',
        title: 'Maatbevestiging',
        description: 'De klant ziet het item op hun eigen lichaam en kan direct de juiste maat selecteren, wat de onzekerheid wegneemt en de koopbereidheid verhoogt.',
        img: '/images/Schermafbeelding 2026-03-11 130442.png',
    },
    {
        num: '05',
        title: 'Direct Resultaat',
        description: 'Het eindresultaat is een fotorealistische weergave. De klant kan het resultaat opslaan, delen of direct overgaan tot aankoop.',
        img: '/images/Schermafbeelding 2026-03-11 130519.png',
    },
];

const VTON_FAQS = [
    {
        q: 'Hoe nauwkeurig is de weergave?',
        a: 'Onze AI maakt gebruik van IDM-VTON technologie, die rekening houdt met de pasvorm, textuur en drapering van de stof. Het resultaat is een zeer realistische weergave van hoe het kledingstuk er echt uit zou zien.',
    },
    {
        q: 'Is de privacy van mijn klanten gewaarborgd?',
        a: 'Absoluut. Geüploade foto\'s worden uitsluitend gebruikt voor de generatie en worden na sessie-afloop niet door Drapit opgeslagen of voor andere doeleinden gebruikt.',
    },
    {
        q: 'Hoeveel vertraging levert dit op voor mijn website?',
        a: 'Dankzij onze geoptimaliseerde infrastructuur vindt alle zware berekening plaats op onze servers. De widget zelf is lichtgewicht en heeft minimale impact op de laadsnelheid van je webshop.',
    },
    {
        q: 'Werkt het ook op mobiele apparaten?',
        a: 'Ja, de VTON-ervaring is volledig responsief en geoptimaliseerd voor elke browser op zowel smartphone als desktop.',
    },
];

function FAQItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
    return (
        <div onClick={onToggle} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '22px 0', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9', fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1.3 }}>{q}</span>
                <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, border: '1px solid rgba(29,111,216,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D6FD8', fontSize: 20, transition: 'transform 0.3s', transform: isOpen ? 'rotate(45deg)' : 'none', fontWeight: 300 }}>+</div>
            </div>
            <div style={{ overflow: 'hidden', maxHeight: isOpen ? 220 : 0, transition: 'max-height 0.35s ease', marginTop: isOpen ? 12 : 0 }}>
                <p style={{ fontSize: 15, color: 'rgba(241,245,249,0.55)', lineHeight: 1.7, fontFamily: 'Plus Jakarta Sans, sans-serif', margin: 0, paddingRight: 40 }}>{a}</p>
            </div>
        </div>
    );
}

export default function VtonPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const hero = useInView(0.05);
    const processSection = useInView(0.08);
    const faqSection = useInView(0.1);
    const ctaSection = useInView(0.1);

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

                body::after {
                    content: '';
                    position: fixed;
                    inset: 0;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
                    opacity: 0.022;
                    pointer-events: none;
                    z-index: 9998;
                }

                .vton-grid-bg {
                    background-image:
                        linear-gradient(rgba(29,111,216,0.05) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(29,111,216,0.05) 1px, transparent 1px);
                    background-size: 64px 64px;
                }

                @keyframes vton-slideup {
                    from { opacity: 0; transform: translateY(30px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                @keyframes vton-shimmer {
                    0%   { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }

                .d-in   { opacity: 0; }
                .d-in.visible { animation: vton-slideup 0.7s ease forwards; }
                .d-d1 { animation-delay: 0.05s; }
                .d-d2 { animation-delay: 0.15s; }
                .d-d3 { animation-delay: 0.25s; }

                .d-shimmer-blue {
                    background: linear-gradient(90deg, #F1F5F9 0%, #93C5FD 25%, #3B82F6 50%, #93C5FD 75%, #F1F5F9 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: vton-shimmer 5s linear infinite;
                }

                .d-btn-primary {
                    display: inline-block;
                    background: linear-gradient(135deg, #1D6FD8, #2563EB);
                    color: white !important;
                    font-weight: 700;
                    letter-spacing: 0.04em;
                    border-radius: 12px;
                    text-decoration: none;
                    transition: transform 0.25s, box-shadow 0.25s;
                    box-shadow: 0 8px 28px rgba(29,111,216,0.4);
                }
                .d-btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 14px 40px rgba(29,111,216,0.6) !important;
                }

                .d-nav-link {
                    font-size: 14px;
                    color: rgba(241,245,249,0.6);
                    text-decoration: none;
                    padding: 8px 14px;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .d-nav-link:hover { color: #F1F5F9; background: rgba(255,255,255,0.05); }
                .d-nav-link-active { color: #93C5FD !important; background: rgba(29,111,216,0.1) !important; }

                .process-card {
                    transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
                }
                .process-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 30px 60px rgba(0,0,0,0.5), 0 0 40px rgba(29,111,216,0.1);
                    border-color: rgba(29,111,216,0.3) !important;
                }

                .d-hamburger {
                    width: 40px; height: 40px;
                    display: flex; flex-direction: column;
                    align-items: center; justify-content: center; gap: 5px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 10px; cursor: pointer;
                }
                .d-hamburger span {
                    display: block; width: 18px; height: 2px;
                    background: #F1F5F9; border-radius: 2px;
                    transition: transform 0.3s ease, opacity 0.3s ease;
                }
                .d-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
                .d-hamburger.open span:nth-child(2) { opacity: 0; }
                .d-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

                @media (max-width: 960px) {
                    .d-nav-links { display: none !important; }
                    .d-nav-mobile { display: flex !important; }
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
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                            <img src="/images/2.png" alt="Drapit" style={{ height: 120, width: 'auto', filter: 'invert(1)' }} />
                        </Link>

                        <div className="d-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Link href="/" className="d-nav-link">Home</Link>
                            <Link href="/shopify" className="d-nav-link">Shopify</Link>
                            <Link href="/studio" className="d-nav-link">Studio</Link>
                            <Link href="/vton" className="d-nav-link d-nav-link-active">VTON</Link>
                            <Link href="/contact" className="d-nav-link">Contact</Link>
                            <Link href="/dashboard/login" className="d-btn-primary" style={{ padding: '9px 20px', fontSize: 14, marginLeft: 12 }}>
                                Gratis starten →
                            </Link>
                        </div>

                        <div className="d-nav-mobile" style={{ display: 'none', alignItems: 'center', gap: 8 }}>
                            <Link href="/dashboard/login" className="d-btn-primary" style={{ padding: '8px 16px', fontSize: 12 }}>
                                Start gratis
                            </Link>
                            <button className={`d-hamburger ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                                <span /><span /><span />
                            </button>
                        </div>
                    </div>
                </nav>

                <div className={`d-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`} style={{
                    position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(6,9,15,0.98)', transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)', padding: '80px 28px'
                }}>
                    <button style={{ position: 'absolute', top: 15, right: 28 }} className="d-hamburger open" onClick={() => setMobileMenuOpen(false)}><span/><span/><span/></button>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <Link href="/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 24, fontWeight: 700, color: '#F1F5F9', textDecoration: 'none' }}>Home</Link>
                        <Link href="/shopify" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 24, fontWeight: 700, color: '#F1F5F9', textDecoration: 'none' }}>Shopify</Link>
                        <Link href="/studio" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 24, fontWeight: 700, color: '#F1F5F9', textDecoration: 'none' }}>Studio</Link>
                        <Link href="/vton" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 24, fontWeight: 700, color: '#93C5FD', textDecoration: 'none' }}>VTON</Link>
                        <Link href="/contact" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: 24, fontWeight: 700, color: '#F1F5F9', textDecoration: 'none' }}>Contact</Link>
                        <Link href="/dashboard/login" onClick={() => setMobileMenuOpen(false)} className="d-btn-primary" style={{ padding: '16px', textAlign: 'center' }}>Gratis starten →</Link>
                    </nav>
                </div>

                {/* ─── HERO ───────────────────────────────────────────── */}
                <section className="vton-grid-bg" style={{ paddingTop: 160, paddingBottom: 100, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '10%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,111,216,0.12) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
                    
                    <div ref={hero.ref} style={{ maxWidth: 900, margin: '0 auto', padding: '0 28px', textAlign: 'center' }}>
                        <div className={`d-in d-d1 ${hero.inView ? 'visible' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(29,111,216,0.1)', border: '1px solid rgba(29,111,216,0.2)', borderRadius: 100, padding: '8px 20px', marginBottom: 32 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#93C5FD', letterSpacing: '0.1em' }}>DE TOEKOMST VAN E-COMMERCE</span>
                        </div>

                        <h1 className={`d-in d-d2 ${hero.inView ? 'visible' : ''}`} style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 28 }}>
                            Geef je klanten de<br />
                            <span className="d-shimmer-blue">perfecte paservaring.</span>
                        </h1>

                        <p className={`d-in d-d3 ${hero.inView ? 'visible' : ''}`} style={{ fontSize: 20, color: 'rgba(241,245,249,0.55)', lineHeight: 1.7, maxWidth: 650, margin: '0 auto 48px' }}>
                            Drapit VTON integreert naadloos in je webshop. Verhoog je conversie en verlaag je retourpercentage door klanten virtueel te laten passen op hun eigen foto.
                        </p>

                        <div className={`d-in d-d1 ${hero.inView ? 'visible' : ''}`} style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/dashboard/login" className="d-btn-primary" style={{ padding: '16px 36px', fontSize: 16 }}>
                                Nu gratis proberen →
                            </Link>
                            <a href="#proces" style={{ padding: '16px 32px', fontSize: 16, fontWeight: 600, color: '#F1F5F9', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', borderRadius: 12, textDecoration: 'none' }}>
                                Bekijk het proces
                            </a>
                        </div>
                    </div>
                </section>

                {/* ─── PROCESS ────────────────────────────────────────── */}
                <section id="proces" style={{ padding: '100px 28px' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                        <div ref={processSection.ref} style={{ textAlign: 'center', marginBottom: 80 }}>
                            <h2 className={`d-in d-d1 ${processSection.inView ? 'visible' : ''}`} style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 20 }}>
                                Sneller dan een fysieke paskamer
                            </h2>
                            <p className={`d-in d-d2 ${processSection.inView ? 'visible' : ''}`} style={{ fontSize: 18, color: 'rgba(241,245,249,0.45)', maxWidth: 600, margin: '0 auto' }}>
                                Van selectie naar resultaat in enkele eenvoudige stappen. Onze AI doet al het zware werk.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
                            {VTON_PROCESS.map((step, i) => (
                                <div key={step.num} className={`process-card d-in d-d${Math.min(i+1, 3)} ${processSection.inView ? 'visible' : ''}`} style={{
                                    background: 'rgba(13,24,41,0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 28, overflow: 'hidden', display: 'flex', flexDirection: 'column'
                                }}>
                                    <div style={{ padding: '32px 32px 0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                            <span style={{ fontSize: 12, fontWeight: 800, color: '#1D6FD8', background: 'rgba(29,111,216,0.1)', padding: '4px 10px', borderRadius: 6 }}>STAP {step.num}</span>
                                            <h3 style={{ fontSize: 20, fontWeight: 700 }}>{step.title}</h3>
                                        </div>
                                        <p style={{ fontSize: 15, color: 'rgba(241,245,249,0.5)', lineHeight: 1.6, marginBottom: 28 }}>{step.description}</p>
                                    </div>
                                    <div style={{ flex: 1, padding: '0 24px 24px', display: 'flex', alignItems: 'flex-start' }}>
                                        <div style={{ position: 'relative', width: '100%', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            <img src={step.img} alt={step.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── SOCIAL SHARING & BRAND IMPACT ──────────────────── */}
                <section style={{ padding: '100px 28px', background: 'rgba(29,111,216,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 60, alignItems: 'center' }}>
                            
                            <div className={`d-in d-d1 ${processSection.inView ? 'visible' : ''}`}>
                                <div style={{ position: 'relative', borderRadius: 40, padding: '2px', background: 'linear-gradient(135deg, rgba(29,111,216,0.5), transparent)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}>
                                    <div style={{ background: '#0D1421', borderRadius: 38, overflow: 'hidden' }}>
                                        <img 
                                            src="/images/Schermafbeelding 2026-03-11 130519.png" 
                                            alt="VTON Sharing Features" 
                                            style={{ width: '100%', height: 'auto', display: 'block' }} 
                                        />
                                    </div>
                                    
                                    {/* Floating Badge */}
                                    <div style={{ position: 'absolute', bottom: -20, right: -20, background: '#1D6FD8', color: 'white', padding: '16px 24px', borderRadius: 20, fontWeight: 700, boxShadow: '0 20px 40px rgba(29,111,216,0.4)', fontSize: 14 }}>
                                        100% Organische Reclame
                                    </div>
                                </div>
                            </div>

                            <div className={`d-in d-d2 ${processSection.inView ? 'visible' : ''}`}>
                                <div style={{ background: 'rgba(29,111,216,0.1)', border: '1px solid rgba(29,111,216,0.2)', display: 'inline-block', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#93C5FD', marginBottom: 24, letterSpacing: '0.05em' }}>
                                    MAXIMALE EXPOSURE
                                </div>
                                <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 28 }}>
                                    Van passen naar<br />
                                    <span style={{ color: '#1D6FD8' }}>wereldwijde exposure.</span>
                                </h2>
                                <p style={{ fontSize: 18, color: 'rgba(241,245,249,0.55)', lineHeight: 1.7, marginBottom: 32 }}>
                                    Drapit VTON is niet alleen een tool voor conversie, het is een krachtige marketingmachine. Gebruikers kunnen hun virtuele pasfoto direct downloaden, afdrukken of met één tik delen op Instagram, TikTok en WhatsApp. 
                                </p>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 40 }}>
                                    <div style={{ display: 'flex', gap: 16 }}>
                                        <div style={{ width: 44, height: 44, background: 'rgba(29,111,216,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1D6FD8" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Direct Delen & Downloaden</h4>
                                            <p style={{ fontSize: 14, color: 'rgba(241,245,249,0.45)' }}>Maak het je klanten gemakkelijk om hun nieuwe look aan vrienden te laten zien.</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 16 }}>
                                        <div style={{ width: 44, height: 44, background: 'rgba(29,111,216,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1D6FD8" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Viraliteit door User Generated Content</h4>
                                            <p style={{ fontSize: 14, color: 'rgba(241,245,249,0.45)' }}>Je merk verspreidt zich organisch als gratis reclame via de feed van je klanten.</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 16 }}>
                                        <div style={{ width: 44, height: 44, background: 'rgba(29,111,216,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1D6FD8" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Directe "Buy Now" Conversie</h4>
                                            <p style={{ fontSize: 14, color: 'rgba(241,245,249,0.45)' }}>De drempel is weg. Met de geïntegreerde bestelknop gaat de klant van passessie direct naar check-out.</p>
                                        </div>
                                    </div>
                                </div>

                                <Link href="/dashboard/login" className="d-btn-primary" style={{ padding: '18px 40px', fontSize: 16, width: '100%', textAlign: 'center' }}>
                                    Zet VTON in voor jouw merk →
                                </Link>
                            </div>

                        </div>
                    </div>
                </section>

                {/* ─── FAQ ─────────────────────────────────────────────── */}
                <section style={{ padding: '100px 28px' }}>
                    <div style={{ maxWidth: 740, margin: '0 auto' }}>
                        <div ref={faqSection.ref} style={{ textAlign: 'center', marginBottom: 60 }}>
                            <h2 className={`d-in d-d1 ${faqSection.inView ? 'visible' : ''}`} style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
                                Veelgestelde vragen
                            </h2>
                        </div>
                        <div className={`d-in d-d2 ${faqSection.inView ? 'visible' : ''}`}>
                            {VTON_FAQS.map((faq, i) => (
                                <FAQItem key={i} q={faq.q} a={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── FINAL CTA ─────────────────────────────────────── */}
                <section style={{ padding: '100px 28px' }}>
                    <div ref={ctaSection.ref} style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
                        <div className={`d-in d-d1 ${ctaSection.inView ? 'visible' : ''}`} style={{
                            background: 'linear-gradient(135deg, #0d1e3d 0%, #06090f 100%)', border: '1px solid rgba(29,111,216,0.25)', borderRadius: 32, padding: '60px 40px', boxShadow: '0 40px 100px rgba(0,0,0,0.4)'
                        }}>
                            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, marginBottom: 20 }}>Klaar om je webshop te<br/>transformeren?</h2>
                            <p style={{ fontSize: 18, color: 'rgba(241,245,249,0.5)', marginBottom: 40, maxWidth: 480, margin: '0 auto 40px' }}>
                                Sluit je aan bij de kledingmerken die Drapit al gebruiken om hun online ervaring naar een hoger niveau te tillen.
                            </p>
                            <Link href="/dashboard/login" className="d-btn-primary" style={{ padding: '18px 48px', fontSize: 18 }}>
                                GRATIS STARTEN
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer simple space */}
                <div style={{ height: 100 }} />

            </div>
        </>
    );
}
