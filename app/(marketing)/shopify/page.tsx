'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

/* ─────────────────────────────────────────────────────────────────────────────
   DRAPIT — SHOPIFY INSTALLATIE GIDS
   Volledige stap-voor-stap handleiding voor Shopify webshop-eigenaren
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

const SHOPIFY_FAQS = [
    {
        q: 'Werkt Drapit met elk Shopify thema?',
        a: 'Ja! Drapit werkt met alle Shopify thema\'s — zowel gratis als betaalde thema\'s. Het maakt niet uit welk thema je gebruikt, het script werkt altijd. Drapit plaatst de knop automatisch zonder je bestaande design te verstoren.',
    },
    {
        q: 'Moet ik technische kennis hebben?',
        a: 'Nee, absoluut niet. De hele installatie bestaat uit kopiëren en plakken. Je hoeft geen code te schrijven of te begrijpen. Volg simpelweg de stappen hierboven en je bent klaar.',
    },
    {
        q: 'Hoeveel kost het om te starten?',
        a: 'Je kunt helemaal gratis beginnen met ons Proef-abonnement. Dit geeft je 20 try-ons per maand, perfect om het uit te proberen. Daarna kun je elk moment upgraden als je meer nodig hebt.',
    },
    {
        q: 'Kan ik de "Virtueel passen" knop aanpassen?',
        a: 'Ja! Je kunt de kleur, de tekst en de stijl van de knop volledig aanpassen via je Drapit dashboard. Zo past de knop perfect bij het design van jouw webshop. Geen code nodig.',
    },
    {
        q: 'Telt elke klik als een try-on?',
        a: 'Nee, alleen wanneer een klant daadwerkelijk een foto uploadt en het resultaat wordt verwerkt. Dus het klikken op de knop zelf kost niets.',
    },
    {
        q: 'Kan ik Drapit op bepaalde producten uitzetten?',
        a: 'Ja, je bepaalt zelf bij welke producten de "Virtueel passen" knop verschijnt. Je kunt dit per product instellen.',
    },
    {
        q: 'Wat als ik hulp nodig heb bij de installatie?',
        a: 'Geen zorgen! Stuur ons een bericht via het contactformulier of mail naar info@drapit.io. We helpen je graag en reageren normaal gesproken binnen één werkdag.',
    },
];

function FAQItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
    return (
        <div onClick={onToggle} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '22px 0', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9', fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1.3 }}>{q}</span>
                <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, border: '1px solid rgba(149,191,71,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#95BF47', fontSize: 20, transition: 'transform 0.3s', transform: isOpen ? 'rotate(45deg)' : 'none', fontWeight: 300 }}>+</div>
            </div>
            <div style={{ overflow: 'hidden', maxHeight: isOpen ? 200 : 0, transition: 'max-height 0.35s ease', marginTop: isOpen ? 12 : 0 }}>
                <p style={{ fontSize: 15, color: 'rgba(241,245,249,0.55)', lineHeight: 1.7, fontFamily: 'Plus Jakarta Sans, sans-serif', margin: 0, paddingRight: 40 }}>{a}</p>
            </div>
        </div>
    );
}

export default function ShopifyGuidePage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const [activeStep, setActiveStep] = useState(0);

    const hero = useInView(0.05);
    const stepsSection = useInView(0.05);
    const faqSection = useInView(0.1);
    const ctaSection = useInView(0.1);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    const STEPS = [
        {
            num: '01',
            title: 'Maak een Drapit account aan',
            icon: '👤',
            color: '#22D3EE',
            substeps: [
                {
                    title: 'Ga naar de Drapit website',
                    description: 'Open je browser en ga naar drapit.io. Klik rechtsboven op "Gratis starten" of "Inloggen".',
                },
                {
                    title: 'Registreer je account',
                    description: 'Vul je e-mailadres en een wachtwoord in. Je ontvangt een bevestigingsmail — klik op de link om je account te activeren.',
                },
                {
                    title: 'Kies een abonnement',
                    description: 'Je kunt gratis beginnen met het Proef-abonnement (20 try-ons per maand). Later kun je altijd upgraden als je meer nodig hebt.',
                },
            ],
        },
        {
            num: '02',
            title: 'Kopieer je persoonlijke code',
            icon: '🔑',
            color: '#8B5CF6',
            substeps: [
                {
                    title: 'Ga naar je Dashboard',
                    description: 'Na het inloggen kom je op je Drapit dashboard. Dit is je persoonlijke omgeving waar je alles kunt beheren.',
                },
                {
                    title: 'Klik op "API-sleutels"',
                    description: 'In het menu aan de linkerkant zie je "API-sleutels". Klik hierop om naar je sleutels te gaan.',
                },
                {
                    title: 'Maak een nieuwe sleutel aan',
                    description: 'Klik op "Nieuwe sleutel aanmaken". Geef het een naam die je herkent, bijvoorbeeld "Mijn Shopify Winkel". Je sleutel wordt direct aangemaakt.',
                },
                {
                    title: 'Kopieer de sleutel',
                    description: 'Klik op het kopieer-icoontje naast je sleutel (begint met dk_live_). Je hebt deze straks nodig bij het plakken in Shopify.',
                },
            ],
        },
        {
            num: '03',
            title: 'Plak de code in je Shopify winkel',
            icon: '🛍️',
            color: '#95BF47',
            substeps: [
                {
                    title: 'Log in op je Shopify admin',
                    description: 'Ga naar je Shopify admin paneel. Dit is het scherm waar je normaal gesproken je producten en bestellingen beheert.',
                },
                {
                    title: 'Ga naar je thema-bestanden',
                    description: 'Klik in het linkermenu op "Online Store" (Online winkel), dan op "Themes" (Thema\'s). Bij je actieve thema klik je op de drie puntjes (⋮) en kies je "Edit code" (Code bewerken).',
                },
                {
                    title: 'Open het juiste bestand',
                    description: 'In de lijst met bestanden aan de linkerkant, zoek je het bestand genaamd "theme.liquid". Dit vind je meestal in de map "Layout". Klik erop om het te openen.',
                },
                {
                    title: 'Plak de Drapit code',
                    description: 'Scroll in het bestand naar beneden tot je </head> ziet. Plak de volgende code net BOVEN die regel. Vergeet niet om JOUW_API_SLEUTEL te vervangen met de sleutel die je net hebt gekopieerd!',
                    code: `<!-- Drapit Virtual Try-On -->
<script
  src="https://drapit.io/widget/drapit-widget.js"
  data-drapit-key="JOUW_API_SLEUTEL"
  data-drapit-color="#1D6FD8"
  data-drapit-cta="Virtueel passen"
  defer
></script>`,
                },
                {
                    title: 'Sla op',
                    description: 'Klik rechtsboven op de groene knop "Save" (Opslaan). De code is nu toegevoegd aan je winkel!',
                },
            ],
        },
        {
            num: '04',
            title: 'Producten koppelen',
            icon: '👕',
            color: '#F59E0B',
            substeps: [
                {
                    title: 'Wat zijn data-attributen?',
                    description: 'Om Drapit te laten weten bij welke producten de "Virtueel passen" knop moet verschijnen, moet je een kleine toevoeging doen aan je productpagina. Dit klinkt technisch, maar het is heel simpel — je hoeft alleen maar een stukje tekst toe te voegen.',
                },
                {
                    title: 'Ga naar je productpagina template',
                    description: 'Ga opnieuw naar "Edit code" in je thema. Zoek naar het bestand dat je productpagina bevat. Dit heet meestal "product.liquid", "main-product.liquid" of iets vergelijkbaars. Niet zeker welk bestand? Zoek naar een bestand met het woord "product" in de naam.',
                },
                {
                    title: 'Voeg de Drapit verbinding toe',
                    description: 'Zoek in het bestand naar de plek waar je productinformatie wordt getoond (de titel, prijs, etc.). Voeg aan het omsluitende element de volgende kenmerken toe:',
                    code: `<div class="product-info"
  data-drapit-product="{{ product.featured_image | img_url: 'grande' }}"
  data-drapit-product-id="{{ product.variants.first.sku | default: product.id }}"
  data-drapit-product-name="{{ product.title }}"
  data-drapit-buy-url="{{ product.url }}"
>
  <!-- Je bestaande product HTML -->
</div>`,
                },
                {
                    title: 'Alternatief: Custom Liquid blok (nog makkelijker!)',
                    description: 'Heb je een nieuwer Shopify thema (Online Store 2.0)? Dan kun je ook via "Customize" → "Add block" → "Custom Liquid" een blok toevoegen op je productpagina en daar de code inplakken. Dit is de makkelijkste manier en vereist geen kennis van codebestanden.',
                },
            ],
        },
        {
            num: '05',
            title: 'Testen en live gaan!',
            icon: '🚀',
            color: '#1D6FD8',
            substeps: [
                {
                    title: 'Open je webshop',
                    description: 'Ga naar de voorkant van je Shopify winkel (niet het admin paneel, maar de echte website die je klanten zien).',
                },
                {
                    title: 'Ga naar een productpagina',
                    description: 'Open een product waaraan je de Drapit-kenmerken hebt toegevoegd. Je zou nu een "Virtueel passen" knop moeten zien verschijnen bij het product.',
                },
                {
                    title: 'Test de knop',
                    description: 'Klik op "Virtueel passen". Er opent zich een venster waar je een foto kunt uploaden. Upload een foto van iemand en wacht een paar seconden. Je ziet het kledingstuk verschijnen op de foto!',
                },
                {
                    title: 'Gefeliciteerd! 🎉',
                    description: 'Alles werkt? Dan is je installatie klaar! Je klanten kunnen nu virtueel kleding passen in je winkel. Ga naar je Drapit dashboard om te zien hoeveel try-ons er worden gedaan en hoe het de conversie beïnvloedt.',
                },
            ],
        },
    ];

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

                .drapit-grid-bg {
                    background-image:
                        linear-gradient(rgba(149,191,71,0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(149,191,71,0.04) 1px, transparent 1px);
                    background-size: 64px 64px;
                }

                @keyframes drapit-slideup {
                    from { opacity: 0; transform: translateY(36px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes drapit-float {
                    0%, 100% { transform: translateY(0px); }
                    50%      { transform: translateY(-14px); }
                }
                @keyframes drapit-pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(149,191,71,0.35); }
                    50%      { box-shadow: 0 0 0 10px rgba(149,191,71,0); }
                }
                @keyframes drapit-shimmer {
                    0%   { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }

                .d-in   { opacity: 0; }
                .d-in.visible { animation: drapit-slideup 0.7s ease forwards; }
                .d-d1 { animation-delay: 0.05s; }
                .d-d2 { animation-delay: 0.15s; }
                .d-d3 { animation-delay: 0.25s; }
                .d-d4 { animation-delay: 0.35s; }
                .d-d5 { animation-delay: 0.45s; }

                .d-gradient-shopify {
                    background: linear-gradient(135deg, #F1F5F9 0%, #95BF47 55%, #5E8E3E 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .d-shimmer-shopify {
                    background: linear-gradient(90deg, #F1F5F9 0%, #95BF47 25%, #5E8E3E 50%, #95BF47 75%, #F1F5F9 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: drapit-shimmer 5s linear infinite;
                }

                .d-btn-primary-shopify {
                    display: inline-block;
                    background: linear-gradient(135deg, #95BF47, #5E8E3E);
                    color: white !important;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-weight: 700;
                    letter-spacing: 0.04em;
                    border-radius: 12px;
                    border: none;
                    cursor: pointer;
                    text-decoration: none;
                    transition: transform 0.25s, box-shadow 0.25s;
                    box-shadow: 0 8px 28px rgba(149,191,71,0.35);
                }
                .d-btn-primary-shopify:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 14px 40px rgba(149,191,71,0.55) !important;
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

                .d-step-card {
                    transition: all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
                    cursor: pointer;
                }
                .d-step-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.4) !important;
                }
                .d-step-card.active {
                    border-color: rgba(149,191,71,0.6) !important;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.4), 0 0 30px rgba(149,191,71,0.1) !important;
                }

                .d-substep {
                    transition: all 0.25s ease;
                }
                .d-substep:hover {
                    background: rgba(149,191,71,0.06) !important;
                    border-color: rgba(149,191,71,0.25) !important;
                }

                .d-code-block {
                    position: relative;
                    background: rgba(6,9,15,0.95);
                    border: 1px solid rgba(149,191,71,0.2);
                    border-radius: 12px;
                    padding: 20px;
                    margin-top: 16px;
                    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
                    font-size: 13px;
                    line-height: 1.7;
                    color: rgba(241,245,249,0.75);
                    white-space: pre-wrap;
                    word-break: break-all;
                    overflow-x: auto;
                }

                .d-code-label {
                    position: absolute;
                    top: -10px;
                    left: 16px;
                    background: rgba(149,191,71,0.15);
                    border: 1px solid rgba(149,191,71,0.25);
                    border-radius: 6px;
                    padding: 2px 10px;
                    font-size: 10px;
                    font-weight: 700;
                    color: #95BF47;
                    letter-spacing: 0.06em;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }

                @media (max-width: 960px) {
                    .d-nav-links  { display: none !important; }
                    .d-nav-mobile { display: flex !important; }
                    .d-hero-grid  { grid-template-columns: 1fr !important; gap: 48px !important; }
                    .d-steps-layout { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 540px) {
                    .d-hero-title { font-size: clamp(28px, 7vw, 40px) !important; }
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
                                <path d="M9.5 3.5C9.5 2.67 8.83 2 8 2S6.5 2.67 6.5 3.5" stroke="#95BF47" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M8 5L2.5 10.5C2.18 10.77 2 11.15 2 11.56C2 12.35 2.65 13 3.44 13H12.56C13.35 13 14 12.35 14 11.56C14 11.15 13.82 10.77 13.5 10.5L8 5Z" stroke="#95BF47" strokeWidth="1.5" strokeLinejoin="round" />
                            </svg>
                            <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 20, color: '#F1F5F9', letterSpacing: '-0.015em' }}>Drapit</span>
                        </Link>

                        <div className="d-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Link href="/" className="d-nav-link">Home</Link>
                            <a href="#installatie" className="d-nav-link">Installatie</a>
                            <a href="#faq" className="d-nav-link">FAQ</a>
                            <Link href="/dashboard/login" style={{ marginLeft: 8, padding: '9px 18px', fontSize: 14, fontWeight: 600, color: 'rgba(241,245,249,0.75)', fontFamily: 'Plus Jakarta Sans, sans-serif', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, textDecoration: 'none', transition: 'all 0.2s' }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = '#F1F5F9'; e.currentTarget.style.borderColor = 'rgba(149,191,71,0.4)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(241,245,249,0.75)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                            >
                                Inloggen
                            </Link>
                            <Link href="/dashboard/login" className="d-btn-primary-shopify" style={{ padding: '9px 20px', fontSize: 14, marginLeft: 4 }}>
                                Gratis starten →
                            </Link>
                        </div>

                        <div className="d-nav-mobile" style={{ display: 'none', alignItems: 'center', gap: 8 }}>
                            <Link href="/dashboard/login" className="d-btn-primary-shopify" style={{ padding: '8px 16px', fontSize: 12 }}>
                                Start gratis
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* ─── HERO ───────────────────────────────────────────── */}
                <section className="drapit-grid-bg" style={{ paddingTop: 148, paddingBottom: 80, position: 'relative', overflow: 'hidden' }}>
                    {/* Ambient orbs */}
                    <div style={{ position: 'absolute', top: '5%', left: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(149,191,71,0.12) 0%, transparent 68%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(94,142,62,0.08) 0%, transparent 65%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

                    <div ref={hero.ref} style={{ maxWidth: 900, margin: '0 auto', padding: '0 28px', textAlign: 'center' }}>
                        {/* Partner badge */}
                        <div className={`d-in d-d1 ${hero.inView ? 'visible' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(149,191,71,0.1)', border: '1px solid rgba(149,191,71,0.22)', borderRadius: 100, padding: '8px 20px', marginBottom: 36 }}>
                            <img src="/images/logos/Shopify_logo_2018.svg.png" alt="Shopify" style={{ height: 18, width: 'auto' }} />
                            <div style={{ width: 1, height: 14, background: 'rgba(149,191,71,0.3)' }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#95BF47', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.1em' }}>OFFICIAL PARTNER</span>
                        </div>

                        {/* Headline */}
                        <h1 className={`d-hero-title d-in d-d2 ${hero.inView ? 'visible' : ''}`} style={{ fontSize: 'clamp(34px, 4.5vw, 62px)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.025em', marginBottom: 24, color: '#F1F5F9' }}>
                            Drapit installeren op{' '}
                            <span className="d-shimmer-shopify">Shopify</span>
                        </h1>

                        {/* Subtitle */}
                        <p className={`d-in d-d3 ${hero.inView ? 'visible' : ''}`} style={{ fontSize: 19, color: 'rgba(241,245,249,0.55)', lineHeight: 1.7, marginBottom: 20, maxWidth: 620, margin: '0 auto 20px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                            Volg deze eenvoudige stappen om de virtuele pas-functie toe te voegen aan je Shopify webshop. Geen technische kennis nodig — alles is kopiëren en plakken.
                        </p>

                        {/* Time estimate */}
                        <div className={`d-in d-d4 ${hero.inView ? 'visible' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(149,191,71,0.08)', border: '1px solid rgba(149,191,71,0.15)', borderRadius: 100, padding: '10px 24px', marginBottom: 40 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#95BF47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#95BF47', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Geschatte tijd: 10 minuten</span>
                        </div>

                        {/* CTA */}
                        <div className={`d-in d-d5 ${hero.inView ? 'visible' : ''}`} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <a href="#installatie" className="d-btn-primary-shopify" style={{ padding: '14px 30px', fontSize: 16 }}>
                                Begin met installeren ↓
                            </a>
                            <Link href="/dashboard/login" style={{ padding: '14px 28px', fontSize: 16, fontWeight: 500, color: 'rgba(241,245,249,0.72)', fontFamily: 'Plus Jakarta Sans, sans-serif', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, textDecoration: 'none', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#F1F5F9'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(241,245,249,0.72)'; }}
                            >
                                Eerst account aanmaken →
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ─── OVERVIEW CARDS ──────────────────────────────────── */}
                <section style={{ padding: '40px 28px 0' }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                        {STEPS.map((step, i) => (
                            <a
                                key={i}
                                href="#installatie"
                                onClick={(e) => { e.preventDefault(); setActiveStep(i); document.getElementById('installatie')?.scrollIntoView({ behavior: 'smooth' }); }}
                                className={`d-step-card ${activeStep === i ? 'active' : ''}`}
                                style={{
                                    background: activeStep === i ? `linear-gradient(135deg, ${step.color}12, rgba(13,24,41,0.8))` : 'rgba(13,24,41,0.6)',
                                    border: `1px solid ${activeStep === i ? `${step.color}44` : 'rgba(255,255,255,0.06)'}`,
                                    borderRadius: 16,
                                    padding: '20px 16px',
                                    textDecoration: 'none',
                                    display: 'flex',
                                    flexDirection: 'column' as const,
                                    gap: 8,
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 22 }}>{step.icon}</span>
                                    <span style={{ fontSize: 28, fontWeight: 800, color: `${step.color}25`, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{step.num}</span>
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: activeStep === i ? '#F1F5F9' : 'rgba(241,245,249,0.65)', fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1.3 }}>{step.title}</div>
                            </a>
                        ))}
                    </div>
                </section>

                {/* ─── STEP-BY-STEP GUIDE ─────────────────────────────── */}
                <section id="installatie" style={{ padding: '80px 28px 128px', position: 'relative' }}>
                    <div ref={stepsSection.ref} style={{ maxWidth: 900, margin: '0 auto' }}>

                        {/* Section title */}
                        <div style={{ textAlign: 'center', marginBottom: 64 }}>
                            <div className={`d-in d-d1 ${stepsSection.inView ? 'visible' : ''}`} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#95BF47', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 18, textTransform: 'uppercase' }}>
                                STAP-VOOR-STAP HANDLEIDING
                            </div>
                            <h2 className={`d-gradient-shopify d-in d-d2 ${stepsSection.inView ? 'visible' : ''}`} style={{ fontSize: 'clamp(28px, 4vw, 46px)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.08 }}>
                                Installatie in 5 stappen
                            </h2>
                        </div>

                        {/* Steps accordion */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {STEPS.map((step, i) => (
                                <div
                                    key={i}
                                    className={`d-in d-d${Math.min(i + 1, 5)} ${stepsSection.inView ? 'visible' : ''}`}
                                    style={{
                                        background: activeStep === i
                                            ? `linear-gradient(135deg, ${step.color}08, rgba(13,24,41,0.85))`
                                            : 'rgba(13,24,41,0.5)',
                                        border: `1px solid ${activeStep === i ? `${step.color}35` : 'rgba(255,255,255,0.06)'}`,
                                        borderRadius: 24,
                                        overflow: 'hidden',
                                        transition: 'all 0.4s ease',
                                    }}
                                >
                                    {/* Step header */}
                                    <div
                                        onClick={() => setActiveStep(activeStep === i ? -1 : i)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 20,
                                            padding: '24px 32px',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s',
                                        }}
                                    >
                                        <div style={{
                                            width: 52, height: 52, borderRadius: 16,
                                            background: `${step.color}15`,
                                            border: `1px solid ${step.color}30`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 24, flexShrink: 0,
                                        }}>
                                            {step.icon}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: step.color, fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.08em', marginBottom: 4 }}>STAP {step.num}</div>
                                            <div style={{ fontSize: 20, fontWeight: 700, color: '#F1F5F9', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.01em' }}>{step.title}</div>
                                        </div>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: '50%',
                                            border: `1px solid ${step.color}40`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: step.color, fontSize: 18,
                                            transition: 'transform 0.3s',
                                            transform: activeStep === i ? 'rotate(180deg)' : 'none',
                                            flexShrink: 0,
                                        }}>
                                            ↓
                                        </div>
                                    </div>

                                    {/* Step content */}
                                    <div style={{
                                        maxHeight: activeStep === i ? 2000 : 0,
                                        overflow: 'hidden',
                                        transition: 'max-height 0.5s ease',
                                    }}>
                                        <div style={{ padding: '0 32px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                                            {step.substeps.map((substep, j) => (
                                                <div key={j} className="d-substep" style={{
                                                    background: 'rgba(255,255,255,0.02)',
                                                    border: '1px solid rgba(255,255,255,0.05)',
                                                    borderRadius: 16,
                                                    padding: '20px 24px',
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                                                        <div style={{
                                                            width: 28, height: 28, borderRadius: '50%',
                                                            background: `${step.color}18`,
                                                            border: `1px solid ${step.color}35`,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: 12, fontWeight: 800, color: step.color,
                                                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                                                            flexShrink: 0, marginTop: 2,
                                                        }}>
                                                            {j + 1}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 6 }}>{substep.title}</div>
                                                            <p style={{ fontSize: 14, color: 'rgba(241,245,249,0.52)', lineHeight: 1.7, fontFamily: 'Plus Jakarta Sans, sans-serif', margin: 0 }}>{substep.description}</p>
                                                            {'code' in substep && substep.code && (
                                                                <div className="d-code-block">
                                                                    <div className="d-code-label">KOPIEER DEZE CODE</div>
                                                                    {substep.code}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Next step hint */}
                                            {i < STEPS.length - 1 && (
                                                <button
                                                    onClick={() => setActiveStep(i + 1)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                                        background: `${STEPS[i + 1].color}12`,
                                                        border: `1px solid ${STEPS[i + 1].color}25`,
                                                        borderRadius: 12,
                                                        padding: '12px 24px',
                                                        color: STEPS[i + 1].color,
                                                        fontSize: 14, fontWeight: 700,
                                                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        marginTop: 8,
                                                    }}
                                                >
                                                    Ga verder naar stap {STEPS[i + 1].num}: {STEPS[i + 1].title} →
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── TIPS SECTION ───────────────────────────────────── */}
                <section style={{ padding: '0 28px 128px' }}>
                    <div style={{ maxWidth: 900, margin: '0 auto' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(149,191,71,0.08) 0%, rgba(13,24,41,0.6) 100%)',
                            border: '1px solid rgba(149,191,71,0.2)',
                            borderRadius: 24,
                            padding: '48px 40px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(149,191,71,0.15)', border: '1px solid rgba(149,191,71,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>💡</div>
                                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#F1F5F9', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Handige tips</h3>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
                                {[
                                    { title: 'Widget aanpassen', desc: 'Ga naar je Drapit dashboard om de kleur en tekst van de "Virtueel passen" knop te veranderen zodat het past bij je huisstijl.', icon: '🎨' },
                                    { title: 'Meerdere winkels', desc: 'Heb je meer dan één Shopify winkel? Maak per winkel een aparte API-sleutel aan in je dashboard, zo hou je alles netjes gescheiden.', icon: '🏪' },
                                    { title: 'Analytics bekijken', desc: 'In je Drapit dashboard kun je precies zien hoeveel keer de "Virtueel passen" functie is gebruikt en welke producten het populairst zijn.', icon: '📊' },
                                    { title: 'Hulp nodig?', desc: 'Loop je ergens vast? Stuur ons een mail op info@drapit.io of gebruik het contactformulier. We helpen je graag persoonlijk verder!', icon: '🤝' },
                                ].map((tip, i) => (
                                    <div key={i} style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: 16,
                                        padding: '20px',
                                    }}>
                                        <div style={{ fontSize: 24, marginBottom: 10 }}>{tip.icon}</div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 8 }}>{tip.title}</div>
                                        <p style={{ fontSize: 13, color: 'rgba(241,245,249,0.48)', lineHeight: 1.6, fontFamily: 'Plus Jakarta Sans, sans-serif', margin: 0 }}>{tip.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── FAQ ─────────────────────────────────────────────── */}
                <section id="faq" style={{ padding: '0 28px 128px' }}>
                    <div style={{ maxWidth: 740, margin: '0 auto' }}>
                        <div ref={faqSection.ref} style={{ textAlign: 'center', marginBottom: 60 }}>
                            <div className={`d-in d-d1 ${faqSection.inView ? 'visible' : ''}`} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#95BF47', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 18 }}>VEELGESTELDE VRAGEN</div>
                            <h2 className={`d-gradient-shopify d-in d-d2 ${faqSection.inView ? 'visible' : ''}`} style={{ fontSize: 'clamp(28px, 3.5vw, 46px)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.08 }}>
                                Heb je nog vragen?
                            </h2>
                        </div>
                        <div className={`d-in d-d3 ${faqSection.inView ? 'visible' : ''}`}>
                            {SHOPIFY_FAQS.map((faq, i) => (
                                <FAQItem key={i} q={faq.q} a={faq.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── FINAL CTA ─────────────────────────────────────── */}
                <section style={{ padding: '0 28px 120px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(149,191,71,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
                    <div ref={ctaSection.ref} style={{ maxWidth: 780, margin: '0 auto', position: 'relative' }}>
                        <div className={`d-in d-d1 ${ctaSection.inView ? 'visible' : ''}`} style={{ background: 'linear-gradient(135deg, rgba(13,24,41,0.92) 0%, rgba(6,9,15,0.97) 100%)', border: '1px solid rgba(149,191,71,0.18)', borderRadius: 28, padding: '68px 52px', textAlign: 'center', boxShadow: '0 40px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#95BF47', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 22 }}>KLAAR OM TE BEGINNEN?</div>
                            <h2 className="d-gradient-shopify" style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, letterSpacing: '-0.028em', lineHeight: 1.08, marginBottom: 20 }}>
                                Start vandaag nog met<br />virtueel passen op Shopify
                            </h2>
                            <p style={{ fontSize: 17, color: 'rgba(241,245,249,0.45)', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 36, maxWidth: 460, margin: '0 auto 36px' }}>
                                Gratis beginnen, geen creditcard nodig. Binnen 10 minuten live in je Shopify winkel.
                            </p>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Link href="/dashboard/login" className="d-btn-primary-shopify" style={{ padding: '16px 38px', fontSize: 16 }}>
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
