'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

/* ─────────────────────────────────────────────────────────────────────────────
   DRAPIT — STUDIO PAGINA
   Professionele uitleg over wat Studio is en hoe je het gebruikt.
   Geen emoji's — schoon, zakelijk, duidelijk.
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

const STUDIO_FEATURES = [
    {
        title: 'Modelgeneratie',
        description:
            'Genereer professionele productfoto\'s op realistische AI-modellen zonder fotoshoot te plannen. Kies uit verschillende lichaamstypes, huidstinten en poses om je doelgroep optimaal aan te spreken.',
    },
    {
        title: 'Achtergrondvervanging',
        description:
            'Vervang saai witte studiofoto\'s automatisch door contextrijke omgevingen — een minimalistisch interieur, een stadse straat of een neutraal gradient — zonder Photoshop of externe editor.',
    },
    {
        title: 'Batch-verwerking',
        description:
            'Upload meerdere kledingstukken tegelijk en laat Studio alle varianten in één run verwerken. Ideaal voor seizoenscatalogi met tientallen of honderden producten.',
    },
    {
        title: 'Stijlconsistentie',
        description:
            'Definieer een huisstijl — lichttemperatuur, pose, achtergrondkleur — en pas deze als template toe op elk nieuw product. Zo behoud je altijd een uniforme merkuitstraling.',
    },
    {
        title: 'Directe export',
        description:
            'Download resultaten als hoge-resolutie JPEG of PNG, klaar voor gebruik op je Shopify webshop, sociale media of printmateriaal. Beelden worden toegevoegd aan je persoonlijke mediabibliotheek.',
    },
    {
        title: 'Privé & Veilig',
        description:
            'Alle geüploade producten en gegenereerde afbeeldingen blijven exclusief in jouw accountomgeving. Drapit verkoopt of deelt nooit klantdata met derden.',
    },
];

const HOW_IT_WORKS = [
    {
        num: '01',
        title: 'Upload een kledingstuk',
        description:
            'Ga naar het Studio-tabblad in je dashboard en upload een productfoto van het kledingstuk. Een eenvoudige flatlay of hangerfoto volstaat — Studio haalt de kledingcontour automatisch op.',
    },
    {
        num: '02',
        title: 'Kies model en stijlinstellingen',
        description:
            'Selecteer het gewenste modeltype en pas optioneel de achtergrond en pose aan. Je kunt ook een eerder opgeslagen huisstijltemplate toepassen voor directe consistentie.',
    },
    {
        num: '03',
        title: 'Genereer en beoordeel',
        description:
            'Studio verwerkt het beeld doorgaans binnen dertig seconden. Bekijk het resultaat in de ingebouwde preview en vergelijk met het origineel naast elkaar.',
    },
    {
        num: '04',
        title: 'Exporteer naar je webshop',
        description:
            'Download de afbeelding of kopieer de URL direct vanuit je Drapit mediabibliotheek. Gebruik de afbeelding overal waar je productfoto\'s nodig hebt — van Shopify tot Instagram.',
    },
];

const STUDIO_FAQS = [
    {
        q: 'Wat is het verschil tussen Studio en de Virtual Try-On widget?',
        a: 'De Virtual Try-On widget stelt shoppers in staat om kledingstukken op een eigen foto te passen — dat is een conversietool voor jouw klanten. Studio is een productietool voor jou als webshophouder: je genereert professionele productafbeeldingen en verbetert je catalogus zonder fotoshoot.',
    },
    {
        q: 'Hoeveel credits kost een Studio-generatie?',
        a: 'Elke afbeeldingsgeneratie in Studio kost één Studio-credit. Het aantal beschikbare credits is afhankelijk van je abonnement. Gebruikers op het Proef-plan ontvangen 20 gratis Studio-credits bij aanmelding.',
    },
    {
        q: 'Welke bestandsformaten kan ik uploaden?',
        a: 'Studio accepteert JPEG, PNG en WebP tot 20 MB per bestand. Voor de beste resultaten raden we een witte of effen achtergrond aan, hoewel Studio ook complexere achtergronden correct verwerkt.',
    },
    {
        q: 'Kan ik meerdere kledingstukken tegelijk verwerken?',
        a: 'Ja. Via batch-upload kun je meerdere bestanden tegelijk indienen. De creditskosten tellen per gegenereerde afbeelding, niet per upload-sessie.',
    },
    {
        q: 'Zijn mijn gegenereerde afbeeldingen commercieel te gebruiken?',
        a: 'Ja, alle door Drapit Studio gegenereerde afbeeldingen zijn vrij te gebruiken voor commerciële doeleinden, inclusief je webshop, sociale media en drukwerk, zolang je een actief abonnement hebt.',
    },
];

function FAQItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
    return (
        <div onClick={onToggle} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '22px 0', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9', fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1.3 }}>{q}</span>
                <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, border: '1px solid rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818CF8', fontSize: 20, transition: 'transform 0.3s', transform: isOpen ? 'rotate(45deg)' : 'none', fontWeight: 300 }}>+</div>
            </div>
            <div style={{ overflow: 'hidden', maxHeight: isOpen ? 220 : 0, transition: 'max-height 0.35s ease', marginTop: isOpen ? 12 : 0 }}>
                <p style={{ fontSize: 15, color: 'rgba(241,245,249,0.55)', lineHeight: 1.7, fontFamily: 'Plus Jakarta Sans, sans-serif', margin: 0, paddingRight: 40 }}>{a}</p>
            </div>
        </div>
    );
}

export default function StudioPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const hero = useInView(0.05);
    const featuresSection = useInView(0.08);
    const howSection = useInView(0.08);
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

                .studio-grid-bg {
                    background-image:
                        linear-gradient(rgba(99,102,241,0.055) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(99,102,241,0.055) 1px, transparent 1px);
                    background-size: 64px 64px;
                }

                @keyframes studio-slideup {
                    from { opacity: 0; transform: translateY(36px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes studio-shimmer {
                    0%   { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes studio-pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.35); }
                    50%      { box-shadow: 0 0 0 10px rgba(99,102,241,0); }
                }
                @keyframes studio-float {
                    0%, 100% { transform: translateY(0px); }
                    50%      { transform: translateY(-10px); }
                }

                .d-in   { opacity: 0; }
                .d-in.visible { animation: studio-slideup 0.7s ease forwards; }
                .d-d1 { animation-delay: 0.05s; }
                .d-d2 { animation-delay: 0.15s; }
                .d-d3 { animation-delay: 0.25s; }
                .d-d4 { animation-delay: 0.35s; }
                .d-d5 { animation-delay: 0.45s; }
                .d-d6 { animation-delay: 0.55s; }

                .d-gradient-studio {
                    background: linear-gradient(135deg, #F1F5F9 0%, #A5B4FC 50%, #6366F1 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .d-shimmer-studio {
                    background: linear-gradient(90deg, #F1F5F9 0%, #A5B4FC 25%, #818CF8 50%, #A5B4FC 75%, #F1F5F9 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: studio-shimmer 5s linear infinite;
                }

                .d-btn-primary-studio {
                    display: inline-block;
                    background: linear-gradient(135deg, #6366F1, #4F46E5);
                    color: white !important;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-weight: 700;
                    letter-spacing: 0.04em;
                    border-radius: 12px;
                    border: none;
                    cursor: pointer;
                    text-decoration: none;
                    transition: transform 0.25s, box-shadow 0.25s;
                    box-shadow: 0 8px 28px rgba(99,102,241,0.4);
                }
                .d-btn-primary-studio:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 14px 40px rgba(99,102,241,0.6) !important;
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
                .d-nav-link-active {
                    color: #A5B4FC !important;
                    background: rgba(99,102,241,0.1) !important;
                }

                .studio-feat-card {
                    transition: transform 0.25s ease, background 0.25s ease, border-color 0.25s ease;
                }
                .studio-feat-card:hover {
                    transform: translateY(-5px);
                    background: rgba(99,102,241,0.07) !important;
                    border-color: rgba(99,102,241,0.28) !important;
                }

                .studio-step-card {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .studio-step-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 24px 56px rgba(0,0,0,0.45), 0 0 30px rgba(99,102,241,0.1) !important;
                }

                /* Hamburger */
                .d-hamburger {
                    width: 40px; height: 40px;
                    display: flex; flex-direction: column;
                    align-items: center; justify-content: center; gap: 5px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 10px; cursor: pointer; padding: 0;
                    transition: background 0.2s;
                }
                .d-hamburger:hover { background: rgba(255,255,255,0.1); }
                .d-hamburger span {
                    display: block; width: 18px; height: 2px;
                    background: #F1F5F9; border-radius: 2px;
                    transition: transform 0.3s ease, opacity 0.3s ease;
                }
                .d-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
                .d-hamburger.open span:nth-child(2) { opacity: 0; }
                .d-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

                /* Mobile menu */
                .d-mobile-overlay {
                    position: fixed; inset: 0; z-index: 299;
                    background: rgba(6,9,15,0.6); backdrop-filter: blur(6px);
                    opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
                }
                .d-mobile-overlay.open { opacity: 1; pointer-events: auto; }

                .d-mobile-drawer {
                    position: fixed; top: 0; right: 0; bottom: 0;
                    width: min(320px, 85vw); z-index: 300;
                    background: linear-gradient(180deg, rgba(13,24,41,0.98) 0%, rgba(6,9,15,0.99) 100%);
                    border-left: 1px solid rgba(99,102,241,0.2);
                    box-shadow: -10px 0 40px rgba(0,0,0,0.6);
                    transform: translateX(100%); transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
                    padding: 24px; display: flex; flex-direction: column;
                }
                .d-mobile-drawer.open { transform: translateX(0); }

                .d-mobile-drawer-link {
                    font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600;
                    font-size: 17px; color: rgba(241,245,249,0.7); text-decoration: none;
                    padding: 16px 12px; border-radius: 12px;
                    transition: color 0.2s, background 0.2s; display: block;
                }
                .d-mobile-drawer-link:hover { color: #F1F5F9; background: rgba(99,102,241,0.1); }

                @media (max-width: 960px) {
                    .d-nav-links  { display: none !important; }
                    .d-nav-mobile { display: flex !important; }
                    .studio-feat-grid { grid-template-columns: 1fr 1fr !important; }
                }
                @media (max-width: 640px) {
                    .studio-feat-grid { grid-template-columns: 1fr !important; }
                    .studio-steps-grid { grid-template-columns: 1fr !important; }
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
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
                            <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
                                <path d="M9.5 3.5C9.5 2.67 8.83 2 8 2S6.5 2.67 6.5 3.5" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M8 5L2.5 10.5C2.18 10.77 2 11.15 2 11.56C2 12.35 2.65 13 3.44 13H12.56C13.35 13 14 12.35 14 11.56C14 11.15 13.82 10.77 13.5 10.5L8 5Z" stroke="#6366F1" strokeWidth="1.5" strokeLinejoin="round" />
                            </svg>
                            <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 20, color: '#F1F5F9', letterSpacing: '-0.015em' }}>Drapit</span>
                        </Link>

                        <div className="d-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Link href="/" className="d-nav-link">Home</Link>
                            <Link href="/shopify" className="d-nav-link">Shopify</Link>
                            <Link href="/studio" className="d-nav-link d-nav-link-active">Studio</Link>
                            <Link href="/contact" className="d-nav-link">Contact</Link>
                            <Link href="/dashboard/login" style={{ marginLeft: 8, padding: '9px 18px', fontSize: 14, fontWeight: 600, color: 'rgba(241,245,249,0.75)', fontFamily: 'Plus Jakarta Sans, sans-serif', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, textDecoration: 'none', transition: 'all 0.2s' }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = '#F1F5F9'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(241,245,249,0.75)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                            >
                                Inloggen
                            </Link>
                            <Link href="/dashboard/login" className="d-btn-primary-studio" style={{ padding: '9px 20px', fontSize: 14, marginLeft: 4 }}>
                                Gratis starten →
                            </Link>
                        </div>

                        <div className="d-nav-mobile" style={{ display: 'none', alignItems: 'center', gap: 8 }}>
                            <Link href="/dashboard/login" className="d-btn-primary-studio" style={{ padding: '8px 16px', fontSize: 12 }}>
                                Start gratis
                            </Link>
                            <button
                                className={`d-hamburger ${mobileMenuOpen ? 'open' : ''}`}
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                aria-label="Menu openen"
                            >
                                <span /><span /><span />
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Mobile overlay */}
                <div className={`d-mobile-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)} />

                {/* Mobile drawer */}
                <div className={`d-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                        <button className="d-hamburger open" onClick={() => setMobileMenuOpen(false)} aria-label="Menu sluiten">
                            <span /><span /><span />
                        </button>
                    </div>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                        <Link href="/" className="d-mobile-drawer-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                        <Link href="/shopify" className="d-mobile-drawer-link" onClick={() => setMobileMenuOpen(false)}>Shopify</Link>
                        <Link href="/studio" className="d-mobile-drawer-link" onClick={() => setMobileMenuOpen(false)} style={{ color: '#A5B4FC', background: 'rgba(99,102,241,0.08)' }}>Studio</Link>
                        <Link href="/contact" className="d-mobile-drawer-link" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
                        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '12px 0' }} />
                        <Link href="/dashboard/login" className="d-mobile-drawer-link" onClick={() => setMobileMenuOpen(false)}>Inloggen</Link>
                    </nav>
                    <div style={{ paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <Link href="/dashboard/login" className="d-btn-primary-studio" style={{ display: 'block', textAlign: 'center', padding: '14px 0', fontSize: 15, width: '100%' }} onClick={() => setMobileMenuOpen(false)}>
                            Gratis starten →
                        </Link>
                    </div>
                </div>

                {/* ─── HERO ───────────────────────────────────────────── */}
                <section className="studio-grid-bg" style={{ paddingTop: 148, paddingBottom: 100, position: 'relative', overflow: 'hidden' }}>
                    {/* Ambient orbs */}
                    <div style={{ position: 'absolute', top: '5%', left: '-5%', width: 640, height: 640, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 68%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 65%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

                    <div ref={hero.ref} style={{ maxWidth: 820, margin: '0 auto', padding: '0 28px', textAlign: 'center' }}>
                        {/* Eyebrow badge */}
                        <div className={`d-in d-d1 ${hero.inView ? 'visible' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.22)', borderRadius: 100, padding: '8px 20px', marginBottom: 36 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#818CF8', boxShadow: '0 0 8px #818CF8', animation: 'studio-pulse 2s ease-in-out infinite' }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#A5B4FC', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.1em' }}>AI PRODUCTFOTOGRAFIE VOOR WEBSHOPS</span>
                        </div>

                        {/* Headline */}
                        <h1 className={`d-in d-d2 ${hero.inView ? 'visible' : ''}`} style={{ fontSize: 'clamp(36px, 5vw, 68px)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, lineHeight: 1.06, letterSpacing: '-0.026em', marginBottom: 28, color: '#F1F5F9' }}>
                            Professionele productfoto&apos;s,{' '}
                            <span className="d-shimmer-studio">zonder fotoshoot.</span>
                        </h1>

                        {/* Subtitle */}
                        <p className={`d-in d-d3 ${hero.inView ? 'visible' : ''}`} style={{ fontSize: 19, color: 'rgba(241,245,249,0.55)', lineHeight: 1.72, marginBottom: 44, maxWidth: 620, margin: '0 auto 44px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                            Drapit Studio is een AI-gedreven productieomgeving waarmee je kledingstukken op realistische modellen plaatst, achtergronden vervangt en een complete catalogus genereert — direct vanuit je dashboard.
                        </p>

                        {/* CTA row */}
                        <div className={`d-in d-d4 ${hero.inView ? 'visible' : ''}`} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/dashboard" className="d-btn-primary-studio" style={{ padding: '14px 32px', fontSize: 16 }}>
                                Open Studio →
                            </Link>
                            <a href="#hoe-het-werkt" style={{ padding: '14px 28px', fontSize: 16, fontWeight: 500, color: 'rgba(241,245,249,0.72)', fontFamily: 'Plus Jakarta Sans, sans-serif', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, textDecoration: 'none', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#F1F5F9'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(241,245,249,0.72)'; }}
                            >
                                Hoe het werkt ↓
                            </a>
                        </div>

                        {/* Stats row */}
                        <div className={`d-in d-d5 ${hero.inView ? 'visible' : ''}`} style={{ marginTop: 64, display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 40 }}>
                            {[
                                { value: '< 30s', label: 'Verwerkingstijd' },
                                { value: '4K', label: 'Uitvoerresolutie' },
                                { value: '100%', label: 'Commercieel vrij' },
                            ].map((stat, i) => (
                                <div key={i} style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 28, fontWeight: 800, color: '#F1F5F9', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.02em' }}>{stat.value}</div>
                                    <div style={{ fontSize: 12, color: '#A5B4FC', fontWeight: 600, fontFamily: 'Plus Jakarta Sans, sans-serif', marginTop: 4 }}>{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── VISUAL SHOWCASE ──────────────────────────────────── */}
                <section style={{ padding: '24px 28px 100px', position: 'relative' }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                        {/* Studio mock UI */}
                        <div style={{
                            borderRadius: 24,
                            background: 'linear-gradient(135deg, rgba(13,24,41,0.95) 0%, rgba(6,9,15,0.98) 100%)',
                            border: '1px solid rgba(99,102,241,0.22)',
                            boxShadow: '0 40px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.05)',
                            overflow: 'hidden',
                        }}>
                            {/* Browser chrome */}
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E' }} />
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28CA41' }} />
                                <div style={{ marginLeft: 12, flex: 1, height: 22, borderRadius: 6, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', paddingLeft: 12 }}>
                                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>drapit.io/dashboard/studio</span>
                                </div>
                            </div>

                            {/* App layout */}
                            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 380 }}>
                                {/* Sidebar */}
                                <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.15em', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 8, paddingLeft: 12 }}>STUDIO</div>
                                    {[
                                        { label: 'Nieuw project', active: true },
                                        { label: 'Mijn galerij', active: false },
                                        { label: 'Templates', active: false },
                                        { label: 'Batch-wachtrij', active: false },
                                    ].map((item) => (
                                        <div key={item.label} style={{
                                            padding: '9px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                                            color: item.active ? '#A5B4FC' : 'rgba(241,245,249,0.4)',
                                            background: item.active ? 'rgba(99,102,241,0.12)' : 'transparent',
                                        }}>
                                            {item.label}
                                        </div>
                                    ))}
                                    <div style={{ marginTop: 16, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                                    <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.15em', fontFamily: 'Plus Jakarta Sans, sans-serif', margin: '8px 0', paddingLeft: 12 }}>ACCOUNT</div>
                                    {['Dashboard', 'API-sleutels', 'Facturering'].map((item) => (
                                        <div key={item} style={{ padding: '9px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'rgba(241,245,249,0.4)' }}>
                                            {item}
                                        </div>
                                    ))}
                                </div>

                                {/* Main content */}
                                <div style={{ padding: '28px 32px' }}>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: '#F1F5F9', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 24 }}>Nieuw Studio-project</div>

                                    {/* Upload + settings row */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                                        {/* Upload zone */}
                                        <div style={{ border: '2px dashed rgba(99,102,241,0.3)', borderRadius: 16, padding: '28px 20px', textAlign: 'center', background: 'rgba(99,102,241,0.04)' }}>
                                            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                                                </svg>
                                            </div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(241,245,249,0.65)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Kledingstuk uploaden</div>
                                            <div style={{ fontSize: 11, color: 'rgba(241,245,249,0.3)', fontFamily: 'Plus Jakarta Sans, sans-serif', marginTop: 4 }}>JPEG, PNG of WebP · max. 20 MB</div>
                                        </div>

                                        {/* Settings panel */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                            {[
                                                { label: 'Model', value: 'Vrouw — Europees, L' },
                                                { label: 'Achtergrond', value: 'Neutraal grijs gradient' },
                                                { label: 'Pose', value: 'Frontaal, rechtop' },
                                            ].map((setting) => (
                                                <div key={setting.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 14px' }}>
                                                    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(241,245,249,0.3)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.08em', marginBottom: 3 }}>{setting.label.toUpperCase()}</div>
                                                    <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(241,245,249,0.7)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{setting.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Generate button */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ padding: '11px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #6366F1, #4F46E5)', fontSize: 13, fontWeight: 700, color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 4px 20px rgba(99,102,241,0.4)', letterSpacing: '0.02em' }}>
                                            Genereer afbeelding →
                                        </div>
                                        <div style={{ fontSize: 12, color: 'rgba(241,245,249,0.3)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>1 Studio-credit per generatie</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── FEATURES ───────────────────────────────────────── */}
                <section style={{ padding: '0 28px 128px', position: 'relative' }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                        <div ref={featuresSection.ref} style={{ textAlign: 'center', marginBottom: 72 }}>
                            <div className={`d-in d-d1 ${featuresSection.inView ? 'visible' : ''}`} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#6366F1', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 18, textTransform: 'uppercase' }}>
                                MOGELIJKHEDEN
                            </div>
                            <h2 className={`d-gradient-studio d-in d-d2 ${featuresSection.inView ? 'visible' : ''}`} style={{ fontSize: 'clamp(28px, 4vw, 50px)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.08 }}>
                                Alles wat je nodig hebt<br />voor je cataloog
                            </h2>
                            <p className={`d-in d-d3 ${featuresSection.inView ? 'visible' : ''}`} style={{ marginTop: 20, fontSize: 17, color: 'rgba(241,245,249,0.45)', fontFamily: 'Plus Jakarta Sans, sans-serif', maxWidth: 540, margin: '20px auto 0' }}>
                                Studio combineert modelgeneratie, achtergrondbewerking en batchverwerking in één overzichtelijke omgeving.
                            </p>
                        </div>

                        <div className="studio-feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                            {STUDIO_FEATURES.map((feat, i) => (
                                <div key={i} className={`studio-feat-card d-in d-d${Math.min(i + 1, 6)} ${featuresSection.inView ? 'visible' : ''}`} style={{
                                    background: 'rgba(13,24,41,0.55)',
                                    border: '1px solid rgba(255,255,255,0.07)',
                                    borderRadius: 20,
                                    padding: '28px 24px',
                                }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                                        <div style={{ width: 12, height: 12, borderRadius: 3, background: '#6366F1', opacity: 0.9 }} />
                                    </div>
                                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#F1F5F9', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 10, letterSpacing: '-0.01em' }}>{feat.title}</h3>
                                    <p style={{ fontSize: 14, color: 'rgba(241,245,249,0.48)', lineHeight: 1.7, fontFamily: 'Plus Jakarta Sans, sans-serif', margin: 0 }}>{feat.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── HOW IT WORKS ────────────────────────────────────── */}
                <section id="hoe-het-werkt" style={{ padding: '0 28px 128px', position: 'relative' }}>
                    <div style={{ maxWidth: 1060, margin: '0 auto' }}>
                        <div ref={howSection.ref} style={{ textAlign: 'center', marginBottom: 72 }}>
                            <div className={`d-in d-d1 ${howSection.inView ? 'visible' : ''}`} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#6366F1', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 18, textTransform: 'uppercase' }}>
                                HOE HET WERKT
                            </div>
                            <h2 className={`d-gradient-studio d-in d-d2 ${howSection.inView ? 'visible' : ''}`} style={{ fontSize: 'clamp(28px, 4vw, 50px)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.08 }}>
                                Van upload naar catalogusfoto<br />in vier stappen
                            </h2>
                        </div>

                        <div className="studio-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                            {HOW_IT_WORKS.map((step, i) => (
                                <div key={i} className={`studio-step-card d-in d-d${i + 1} ${howSection.inView ? 'visible' : ''}`} style={{
                                    background: 'linear-gradient(135deg, rgba(13,24,41,0.8) 0%, rgba(6,9,15,0.9) 100%)',
                                    border: '1px solid rgba(99,102,241,0.14)',
                                    borderRadius: 24,
                                    padding: '36px 32px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}>
                                    <div style={{ position: 'absolute', top: 20, right: 24, fontSize: 48, fontWeight: 900, color: 'rgba(99,102,241,0.08)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.03em', lineHeight: 1 }}>{step.num}</div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#6366F1', letterSpacing: '0.1em', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 14 }}>STAP {step.num}</div>
                                    <h3 style={{ fontSize: 20, fontWeight: 800, color: '#F1F5F9', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.015em', marginBottom: 14, lineHeight: 1.2 }}>{step.title}</h3>
                                    <p style={{ fontSize: 15, color: 'rgba(241,245,249,0.5)', lineHeight: 1.72, fontFamily: 'Plus Jakarta Sans, sans-serif', margin: 0 }}>{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── CREDITS BANNER ──────────────────────────────────── */}
                <section style={{ padding: '0 28px 128px' }}>
                    <div style={{ maxWidth: 1060, margin: '0 auto' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(13,24,41,0.7) 60%, rgba(139,92,246,0.07) 100%)',
                            border: '1px solid rgba(99,102,241,0.22)',
                            borderRadius: 24,
                            padding: '52px 48px',
                            display: 'grid',
                            gridTemplateColumns: '1fr auto',
                            gap: 32,
                            alignItems: 'center',
                        }}>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#818CF8', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 14 }}>CREDITS EN PRIJZEN</div>
                                <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 800, color: '#F1F5F9', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 14 }}>
                                    Elke nieuwe gebruiker ontvangt<br />20 gratis Studio-credits.
                                </h2>
                                <p style={{ fontSize: 16, color: 'rgba(241,245,249,0.48)', fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1.7, maxWidth: 480 }}>
                                    Eén credit staat gelijk aan één afbeeldingsgeneratie. Admins hebben onbeperkte toegang. Extra credits zijn beschikbaar via een Studio-abonnement vanuit je dashboard.
                                </p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 180 }}>
                                <Link href="/dashboard/login" className="d-btn-primary-studio" style={{ padding: '14px 28px', fontSize: 15, textAlign: 'center', whiteSpace: 'nowrap' }}>
                                    Gratis starten →
                                </Link>
                                <Link href="/dashboard" style={{ padding: '14px 28px', fontSize: 15, fontWeight: 600, color: 'rgba(241,245,249,0.65)', fontFamily: 'Plus Jakarta Sans, sans-serif', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, textDecoration: 'none', textAlign: 'center', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#F1F5F9'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(241,245,249,0.65)'; }}
                                >
                                    Mijn dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── FAQ ─────────────────────────────────────────────── */}
                <section id="faq" style={{ padding: '0 28px 128px' }}>
                    <div style={{ maxWidth: 740, margin: '0 auto' }}>
                        <div ref={faqSection.ref} style={{ textAlign: 'center', marginBottom: 60 }}>
                            <div className={`d-in d-d1 ${faqSection.inView ? 'visible' : ''}`} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#6366F1', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 18 }}>VEELGESTELDE VRAGEN</div>
                            <h2 className={`d-gradient-studio d-in d-d2 ${faqSection.inView ? 'visible' : ''}`} style={{ fontSize: 'clamp(28px, 3.5vw, 46px)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.08 }}>
                                Heb je nog vragen?
                            </h2>
                        </div>
                        <div className={`d-in d-d3 ${faqSection.inView ? 'visible' : ''}`}>
                            {STUDIO_FAQS.map((faq, i) => (
                                <FAQItem key={i} q={faq.q} a={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── FINAL CTA ─────────────────────────────────────── */}
                <section ref={ctaSection.ref} style={{ padding: '0 28px 120px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
                    <div style={{ maxWidth: 780, margin: '0 auto', position: 'relative' }}>
                        <div className={`d-in d-d1 ${ctaSection.inView ? 'visible' : ''}`} style={{ background: 'linear-gradient(135deg, rgba(13,24,41,0.92) 0%, rgba(6,9,15,0.97) 100%)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 28, padding: '68px 52px', textAlign: 'center', boxShadow: '0 40px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#818CF8', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 22 }}>BEGIN VANDAAG</div>
                            <h2 className="d-gradient-studio" style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, letterSpacing: '-0.028em', lineHeight: 1.08, marginBottom: 20 }}>
                                Bouw een professionele<br />productcatalogus met AI.
                            </h2>
                            <p style={{ fontSize: 17, color: 'rgba(241,245,249,0.45)', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 36, maxWidth: 460, margin: '0 auto 36px' }}>
                                Geen fotoshoot nodig. Registreer gratis en gebruik direct je 20 Studio-credits.
                            </p>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Link href="/dashboard/login" className="d-btn-primary-studio" style={{ padding: '16px 38px', fontSize: 16 }}>
                                    GRATIS ACCOUNT AANMAKEN →
                                </Link>
                                <Link href="/" style={{ padding: '16px 30px', fontSize: 16, fontWeight: 500, color: 'rgba(241,245,249,0.68)', fontFamily: 'Plus Jakarta Sans, sans-serif', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, textDecoration: 'none', transition: 'all 0.2s' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#F1F5F9'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(241,245,249,0.68)'; }}
                                >
                                    Terug naar home
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </>
    );
}
