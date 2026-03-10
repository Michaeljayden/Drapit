'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

/* ─────────────────────────────────────────────────────────────────────────────
   DRAPIT LICENSE — Enterprise Landing Page
   Aesthetic: Dark luxury-tech. Elevated above standard plans.
   Gold accents layered over Drapit's signature deep-navy + electric-blue.
   Font: Plus Jakarta Sans (matches rest of drapit.io)
───────────────────────────────────────────────────────────────────────────── */

/* ── Starfield canvas (reused pattern from /contact) ──────────────────── */
function Starfield() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let animId: number;
        let W = window.innerWidth;
        let H = window.innerHeight * 3;
        const resize = () => { W = window.innerWidth; H = document.body.scrollHeight; canvas.width = W; canvas.height = H; };
        resize();
        window.addEventListener('resize', resize);
        const STAR_COUNT = 180;
        const stars = Array.from({ length: STAR_COUNT }, () => ({
            x: Math.random() * W, y: Math.random() * H,
            r: Math.random() * 1.2 + 0.15,
            alpha: Math.random() * 0.5 + 0.08,
            twinkleOffset: Math.random() * Math.PI * 2,
        }));
        let t = 0;
        const draw = () => {
            ctx.clearRect(0, 0, W, H);
            t += 0.006;
            stars.forEach(s => {
                const a = s.alpha * (0.6 + 0.4 * Math.sin(t + s.twinkleOffset));
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(201,180,140,${a})`;
                ctx.fill();
            });
            animId = requestAnimationFrame(draw);
        };
        draw();
        return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
    }, []);
    return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }} />;
}

/* ── useReveal: fade-up on scroll ─────────────────────────────────────── */
function useReveal(delay = 0) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.12 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return { ref, style: { transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(28px)' } };
}

/* ── FeatureCard ──────────────────────────────────────────────────────── */
function FeatureCard({ num, icon, title, desc, tag, tagColor, delay }: {
    num: string; icon: string; title: string; desc: string; tag: string; tagColor: string; delay: number;
}) {
    const { ref, style } = useReveal(delay);
    const [hovered, setHovered] = useState(false);
    return (
        <div
            ref={ref}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                ...style,
                background: hovered ? 'rgba(29,111,216,0.04)' : 'rgba(255,255,255,0.015)',
                border: `1px solid ${hovered ? 'rgba(29,111,216,0.22)' : 'rgba(255,255,255,0.07)'}`,
                padding: '44px 36px',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* top shimmer on hover */}
            {hovered && <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(29,111,216,0.6), transparent)' }} />}
            <div style={{ position: 'absolute', top: 16, right: 24, fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 52, fontWeight: 800, color: 'rgba(29,111,216,0.06)', lineHeight: 1 }}>{num}</div>
            <div style={{ fontSize: 26, marginBottom: 24, lineHeight: 1 }}>{icon}</div>
            <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 15, fontWeight: 700, color: '#F1F5F9', marginBottom: 10, letterSpacing: '-0.01em' }}>{title}</div>
            <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, color: 'rgba(148,163,184,0.7)', lineHeight: 1.75 }}>{desc}</div>
            <div style={{ display: 'inline-block', marginTop: 20, fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '4px 10px', background: tagColor.includes('gold') ? 'rgba(201,166,106,0.1)' : 'rgba(29,111,216,0.1)', color: tagColor.includes('gold') ? '#C9A66A' : '#4A8AF4' }}>{tag}</div>
        </div>
    );
}

/* ── ForCard ──────────────────────────────────────────────────────────── */
function ForCard({ icon, title, desc, delay }: { icon: string; title: string; desc: string; delay: number }) {
    const { ref, style } = useReveal(delay);
    const [hov, setHov] = useState(false);
    return (
        <div ref={ref} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ ...style, background: hov ? 'rgba(29,111,216,0.04)' : 'rgba(255,255,255,0.015)', border: `1px solid ${hov ? 'rgba(29,111,216,0.22)' : 'rgba(255,255,255,0.06)'}`, padding: '32px 28px', transition: `${style.transition}, background 0.3s, border-color 0.3s`, position: 'relative', overflow: 'hidden' }}>
            {hov && <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(29,111,216,0.5), transparent)' }} />}
            <div style={{ fontSize: 22, marginBottom: 14 }}>{icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#F1F5F9', marginBottom: 6 }}>{title}</div>
            <div style={{ fontSize: 13, color: 'rgba(148,163,184,0.6)', lineHeight: 1.65 }}>{desc}</div>
        </div>
    );
}

/* ── SupportCard ──────────────────────────────────────────────────────── */
function SupportCard({ icon, title, desc, delay }: { icon: string; title: string; desc: string; delay: number }) {
    const { ref, style } = useReveal(delay);
    const [hovered, setHovered] = useState(false);
    return (
        <div ref={ref} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ ...style, padding: '40px 32px', border: `1px solid ${hovered ? 'rgba(201,166,106,0.25)' : 'rgba(255,255,255,0.06)'}`, background: hovered ? 'rgba(201,166,106,0.025)' : 'rgba(255,255,255,0.012)', transition: `${style.transition}, border-color 0.3s, background 0.3s` }}>
            <div style={{ fontSize: 28, marginBottom: 20 }}>{icon}</div>
            <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 15, fontWeight: 700, color: '#F1F5F9', marginBottom: 8 }}>{title}</div>
            <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13.5, color: 'rgba(148,163,184,0.65)', lineHeight: 1.75 }}>{desc}</div>
        </div>
    );
}

/* ── StatItem ─────────────────────────────────────────────────────────── */
function StatItem({ value, accent, label, delay }: { value: string; accent: string; label: string; delay: number }) {
    const { ref, style } = useReveal(delay);
    return (
        <div ref={ref} style={{ ...style, padding: '48px 40px', borderRight: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 52, fontWeight: 800, color: '#F1F5F9', lineHeight: 1, marginBottom: 8, letterSpacing: '-0.04em' }}>
                {value}<span style={{ color: '#4A8AF4' }}>{accent}</span>
            </div>
            <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.55)' }}>{label}</div>
        </div>
    );
}

/* ── Main Page ────────────────────────────────────────────────────────── */
export default function LicensePage() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [formState, setFormState] = useState<'idle' | 'sent'>('idle');
    const [formData, setFormData] = useState({ company: '', website: '', name: '', title: '', email: '', visitors: '', platform: '', message: '' });

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormState('sent');
        setTimeout(() => { setFormState('idle'); setFormData({ company: '', website: '', name: '', title: '', email: '', visitors: '', platform: '', message: '' }); }, 4000);
    };

    const inp = (field: keyof typeof formData) => ({
        value: formData[field],
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setFormData(p => ({ ...p, [field]: e.target.value })),
    });

    /* Hero reveal */
    const heroTag = useReveal(200);
    const heroH1 = useReveal(400);
    const heroSub = useReveal(600);
    const heroCta = useReveal(800);

    return (
        <div style={{ background: '#04060F', minHeight: '100vh', overflow: 'hidden', fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#F1F5F9', position: 'relative' }}>

            {/* Starfield */}
            <Starfield />

            {/* ── NAV ──────────────────────────────────────────────── */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
                background: scrolled ? 'rgba(4,6,15,0.92)' : 'transparent',
                backdropFilter: scrolled ? 'blur(24px) saturate(1.4)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(201,166,106,0.1)' : 'none',
                transition: 'all 0.4s ease',
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                    {/* Logo */}
                    <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
                            <path d="M9.5 3.5C9.5 2.67 8.83 2 8 2S6.5 2.67 6.5 3.5" stroke="#1D6FD8" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M8 5L2.5 10.5C2.18 10.77 2 11.15 2 11.56C2 12.35 2.65 13 3.44 13H12.56C13.35 13 14 12.35 14 11.56C14 11.15 13.82 10.77 13.5 10.5L8 5Z" stroke="#1D6FD8" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                        <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 20, color: '#F1F5F9', letterSpacing: '-0.015em' }}>drapit</span>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#C9A66A', border: '1px solid rgba(201,166,106,0.35)', padding: '3px 8px', borderRadius: 2 }}>License</span>
                    </Link>

                    {/* Desktop links */}
                    <div className="ln-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {[
                            ['/shopify', 'Shopify'],
                            ['/studio', 'Studio'],
                            ['/license', 'License'],
                            ['/contact', 'Contact'],
                        ].map(([href, label]) => (
                            <Link key={label} href={href} className="ln-nav-link">{label}</Link>
                        ))}
                        <Link href="/dashboard/login" className="ln-nav-link" style={{ marginLeft: 8, padding: '9px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }}>
                            Inloggen
                        </Link>
                        <Link href="#contact"
                            onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}
                            style={{ marginLeft: 4, padding: '9px 20px', fontSize: 14, fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif', background: 'linear-gradient(135deg, #C9A66A 0%, #A8845A 100%)', color: '#04060F', borderRadius: 10, textDecoration: 'none', letterSpacing: '0.01em', transition: 'opacity 0.2s' }}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                        >
                            Contact Sales →
                        </Link>
                    </div>

                    {/* Mobile hamburger */}
                    <div className="ln-nav-mobile" style={{ display: 'none', alignItems: 'center', gap: 8 }}>
                        <Link href="#contact"
                            onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }}
                            style={{ padding: '8px 14px', fontSize: 12, fontWeight: 700, background: 'linear-gradient(135deg, #C9A66A 0%, #A8845A 100%)', color: '#04060F', borderRadius: 8, textDecoration: 'none' }}
                        >
                            Contact Sales
                        </Link>
                        <button
                            className={`ln-hamburger ${mobileMenuOpen ? 'open' : ''}`}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Menu openen"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex', flexDirection: 'column', gap: 5 }}
                        >
                            <span style={{ display: 'block', width: 22, height: 2, background: '#F1F5F9', transition: 'all 0.3s', transformOrigin: 'center', transform: mobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
                            <span style={{ display: 'block', width: 22, height: 2, background: '#F1F5F9', transition: 'all 0.3s', opacity: mobileMenuOpen ? 0 : 1 }} />
                            <span style={{ display: 'block', width: 22, height: 2, background: '#F1F5F9', transition: 'all 0.3s', transformOrigin: 'center', transform: mobileMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile overlay */}
            {mobileMenuOpen && (
                <div onClick={() => setMobileMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(4,6,15,0.6)', zIndex: 298, backdropFilter: 'blur(4px)' }} />
            )}

            {/* Mobile drawer */}
            <div style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, width: 280, zIndex: 299,
                background: '#07090F', borderLeft: '1px solid rgba(201,166,106,0.12)',
                transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex', flexDirection: 'column', padding: '24px 20px',
            }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
                    <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F1F5F9', fontSize: 22 }}>✕</button>
                </div>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    {[
                        ['/shopify', 'Shopify'],
                        ['/studio', 'Studio'],
                        ['/license', 'License'],
                        ['/contact', 'Contact'],
                    ].map(([href, label]) => (
                        <Link key={label} href={href} onClick={() => setMobileMenuOpen(false)}
                            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 15, fontWeight: 600, color: 'rgba(241,245,249,0.8)', padding: '12px 16px', borderRadius: 8, textDecoration: 'none', transition: 'background 0.2s, color 0.2s' }}
                        >{label}</Link>
                    ))}
                    <div style={{ height: 1, background: 'rgba(201,166,106,0.12)', margin: '12px 0' }} />
                    <Link href="/dashboard/login" onClick={() => setMobileMenuOpen(false)}
                        style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 15, fontWeight: 600, color: 'rgba(241,245,249,0.8)', padding: '12px 16px', borderRadius: 8, textDecoration: 'none' }}
                    >Inloggen</Link>
                </nav>
                <Link href="#contact"
                    onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }}
                    style={{ display: 'block', textAlign: 'center', padding: '14px 0', fontSize: 15, fontWeight: 700, background: 'linear-gradient(135deg, #C9A66A 0%, #A8845A 100%)', color: '#04060F', borderRadius: 10, textDecoration: 'none' }}
                >
                    Contact Sales →
                </Link>
            </div>

            {/* ── HERO ─────────────────────────────────────────────── */}
            <section style={{
                position: 'relative',
                zIndex: 2,
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '120px 24px 100px',
                '@media (min-width: 768px)': {
                    justifyContent: 'flex-end',
                    padding: '70px 56px 100px',
                }
            } as any}>

                {/* Ambient glows */}
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 55% at 55% 40%, rgba(29,111,216,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 40% 35% at 15% 75%, rgba(201,166,106,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} />
                {/* Grid */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(29,111,216,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(29,111,216,0.035) 1px, transparent 1px)', backgroundSize: '80px 80px', maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 0%, transparent 80%)', pointerEvents: 'none' }} />

                {/* Tag */}
                <div {...heroTag} style={{ ...heroTag.style, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                    <div style={{ width: 40, height: 1, background: '#C9A66A' }} />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C9A66A' }}>Drapit License — Enterprise</span>
                </div>

                {/* H1 */}
                <h1 {...heroH1} style={{ ...heroH1.style, fontSize: 'clamp(3.2rem, 8vw, 7rem)', fontWeight: 800, lineHeight: 0.95, letterSpacing: '-0.04em', maxWidth: 860, margin: 0 }}>
                    Built for fashion&apos;s<br />
                    most <span style={{ color: '#4A8AF4', fontStyle: 'italic', fontWeight: 300 }}>ambitious</span><br />
                    <span style={{ color: '#C9A66A' }}>platforms.</span>
                </h1>

                {/* Sub */}
                <p {...heroSub} style={{ ...heroSub.style, fontSize: 16, color: 'rgba(148,163,184,0.7)', lineHeight: 1.8, maxWidth: 480, marginTop: 32 }}>
                    A bespoke licensing agreement for enterprise fashion platforms that demand more than a widget — API-first infrastructure, white-label output, and a dedicated team behind every pixel.
                </p>

                {/* CTAs */}
                <div {...heroCta} style={{ ...heroCta.style, display: 'flex', alignItems: 'center', gap: 16, marginTop: 48, flexWrap: 'wrap' }}>
                    <button
                        onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                        style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff', background: 'linear-gradient(135deg, #1D6FD8, #1558B0)', border: 'none', padding: '16px 36px', cursor: 'pointer', width: '100%', maxWidth: 'max-content' } as any}
                        onMouseEnter={e => { (e.target as HTMLElement).style.boxShadow = '0 12px 40px rgba(29,111,216,0.45)'; (e.target as HTMLElement).style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { (e.target as HTMLElement).style.boxShadow = 'none'; (e.target as HTMLElement).style.transform = 'none'; }}
                    >
                        Contact Sales →
                    </button>
                    <button
                        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                        style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.6)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 } as any}
                        onMouseEnter={e => { (e.currentTarget).style.color = '#F1F5F9'; }}
                        onMouseLeave={e => { (e.currentTarget).style.color = 'rgba(148,163,184,0.6)'; }}
                    >
                        Explore capabilities
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                </div>

                {/* Right side — designed for - Hidden on mobile */}
                <div style={{
                    position: 'absolute',
                    right: 56,
                    bottom: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: 10,
                    '@media (max-width: 1024px)': { display: 'none' }
                } as any}>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.4)' }}>Designed for</span>
                    {['Fashion Platforms', 'Luxury Houses', 'Multibrand Retailers', 'Global Marketplaces'].map((name, i) => (
                        <span key={name} style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 15, fontWeight: 300, color: `rgba(241,245,249,${0.18 + i * 0.06})`, letterSpacing: '0.04em', fontStyle: 'italic' }}>{name}</span>
                    ))}
                </div>

                {/* Scroll indicator */}
                <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: 0.4 }}>
                    <span style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.6)' }}>Scroll</span>
                    <div style={{ width: 1, height: 50, background: 'linear-gradient(#4A8AF4, transparent)' }} />
                </div>
            </section>

            {/* ── FOR WHO ───────────────────────────────────────────── */}
            <section style={{
                position: 'relative',
                zIndex: 2,
                padding: '80px 24px',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr)',
                gap: 48,
                alignItems: 'center',
                '@media (min-width: 1024px)': {
                    padding: '140px 56px',
                    gridTemplateColumns: '1fr 1.15fr',
                    gap: 100,
                }
            } as any}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                        <div style={{ width: 28, height: 1, background: '#C9A66A' }} />
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A66A' }}>Who it&apos;s for</span>
                    </div>
                    <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 3.5rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 24 }}>
                        Not for everyone.<br />
                        <span style={{ fontStyle: 'italic', fontWeight: 300, color: '#4A8AF4' }}>Built for the best.</span>
                    </h2>
                    <p style={{ fontSize: 15, color: 'rgba(148,163,184,0.65)', lineHeight: 1.85, maxWidth: 420 }}>
                        Drapit License is not a subscription plan. It&apos;s a partnership engineered for the scale, complexity, and brand integrity demands of the world&apos;s leading fashion companies.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(1, 1fr)',
                    gap: 2,
                    '@media (min-width: 640px)': {
                        gridTemplateColumns: 'repeat(2, 1fr)',
                    }
                } as any}>
                    <ForCard icon="🏬" title="Fashion Platforms" desc="Large-scale multi-brand platforms with millions of monthly visitors and complex technical infrastructure." delay={0} />
                    <ForCard icon="✦" title="Luxury Houses" desc="Heritage brands where every customer touchpoint must reflect the highest standards of quality." delay={100} />
                    <ForCard icon="🌐" title="Global Marketplaces" desc="Cross-border commerce operating across multiple regions, languages, and regulatory environments." delay={200} />
                    <ForCard icon="⚙️" title="Own Platform Tech" desc="Companies running proprietary infrastructure who need direct API access rather than plugin solutions." delay={300} />
                </div>
            </section>

            {/* ── DIVIDER ───────────────────────────────────────────── */}
            <div style={{ margin: '0 56px', height: 1, background: 'linear-gradient(90deg, transparent 5%, rgba(29,111,216,0.15) 30%, rgba(201,166,106,0.2) 50%, rgba(29,111,216,0.15) 70%, transparent 95%)' }} />

            {/* ── FEATURES ─────────────────────────────────────────── */}
            <section id="features" style={{ position: 'relative', zIndex: 2, padding: '140px 56px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    marginBottom: 72,
                    flexWrap: 'wrap',
                    gap: 24,
                    textAlign: 'left',
                } as any}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                            <div style={{ width: 28, height: 1, background: '#C9A66A' }} />
                            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A66A' }}>Capabilities</span>
                        </div>
                        <h2 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 3rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', maxWidth: 480 }}>
                            Every feature,<br />
                            <span style={{ fontStyle: 'italic', fontWeight: 300, color: '#4A8AF4' }}>engineered</span> for scale.
                        </h2>
                    </div>
                    <p style={{
                        fontSize: 14,
                        color: 'rgba(148,163,184,0.55)',
                        lineHeight: 1.75,
                        maxWidth: 280,
                        textAlign: 'left',
                        '@media (min-width: 1024px)': {
                            textAlign: 'right',
                        }
                    } as any}>
                        All capabilities included in the license. Custom development available on request through your dedicated engineer.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(1, 1fr)',
                    gap: 2,
                    '@media (min-width: 640px)': {
                        gridTemplateColumns: 'repeat(2, 1fr)',
                    },
                    '@media (min-width: 1024px)': {
                        gridTemplateColumns: 'repeat(3, 1fr)',
                    }
                } as any}>
                    <FeatureCard num="01" icon="🔗" title="Direct API Integration" desc="Platform-agnostic REST API that integrates into any existing stack. No Shopify required. Full documentation and a dedicated engineer from day one." tag="Core" tagColor="blue" delay={0} />
                    <FeatureCard num="02" icon="🏷" title="White-Label Output" desc="Every VTON-generated image carries your brand — logo placement, article number, and overlay elements you require. Invisible infrastructure, visible brand." tag="Branding" tagColor="gold" delay={80} />
                    <FeatureCard num="03" icon="🗂" title="Saved Looks" desc="Shoppers save their virtual try-ons to their account or wishlist and return later. Dramatically increases intent-to-purchase rates." tag="Core" tagColor="blue" delay={160} />
                    <FeatureCard num="04" icon="🧠" title="Custom AI Model" desc="Optional fine-tuned model trained on your product catalog, models, and brand aesthetic. Higher accuracy, faster generation, better results." tag="Add-on" tagColor="gold" delay={240} />
                    <FeatureCard num="05" icon="📊" title="Analytics Dashboard" desc="Real-time insights into VTON adoption, conversion lift per product, try-on frequency, and user engagement. Data you can act on." tag="Analytics" tagColor="blue" delay={320} />
                    <FeatureCard num="06" icon="📦" title="Bulk Garment Upload" desc="Ingest thousands of products automatically via API. Batch-process your entire catalog with webhooks for real-time status updates." tag="Infrastructure" tagColor="blue" delay={400} />
                </div>
            </section>

            {/* ── STATS BAND ───────────────────────────────────────── */}
            <div style={{
                position: 'relative',
                zIndex: 2,
                background: 'linear-gradient(135deg, rgba(29,111,216,0.04), rgba(201,166,106,0.025))',
                borderTop: '1px solid rgba(255,255,255,0.055)',
                borderBottom: '1px solid rgba(255,255,255,0.055)',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                '@media (min-width: 768px)': {
                    gridTemplateColumns: 'repeat(4, 1fr)',
                }
            } as any}>
                <StatItem value="99" accent=".9%" label="Guaranteed Uptime SLA" delay={0} />
                <StatItem value="<" accent="4h" label="Priority Response Time" delay={100} />
                <StatItem value="24" accent="/7" label="Human + AI Support" delay={200} />
                <div style={{ padding: '48px 40px', textAlign: 'center' }}>
                    <div style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, color: '#F1F5F9', lineHeight: 1, marginBottom: 8, letterSpacing: '-0.04em' }}>
                        EU<span style={{ color: '#C9A66A' }}> ✓</span>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.55)' }}>Data Residency Guaranteed</div>
                </div>
            </div>

            {/* ── PRIVACY & DATA ────────────────────────────────────── */}
            <section style={{
                position: 'relative',
                zIndex: 2,
                padding: '80px 24px',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr)',
                gap: 64,
                alignItems: 'center',
                '@media (min-width: 1024px)': {
                    padding: '140px 56px',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 100,
                }
            } as any}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                        <div style={{ width: 28, height: 1, background: '#C9A66A' }} />
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A66A' }}>Data & Compliance</span>
                    </div>
                    <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 3.2rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 24 }}>
                        Enterprise-grade<br />
                        <span style={{ fontStyle: 'italic', fontWeight: 300, color: '#4A8AF4' }}>trust</span> by default.
                    </h2>
                    <p style={{ fontSize: 15, color: 'rgba(148,163,184,0.65)', lineHeight: 1.8, marginBottom: 32 }}>
                        Built for the regulatory and security standards demanded by major EU platforms and luxury houses. Your data is isolated, protected, and never shared.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {[
                            { dot: '#4A8AF4', text: 'Fully isolated infrastructure — no data mixing with other clients' },
                            { dot: '#4A8AF4', text: 'GDPR Data Processing Agreement (DPA) included as standard' },
                            { dot: '#4A8AF4', text: 'EU data residency — your data stays in Europe' },
                            { dot: '#4A8AF4', text: 'User images not stored after session (unless Saved Looks is active)' },
                            { dot: '#C9A66A', text: 'Private cloud deployment available for the largest contracts' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 14, color: 'rgba(148,163,184,0.7)' }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.dot, flexShrink: 0, marginTop: 7 }} />
                                {item.text}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Privacy status card */}
                <div>
                    <div style={{ background: 'linear-gradient(145deg, rgba(13,24,41,0.94), rgba(4,8,16,0.98))', border: '1px solid rgba(29,111,216,0.2)', padding: '40px 36px', position: 'relative', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
                        <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(29,111,216,0.5), transparent)' }} />
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#4A8AF4', marginBottom: 24 }}>Infrastructure Status</div>
                        {[
                            { label: 'Data Isolation', val: 'Dedicated', dot: '#4ade80' },
                            { label: 'Data Region', val: 'EU (Frankfurt)', dot: '#4A8AF4' },
                            { label: 'GDPR DPA', val: 'Signed', dot: '#4ade80' },
                            { label: 'Image Retention', val: 'Session-only', dot: '#4ade80' },
                            { label: 'Uptime SLA', val: '99.9% Guaranteed', dot: '#4ade80' },
                            { label: 'Encryption', val: 'AES-256 / TLS 1.3', dot: '#4ade80' },
                        ].map((row, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                <span style={{ fontSize: 13, color: 'rgba(148,163,184,0.55)' }}>{row.label}</span>
                                <span style={{ fontSize: 13, color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: row.dot, display: 'inline-block' }} />
                                    {row.val}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 2, background: 'rgba(201,166,106,0.04)', border: '1px solid rgba(201,166,106,0.18)', padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ fontSize: 28 }}>🛡</span>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C9A66A' }}>Enterprise Ready</div>
                            <div style={{ fontSize: 12, color: 'rgba(148,163,184,0.55)', marginTop: 3 }}>Security & compliance package included</div>
                        </div>
                    </div>
                </div>
            </section>

            <div style={{ margin: '0 56px', height: 1, background: 'linear-gradient(90deg, transparent 5%, rgba(29,111,216,0.12) 30%, rgba(201,166,106,0.15) 50%, rgba(29,111,216,0.12) 70%, transparent 95%)' }} />

            {/* ── SUPPORT ───────────────────────────────────────────── */}
            <section style={{
                position: 'relative',
                zIndex: 2,
                padding: '80px 24px',
                background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(29,111,216,0.04), transparent)',
                '@media (min-width: 1024px)': {
                    padding: '140px 56px',
                }
            } as any}>
                <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 28 }}>
                        <div style={{ width: 28, height: 1, background: '#C9A66A' }} />
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A66A' }}>Support & Partnership</span>
                        <div style={{ width: 28, height: 1, background: '#C9A66A' }} />
                    </div>
                    <h2 style={{ fontSize: 'clamp(2.4rem, 5vw, 4.5rem)', fontWeight: 800, lineHeight: 1.02, letterSpacing: '-0.04em', marginBottom: 20 }}>
                        No ticket queue.<br />
                        <span style={{ fontStyle: 'italic', fontWeight: 300, color: '#C9A66A' }}>A direct line.</span>
                    </h2>
                    <p style={{ fontSize: 15, color: 'rgba(148,163,184,0.65)', lineHeight: 1.85, maxWidth: 520, margin: '0 auto 64px' }}>
                        Drapit License is a partnership, not a subscription. You get the people and systems to match.
                    </p>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(1, 1fr)',
                        gap: 2,
                        marginBottom: 0,
                        '@media (min-width: 640px)': {
                            gridTemplateColumns: 'repeat(2, 1fr)',
                        },
                        '@media (min-width: 1024px)': {
                            gridTemplateColumns: 'repeat(3, 1fr)',
                        }
                    } as any}>
                        <SupportCard icon="🕐" title="24/7 Hybrid Support" desc="Always-on AI support with instant escalation to human engineers. Critical issues resolved within 4 hours, guaranteed." delay={0} />
                        <SupportCard icon="💬" title="Dedicated Channels" desc="Direct Slack and WhatsApp access to your account manager and technical lead. Real conversations, not email threads." delay={120} />
                        <SupportCard icon="👨‍💻" title="Dedicated Developer" desc="An engineer who knows your platform inside out. Custom development available on post-calculation billing." delay={240} />
                    </div>
                </div>
            </section>

            {/* ── CONTACT FORM ─────────────────────────────────────── */}
            <section id="contact" style={{
                position: 'relative',
                zIndex: 2,
                padding: '80px 24px',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr)',
                gap: 64,
                alignItems: 'start',
                '@media (min-width: 1024px)': {
                    padding: '140px 56px',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 100,
                }
            } as any}>

                {/* Left */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                        <div style={{ width: 28, height: 1, background: '#C9A66A' }} />
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A66A' }}>Contact Sales</span>
                    </div>
                    <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 3.5rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 24 }}>
                        Let&apos;s build something<br />
                        <span style={{ fontStyle: 'italic', fontWeight: 300, color: '#4A8AF4' }}>exceptional</span> together.
                    </h2>
                    <p style={{ fontSize: 15, color: 'rgba(148,163,184,0.65)', lineHeight: 1.85, marginBottom: 48 }}>
                        Tell us about your platform. We&apos;ll calculate a license tailored to your exact volume, requirements, and growth trajectory — and get back to you within 48 hours.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {[
                            { dot: '#4A8AF4', text: 'Custom pricing — no public rates' },
                            { dot: '#4A8AF4', text: 'Response within 48 business hours' },
                            { dot: '#4A8AF4', text: 'No obligations, no sales pressure' },
                            { dot: '#C9A66A', text: 'Annual license + volume model' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'rgba(148,163,184,0.7)' }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.dot, flexShrink: 0 }} />
                                {item.text}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form card */}
                <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: -40, background: 'radial-gradient(ellipse at center, rgba(29,111,216,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: -1 }} />
                    <div style={{ background: 'linear-gradient(145deg, rgba(13,24,41,0.94), rgba(4,8,16,0.98))', border: '1px solid rgba(29,111,216,0.16)', padding: '48px 40px', position: 'relative', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.55)' }}>
                        <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(29,111,216,0.5), rgba(201,166,106,0.3), transparent)' }} />

                        {formState === 'sent' ? (
                            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                <div style={{ fontSize: 48, marginBottom: 20 }}>✓</div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: '#4ade80', marginBottom: 10, letterSpacing: '-0.02em' }}>Request Received</div>
                                <p style={{ fontSize: 14, color: 'rgba(148,163,184,0.65)', lineHeight: 1.7 }}>We&apos;ll review your details and get back to you within 48 business hours.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(1, 1fr)',
                                    gap: 2,
                                    marginBottom: 2,
                                    '@media (min-width: 640px)': {
                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                    }
                                } as any}>
                                    <Field label="Company Name *">
                                        <input type="text" placeholder="Zalando SE" required {...inp('company')} style={inputStyle} />
                                    </Field>
                                    <Field label="Website *">
                                        <input type="url" placeholder="https://your-platform.com" required {...inp('website')} style={inputStyle} />
                                    </Field>
                                </div>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(1, 1fr)',
                                    gap: 2,
                                    marginBottom: 2,
                                    '@media (min-width: 640px)': {
                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                    }
                                } as any}>
                                    <Field label="Your Name *">
                                        <input type="text" placeholder="First & last name" required {...inp('name')} style={inputStyle} />
                                    </Field>
                                    <Field label="Job Title *">
                                        <input type="text" placeholder="Head of E-commerce" required {...inp('title')} style={inputStyle} />
                                    </Field>
                                </div>
                                <div style={{ marginBottom: 2 }}>
                                    <Field label="Business Email *">
                                        <input type="email" placeholder="you@company.com" required {...inp('email')} style={inputStyle} />
                                    </Field>
                                </div>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(1, 1fr)',
                                    gap: 2,
                                    marginBottom: 2,
                                    '@media (min-width: 640px)': {
                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                    }
                                } as any}>
                                    <Field label="Monthly Visitors">
                                        <select {...inp('visitors')} style={{ ...inputStyle, appearance: 'none' as const }}>
                                            <option value="">Select range</option>
                                            <option>100K – 500K</option>
                                            <option>500K – 2M</option>
                                            <option>2M – 10M</option>
                                            <option>10M+</option>
                                        </select>
                                    </Field>
                                    <Field label="Platform Type">
                                        <select {...inp('platform')} style={{ ...inputStyle, appearance: 'none' as const }}>
                                            <option value="">Select type</option>
                                            <option>Own technology stack</option>
                                            <option>Fashion marketplace</option>
                                            <option>Luxury brand</option>
                                            <option>Multibrand retailer</option>
                                            <option>Other</option>
                                        </select>
                                    </Field>
                                </div>
                                <div style={{ marginBottom: 0 }}>
                                    <Field label="What are you looking for?">
                                        <textarea placeholder="Tell us about your platform, your current try-on challenges, and what you'd like to achieve with Drapit License..." {...inp('message')} rows={4} style={{ ...inputStyle, resize: 'none' as const }} />
                                    </Field>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 16,
                                    paddingTop: 24,
                                    '@media (min-width: 640px)': {
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 20
                                    }
                                } as any}>
                                    <span style={{ fontSize: 12, color: 'rgba(148,163,184,0.45)', lineHeight: 1.5 }}>All information treated<br />with strict confidentiality.</span>
                                    <button type="submit" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', background: 'linear-gradient(135deg, #1D6FD8, #1558B0)', border: 'none', padding: '15px 30px', cursor: 'pointer', whiteSpace: 'nowrap' as const, width: '100%', maxWidth: 'max-content' } as any}
                                        onMouseEnter={e => { (e.currentTarget).style.boxShadow = '0 8px 28px rgba(29,111,216,0.45)'; (e.currentTarget).style.transform = 'translateY(-2px)'; }}
                                        onMouseLeave={e => { (e.currentTarget).style.boxShadow = 'none'; (e.currentTarget).style.transform = 'none'; }}>
                                        Submit Request →
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </section>

            {/* ── FOOTER STRIP ─────────────────────────────────────── */}
            <div style={{
                position: 'relative',
                zIndex: 2,
                borderTop: '1px solid rgba(255,255,255,0.05)',
                padding: '36px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 24,
                '@media (min-width: 1024px)': {
                    padding: '36px 56px',
                }
            } as any}>
                <Link href="/" style={{ textDecoration: 'none' }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: 'rgba(241,245,249,0.4)', letterSpacing: '-0.3px' }}>drapit</span>
                </Link>
                <Link href="/#prijzen" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.4)', textDecoration: 'none', borderBottom: '1px solid transparent', paddingBottom: 1, order: 3, width: '100%', textAlign: 'center', '@media (min-width: 768px)': { order: 2, width: 'auto', textAlign: 'left' } } as any}
                    onMouseEnter={e => { (e.target as HTMLElement).style.color = 'rgba(148,163,184,0.8)'; (e.target as HTMLElement).style.borderColor = 'rgba(148,163,184,0.4)'; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(148,163,184,0.4)'; (e.target as HTMLElement).style.borderColor = 'transparent'; }}>
                    ← Looking for a smaller plan? View standard pricing
                </Link>
                <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.3)', margin: 0, order: 2, '@media (min-width: 768px)': { order: 3 } } as any}>© 2026 Drapit — All rights reserved</p>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,600;0,700;0,800;1,300&display=swap');
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-track { background: #030812; }
                ::-webkit-scrollbar-thumb { background: rgba(29,111,216,0.25); border-radius: 3px; }
                input, select, textarea { font-family: 'Plus Jakarta Sans', sans-serif !important; }
                input::placeholder, textarea::placeholder { color: rgba(148,163,184,0.35) !important; }
                .ln-nav-link {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 14px; font-weight: 500;
                    color: rgba(241,245,249,0.65);
                    text-decoration: none;
                    padding: 8px 14px; border-radius: 8px;
                    transition: color 0.2s, background 0.2s;
                }
                .ln-nav-link:hover { color: #F1F5F9; background: rgba(201,166,106,0.06); }
                @media (max-width: 768px) {
                    .ln-nav-links { display: none !important; }
                    .ln-nav-mobile { display: flex !important; }
                }
            `}</style>
        </div>
    );
}

/* ── Field wrapper ────────────────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.5)', padding: '14px 14px 6px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderBottom: 'none' }}>{label}</label>
            {children}
        </div>
    );
}

/* ── Input base style ─────────────────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: 400,
    padding: '13px 14px',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.3s, background 0.3s',
};
