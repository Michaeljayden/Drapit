'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { SHOPIFY_APP_URL } from './ShopifyLaunchBar';

/* ─────────────────────────────────────────────────────────────────────────────
   DRAPIT — SHOPIFY APP STORE LAUNCH SECTIE
   De listing is live: donkere sectie met een lichte "App Store"-kaart als
   contrastmoment. Groen = Shopify, blauw = Drapit.
───────────────────────────────────────────────────────────────────────────── */

function useInView(threshold = 0.12) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } },
            { threshold }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [threshold]);
    return { ref, inView };
}

function Check() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#95BF47" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

export default function ShopifyLaunchSection({ showGuideLink = true }: { showGuideLink?: boolean }) {
    const t = useTranslations();
    const s = useInView(0.08);

    const points = [
        t('launch.section.point0'),
        t('launch.section.point1'),
        t('launch.section.point2'),
    ];

    return (
        <section id="app-store" className="d-launch-section" style={{ position: 'relative', overflow: 'hidden' }}>
            <style>{`
                @keyframes drapit-launch-glow {
                    0%, 100% { opacity: 0.55; transform: scale(1); }
                    50%      { opacity: 0.9;  transform: scale(1.06); }
                }
                @keyframes drapit-launch-float {
                    0%, 100% { transform: translateY(0px); }
                    50%      { transform: translateY(-12px); }
                }
                @keyframes drapit-launch-pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(149,191,71,0.4); }
                    50%      { box-shadow: 0 0 0 8px rgba(149,191,71,0); }
                }
                .d-launch-section { padding: 72px 28px 96px; }
                .d-launch-float { animation: drapit-launch-float 6s ease-in-out infinite; }
                .d-launch-grid {
                    display: grid;
                    grid-template-columns: 1.05fr 0.95fr;
                    gap: 72px;
                    align-items: center;
                }
                .d-launch-card {
                    position: relative;
                    background: linear-gradient(180deg, #FFFFFF 0%, #F6F7F9 100%);
                    border-radius: 22px;
                    padding: 30px 30px 26px;
                    box-shadow:
                        0 40px 90px rgba(0,0,0,0.55),
                        0 0 0 1px rgba(149,191,71,0.35),
                        0 0 60px rgba(149,191,71,0.16);
                    transition: transform 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s ease;
                }
                .d-launch-card:hover {
                    transform: translateY(-6px);
                    box-shadow:
                        0 52px 110px rgba(0,0,0,0.6),
                        0 0 0 1px rgba(149,191,71,0.55),
                        0 0 80px rgba(149,191,71,0.26);
                }
                .d-launch-install {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100%;
                    background: #1A1A1A;
                    color: #FFFFFF;
                    border-radius: 10px;
                    padding: 13px 20px;
                    font-size: 14.5px;
                    font-weight: 700;
                    letter-spacing: 0.01em;
                    text-decoration: none;
                    transition: background 0.25s, transform 0.25s;
                }
                .d-launch-install:hover { background: #000000; transform: translateY(-1px); }
                .d-launch-cta {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    background: linear-gradient(135deg, #95BF47, #5E8E3E);
                    color: #FFFFFF;
                    padding: 15px 30px;
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 700;
                    letter-spacing: 0.03em;
                    text-decoration: none;
                    box-shadow: 0 10px 32px rgba(149,191,71,0.38);
                    transition: transform 0.25s, box-shadow 0.25s;
                }
                .d-launch-cta:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 16px 44px rgba(149,191,71,0.55);
                }
                .d-launch-ghost {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 15px 26px;
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 500;
                    color: rgba(241,245,249,0.72);
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.09);
                    text-decoration: none;
                    transition: all 0.2s;
                }
                .d-launch-ghost:hover {
                    color: #F1F5F9;
                    background: rgba(255,255,255,0.07);
                    border-color: rgba(255,255,255,0.16);
                }
                @media (max-width: 960px) {
                    .d-launch-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
                    .d-launch-visual { order: -1; }
                }
                @media (max-width: 540px) {
                    .d-launch-section { padding: 80px 22px !important; }
                    .d-launch-card { padding: 24px 20px 22px !important; }
                }
            `}</style>

            {/* Ambient */}
            <div style={{ position: 'absolute', top: '12%', right: '4%', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(149,191,71,0.13) 0%, transparent 70%)', filter: 'blur(90px)', pointerEvents: 'none', animation: 'drapit-launch-glow 9s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', bottom: '-8%', left: '-4%', width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,111,216,0.10) 0%, transparent 68%)', filter: 'blur(90px)', pointerEvents: 'none' }} />

            <div ref={s.ref} style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
                <div className="d-launch-grid">

                    {/* ── Copy ───────────────────────────────────────── */}
                    <div>
                        <div className={`d-in d-d1 ${s.inView ? 'visible' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(149,191,71,0.1)', border: '1px solid rgba(149,191,71,0.28)', borderRadius: 100, padding: '7px 18px', marginBottom: 26 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#95BF47', boxShadow: '0 0 9px #95BF47', animation: 'drapit-launch-pulse 2s ease-in-out infinite' }} />
                            <span style={{ fontSize: 10.5, fontWeight: 800, color: '#B5DC72', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.13em' }}>
                                {t('launch.section.eyebrow')}
                            </span>
                        </div>

                        <h2 className={`d-in d-d2 ${s.inView ? 'visible' : ''}`} style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, color: '#F1F5F9', lineHeight: 1.06, letterSpacing: '-0.025em', marginBottom: 22 }}>
                            {t('launch.section.titleStart')}{' '}
                            <span style={{ color: '#95BF47' }}>{t('launch.section.titleHighlight')}</span>
                        </h2>

                        <p className={`d-in d-d3 ${s.inView ? 'visible' : ''}`} style={{ fontSize: 17.5, color: 'rgba(241,245,249,0.56)', lineHeight: 1.72, marginBottom: 32, maxWidth: 520, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                            {t('launch.section.body')}
                        </p>

                        <ul className={`d-in d-d4 ${s.inView ? 'visible' : ''}`} style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 40, padding: 0 }}>
                            {points.map((p, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span style={{ width: 24, height: 24, borderRadius: 8, flexShrink: 0, background: 'rgba(149,191,71,0.12)', border: '1px solid rgba(149,191,71,0.24)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Check />
                                    </span>
                                    <span style={{ fontSize: 15, color: 'rgba(241,245,249,0.75)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 500 }}>{p}</span>
                                </li>
                            ))}
                        </ul>

                        <div className={`d-in d-d5 ${s.inView ? 'visible' : ''}`} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                            <a className="d-launch-cta" href={SHOPIFY_APP_URL} target="_blank" rel="noopener noreferrer">
                                <img src="/images/logos/Shopify_logo_2018.svg.png" alt="" aria-hidden="true" style={{ height: 15, width: 'auto', filter: 'brightness(0) invert(1)' }} />
                                {t('launch.section.ctaPrimary')}
                            </a>
                            {showGuideLink && (
                                <Link className="d-launch-ghost" href="/shopify">
                                    {t('launch.section.ctaSecondary')}
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* ── App Store listing kaart ─────────────────────── */}
                    <div className={`d-launch-visual d-in d-d3 ${s.inView ? 'visible' : ''}`}>
                        <div style={{ position: 'relative' }}>
                            <div className="d-launch-card">
                                {/* App Store kop */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22, paddingBottom: 16, borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                                    <img src="/images/logos/Shopify_logo_2018.svg.png" alt="Shopify" style={{ height: 17, width: 'auto' }} />
                                    <span style={{ fontSize: 12.5, fontWeight: 600, color: '#5C6570', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>App Store</span>
                                    <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: '#4E7A2C', background: 'rgba(149,191,71,0.16)', borderRadius: 100, padding: '4px 10px' }}>
                                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#5E8E3E' }} />
                                        {t('launch.section.cardLive')}
                                    </span>
                                </div>

                                {/* Listing */}
                                <div style={{ display: 'flex', gap: 15, alignItems: 'flex-start', marginBottom: 18 }}>
                                    <img
                                        src="/images/shopify-app-icon.png"
                                        alt="Drapit app-icoon"
                                        style={{ width: 58, height: 58, borderRadius: 15, flexShrink: 0, boxShadow: '0 6px 18px rgba(29,111,216,0.3)' }}
                                    />
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontSize: 17, fontWeight: 800, color: '#12161C', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.015em', lineHeight: 1.25 }}>
                                            Drapit &middot; AI Virtual Try-On
                                        </div>
                                        <div style={{ fontSize: 12.5, color: '#6B7480', fontFamily: 'Plus Jakarta Sans, sans-serif', marginTop: 3 }}>
                                            {t('launch.section.cardBy')} Drapit
                                        </div>
                                    </div>
                                </div>

                                <p style={{ fontSize: 13.5, color: '#4A525C', lineHeight: 1.62, fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 18 }}>
                                    {t('launch.section.cardTagline')}
                                </p>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 22 }}>
                                    {[t('launch.section.cardTag0'), t('launch.section.cardTag1'), t('launch.section.cardTag2')].map((tag, i) => (
                                        <span key={i} style={{ fontSize: 11.5, fontWeight: 600, color: '#3D4650', background: 'rgba(0,0,0,0.045)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 100, padding: '5px 11px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <a className="d-launch-install" href={SHOPIFY_APP_URL} target="_blank" rel="noopener noreferrer">
                                    {t('launch.section.cardInstall')}
                                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                        <path d="M5.25 2.625H2.625V11.375H11.375V8.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M8.75 2.625H11.375V5.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M6.125 7.875L11.375 2.625" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </a>
                            </div>

                            {/* Zwevend label */}
                            <div className="d-launch-float" style={{
                                position: 'absolute', bottom: -30, left: -14, zIndex: 2,
                                background: 'linear-gradient(135deg, rgba(13,24,41,0.97), rgba(6,9,15,0.99))',
                                border: '1px solid rgba(149,191,71,0.32)',
                                borderRadius: 14,
                                padding: '11px 18px',
                                boxShadow: '0 20px 44px rgba(0,0,0,0.55)',
                                display: 'flex', alignItems: 'center', gap: 10,
                            }}>
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#95BF47" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                </svg>
                                <div>
                                    <div style={{ fontSize: 9.5, color: 'rgba(181,220,114,0.75)', fontWeight: 700, letterSpacing: '0.09em', lineHeight: 1, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                        {t('launch.section.floatLabel')}
                                    </div>
                                    <div style={{ fontSize: 14, color: '#F1F5F9', fontWeight: 800, lineHeight: 1.3, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                        {t('launch.section.floatValue')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
