'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ContactForm from '@/components/ContactForm';

/* ─────────────────────────────────────────────────────────────────────────────
   /contact — Drapit Contact Page
   Aesthetic: Dark deep-space with cursor-reactive ambient glow
   Layout: Full-viewport hero → two-column info + form
───────────────────────────────────────────────────────────────────────────── */

/* ── Animated canvas starfield ─────────────────────────────────────────── */
function Starfield() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animId: number;
        let W = window.innerWidth;
        let H = window.innerHeight * 2.5;

        const resize = () => {
            W = window.innerWidth;
            H = document.body.scrollHeight;
            canvas.width = W;
            canvas.height = H;
        };
        resize();
        window.addEventListener('resize', resize);

        // Generate stars
        const STAR_COUNT = 220;
        const stars = Array.from({ length: STAR_COUNT }, () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 1.4 + 0.2,
            alpha: Math.random() * 0.7 + 0.1,
            speed: Math.random() * 0.15 + 0.02,
            twinkleOffset: Math.random() * Math.PI * 2,
        }));

        let t = 0;
        const draw = () => {
            ctx.clearRect(0, 0, W, H);
            t += 0.008;
            for (const s of stars) {
                const flicker = Math.sin(t * 1.3 + s.twinkleOffset) * 0.25 + 0.75;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(241,245,249,${s.alpha * flicker})`;
                ctx.fill();
            }
            animId = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0,
                opacity: 0.6,
            }}
        />
    );
}

/* ── Cursor-reactive glow ──────────────────────────────────────────────── */
function CursorGlow() {
    const glowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = glowRef.current;
        if (!el) return;
        const move = (e: MouseEvent) => {
            el.style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, rgba(29,111,216,0.10) 0%, transparent 70%)`;
        };
        window.addEventListener('mousemove', move);
        return () => window.removeEventListener('mousemove', move);
    }, []);

    return (
        <div
            ref={glowRef}
            style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 1,
                transition: 'background 0.1s ease',
            }}
        />
    );
}

/* ── Animated number counter ───────────────────────────────────────────── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
    const [val, setVal] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            obs.disconnect();
            let start = 0;
            const duration = 1200;
            const step = (ts: number) => {
                if (!start) start = ts;
                const prog = Math.min((ts - start) / duration, 1);
                const ease = 1 - Math.pow(1 - prog, 3);
                setVal(Math.round(ease * to));
                if (prog < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        }, { threshold: 0.5 });
        obs.observe(el);
        return () => obs.disconnect();
    }, [to]);

    return <span ref={ref}>{val}{suffix}</span>;
}

/* ── Contact channel card ──────────────────────────────────────────────── */
function ChannelCard({
    icon, label, value, href, delay,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    href?: string;
    delay: number;
}) {
    const [hover, setHover] = useState(false);
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.2 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    const content = (
        <div
            ref={ref}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '18px 22px',
                background: hover
                    ? 'rgba(29,111,216,0.08)'
                    : 'rgba(255,255,255,0.03)',
                border: `1px solid ${hover ? 'rgba(29,111,216,0.35)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 14,
                cursor: href ? 'pointer' : 'default',
                transition: 'all 0.25s ease',
                transform: visible
                    ? `translateX(0) scale(${hover ? 1.015 : 1})`
                    : 'translateX(-24px)',
                opacity: visible ? 1 : 0,
                transitionDelay: `${delay}ms`,
                boxShadow: hover ? '0 0 24px rgba(29,111,216,0.12), inset 0 1px 0 rgba(255,255,255,0.04)' : 'none',
                textDecoration: 'none',
            }}
        >
            <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: hover ? 'rgba(29,111,216,0.20)' : 'rgba(29,111,216,0.10)',
                border: '1px solid rgba(29,111,216,0.20)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.25s ease',
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(148,163,184,0.7)', textTransform: 'uppercase', marginBottom: 3, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {label}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: hover ? '#F1F5F9' : 'rgba(241,245,249,0.80)', fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'color 0.2s' }}>
                    {value}
                </div>
            </div>
        </div>
    );

    return href ? <a href={href} style={{ textDecoration: 'none' }}>{content}</a> : content;
}

/* ── Stat pill ─────────────────────────────────────────────────────────── */
function StatPill({ num, suffix, label, delay }: { num: number; suffix: string; label: string; delay: number }) {
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.3 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <div ref={ref} style={{
            textAlign: 'center',
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            opacity: visible ? 1 : 0,
            transition: `all 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        }}>
            <div style={{ fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 800, fontFamily: 'Plus Jakarta Sans, sans-serif', background: 'linear-gradient(135deg, #F1F5F9, rgba(29,111,216,0.8))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1, marginBottom: 6 }}>
                <Counter to={num} suffix={suffix} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(148,163,184,0.65)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.04em' }}>
                {label}
            </div>
        </div>
    );
}

/* ── Main page ─────────────────────────────────────────────────────────── */
export default function ContactPage() {
    const [heroVisible, setHeroVisible] = useState(false);
    const heroRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => setHeroVisible(true), 80);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #030812 0%, #060C1A 40%, #040A16 100%)',
            color: '#F1F5F9',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            overflowX: 'hidden',
            position: 'relative',
        }}>
            <Starfield />
            <CursorGlow />

            {/* Ambient blobs */}
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '55vw', height: '55vw', background: 'radial-gradient(circle, rgba(29,111,216,0.07) 0%, transparent 65%)', borderRadius: '50%', filter: 'blur(40px)' }} />
                <div style={{ position: 'absolute', bottom: '20%', right: '-10%', width: '45vw', height: '45vw', background: 'radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 65%)', borderRadius: '50%', filter: 'blur(50px)' }} />
            </div>

            {/* ── NAV ─────────────────────────────────────────────────── */}
            <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', background: 'rgba(3,8,18,0.70)' }}>
                <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px', color: '#F1F5F9' }}>drapit</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(148,163,184,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>virtual try-on</span>
                </Link>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Link href="/" style={{ fontSize: 14, color: 'rgba(148,163,184,0.70)', textDecoration: 'none', padding: '8px 14px', borderRadius: 8, transition: 'color 0.2s' }}>
                        ← Terug
                    </Link>
                    <Link href="/dashboard" style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9', textDecoration: 'none', padding: '9px 20px', background: 'rgba(29,111,216,0.18)', border: '1px solid rgba(29,111,216,0.30)', borderRadius: 10, transition: 'all 0.2s' }}>
                        Dashboard →
                    </Link>
                </div>
            </nav>

            {/* ── HERO ────────────────────────────────────────────────── */}
            <section ref={heroRef} style={{ position: 'relative', zIndex: 2, paddingTop: 160, paddingBottom: 100, paddingLeft: 28, paddingRight: 28, textAlign: 'center' }}>

                {/* Decorative horizontal line above label */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 16,
                    marginBottom: 28,
                    transform: heroVisible ? 'translateY(0)' : 'translateY(16px)',
                    opacity: heroVisible ? 1 : 0,
                    transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0ms',
                }}>
                    <div style={{ width: 40, height: 1, background: 'linear-gradient(90deg, transparent, rgba(29,111,216,0.6))' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', color: '#1D6FD8', textTransform: 'uppercase' }}>Contact</span>
                    <div style={{ width: 40, height: 1, background: 'linear-gradient(90deg, rgba(29,111,216,0.6), transparent)' }} />
                </div>

                {/* Headline */}
                <h1 style={{
                    fontSize: 'clamp(40px, 6vw, 80px)',
                    fontWeight: 900,
                    letterSpacing: '-0.035em',
                    lineHeight: 1.0,
                    margin: '0 auto 24px',
                    maxWidth: 700,
                    transform: heroVisible ? 'translateY(0)' : 'translateY(24px)',
                    opacity: heroVisible ? 1 : 0,
                    transition: 'all 0.7s cubic-bezier(0.22, 1, 0.36, 1) 80ms',
                }}>
                    <span style={{ background: 'linear-gradient(135deg, #F1F5F9 0%, rgba(241,245,249,0.6) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Laten we
                    </span>
                    {' '}
                    <span style={{ background: 'linear-gradient(135deg, #1D6FD8 0%, #22D3EE 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        praten
                    </span>
                </h1>

                {/* Sub */}
                <p style={{
                    fontSize: 'clamp(15px, 1.5vw, 18px)',
                    color: 'rgba(148,163,184,0.75)',
                    maxWidth: 480,
                    margin: '0 auto 56px',
                    lineHeight: 1.7,
                    transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
                    opacity: heroVisible ? 1 : 0,
                    transition: 'all 0.7s cubic-bezier(0.22, 1, 0.36, 1) 160ms',
                }}>
                    Heb je vragen over Drapit, wil je een demo of een samenwerking? Wij reageren altijd binnen één werkdag.
                </p>

                {/* Stats bar */}
                <div style={{
                    display: 'inline-flex',
                    gap: 48,
                    padding: '24px 48px',
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 20,
                    backdropFilter: 'blur(16px)',
                    transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
                    opacity: heroVisible ? 1 : 0,
                    transition: 'all 0.7s cubic-bezier(0.22, 1, 0.36, 1) 240ms',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    rowGap: 24,
                }}>
                    <StatPill num={1} suffix=" werkdag" label="Reactietijd" delay={400} />
                    <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', alignSelf: 'stretch' }} />
                    <StatPill num={500} suffix="+" label="Actieve merchants" delay={500} />
                    <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', alignSelf: 'stretch' }} />
                    <StatPill num={98} suffix="%" label="Tevredenheid" delay={600} />
                </div>
            </section>

            {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
            <section style={{ position: 'relative', zIndex: 2, padding: '0 28px 120px', maxWidth: 1160, margin: '0 auto' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 48,
                    alignItems: 'start',
                }}>

                    {/* ── Left: info ───────────────────────────────────── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                        {/* Section label */}
                        <div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: '#F1F5F9', marginBottom: 10 }}>
                                Hoe kunnen we helpen?
                            </div>
                            <p style={{ fontSize: 15, color: 'rgba(148,163,184,0.65)', lineHeight: 1.7, margin: 0 }}>
                                Of je nu een technische vraag hebt, een demo wil boeken of gewoon nieuwsgierig bent — vul het formulier in en we komen bij je terug.
                            </p>
                        </div>

                        {/* Channel cards */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <ChannelCard
                                delay={0}
                                href="mailto:info@drapit.io"
                                label="E-mail"
                                value="info@drapit.io"
                                icon={
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D6FD8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                }
                            />
                            <ChannelCard
                                delay={80}
                                label="Reactietijd"
                                value="Binnen 1 werkdag"
                                icon={
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D6FD8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                    </svg>
                                }
                            />
                            <ChannelCard
                                delay={160}
                                label="Shopify App Store"
                                value="Drapit – Virtual Try-On"
                                href="https://apps.shopify.com"
                                icon={
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D6FD8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
                                    </svg>
                                }
                            />
                        </div>

                        {/* Divider */}
                        <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(29,111,216,0.25), rgba(255,255,255,0.04), transparent)' }} />

                        {/* FAQ teaser */}
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(148,163,184,0.5)', textTransform: 'uppercase', marginBottom: 14 }}>
                                Veelgestelde vragen
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {[
                                    { q: 'Werkt Drapit met mijn Shopify theme?', a: 'Ja — onze widget werkt met elk Shopify 2.0 theme.' },
                                    { q: 'Hoe lang duurt de installatie?', a: 'Minder dan 10 minuten via de Shopify App Store.' },
                                    { q: 'Kan ik Drapit gratis proberen?', a: 'Ja, start gratis met 20 try-ons per maand.' },
                                ].map((item, i) => (
                                    <FAQTeaser key={i} q={item.q} a={item.a} delay={i * 80} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Right: form ──────────────────────────────────── */}
                    <div style={{ position: 'sticky', top: 100 }}>
                        {/* Glow halo behind card */}
                        <div style={{ position: 'absolute', inset: -40, background: 'radial-gradient(ellipse at center, rgba(29,111,216,0.10) 0%, transparent 70%)', pointerEvents: 'none', zIndex: -1 }} />

                        <div style={{
                            background: 'linear-gradient(145deg, rgba(13,24,41,0.94) 0%, rgba(4,8,16,0.98) 100%)',
                            border: '1px solid rgba(29,111,216,0.18)',
                            borderRadius: 24,
                            padding: '40px 36px',
                            boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03) inset, 0 1px 0 rgba(255,255,255,0.06) inset',
                            backdropFilter: 'blur(24px)',
                            position: 'relative',
                            overflow: 'hidden',
                        }}>
                            {/* Top shimmer line */}
                            <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(29,111,216,0.5), rgba(34,211,238,0.3), transparent)' }} />

                            {/* Corner accent */}
                            <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, background: 'radial-gradient(circle at top right, rgba(29,111,216,0.12), transparent 70%)', pointerEvents: 'none' }} />

                            {/* Header */}
                            <div style={{ marginBottom: 28 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#1D6FD8', textTransform: 'uppercase', marginBottom: 8 }}>
                                    Stuur een bericht
                                </div>
                                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#F1F5F9', margin: 0, letterSpacing: '-0.02em' }}>
                                    We horen graag van je
                                </h2>
                            </div>

                            {/* Status indicator */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, padding: '10px 14px', background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.18)', borderRadius: 10 }}>
                                <div style={{ position: 'relative', width: 8, height: 8 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', position: 'absolute' }} />
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', position: 'absolute', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                                </div>
                                <span style={{ fontSize: 13, color: 'rgba(74,222,128,0.85)', fontWeight: 500 }}>
                                    We zijn bereikbaar — reactie binnen 1 werkdag
                                </span>
                            </div>

                            <ContactForm />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FOOTER STRIP ─────────────────────────────────────────── */}
            <div style={{ position: 'relative', zIndex: 2, borderTop: '1px solid rgba(255,255,255,0.05)', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <Link href="/" style={{ textDecoration: 'none' }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: 'rgba(241,245,249,0.45)', letterSpacing: '-0.3px' }}>drapit</span>
                </Link>
                <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.35)', margin: 0, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    © 2026 Drapit — Virtual Try-On for Shopify
                </p>
                <div style={{ display: 'flex', gap: 20 }}>
                    {['Privacy', 'Terms', 'Docs'].map(l => (
                        <Link key={l} href={`/${l.toLowerCase()}`} style={{ fontSize: 13, color: 'rgba(148,163,184,0.40)', textDecoration: 'none' }}>
                            {l}
                        </Link>
                    ))}
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

                @keyframes ping {
                    75%, 100% { transform: scale(2); opacity: 0; }
                }

                * { box-sizing: border-box; }

                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: #030812; }
                ::-webkit-scrollbar-thumb { background: rgba(29,111,216,0.3); border-radius: 3px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(29,111,216,0.5); }
            `}</style>
        </div>
    );
}

/* ── FAQ teaser item ───────────────────────────────────────────────────── */
function FAQTeaser({ q, a, delay }: { q: string; a: string; delay: number }) {
    const [open, setOpen] = useState(false);
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.2 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            onClick={() => setOpen(v => !v)}
            style={{
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12,
                cursor: 'pointer',
                transition: `all 0.3s ease ${delay}ms`,
                transform: visible ? 'translateX(0)' : 'translateX(-16px)',
                opacity: visible ? 1 : 0,
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(241,245,249,0.80)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{q}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,0.5)" strokeWidth="2.5" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }}>
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </div>
            {open && (
                <p style={{ margin: '10px 0 0', fontSize: 13, color: 'rgba(148,163,184,0.65)', fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1.6 }}>{a}</p>
            )}
        </div>
    );
}
