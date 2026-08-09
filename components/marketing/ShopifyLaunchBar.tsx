'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

/* ─────────────────────────────────────────────────────────────────────────────
   DRAPIT — SHOPIFY APP STORE LAUNCH BAR
   Sticky aankondigingsbalk bovenaan de marketing-pagina's.
   Zet --drapit-bar-h op <html> zodat de fixed nav + hero mee opschuiven.
───────────────────────────────────────────────────────────────────────────── */

export const SHOPIFY_APP_URL = 'https://apps.shopify.com/drapit-virtual-try-on';

const DISMISS_KEY = 'drapit_shopify_launch_bar_v1';

export default function ShopifyLaunchBar() {
    const t = useTranslations();
    const [visible, setVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const barRef = useRef<HTMLDivElement>(null);

    // Alleen tonen als de bezoeker 'm niet eerder heeft weggeklikt
    useEffect(() => {
        let dismissed = false;
        try {
            dismissed = window.localStorage.getItem(DISMISS_KEY) === '1';
        } catch {
            /* private mode — gewoon tonen */
        }
        setVisible(!dismissed);
        setMounted(true);
    }, []);

    // Hoogte doorgeven aan de layout via een CSS-variabele
    useEffect(() => {
        const root = document.documentElement;
        if (!visible) {
            root.style.setProperty('--drapit-bar-h', '0px');
            return;
        }
        const el = barRef.current;
        if (!el) return;

        const sync = () => root.style.setProperty('--drapit-bar-h', `${el.offsetHeight}px`);
        sync();

        const ro = new ResizeObserver(sync);
        ro.observe(el);
        window.addEventListener('resize', sync);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', sync);
        };
    }, [visible]);

    const dismiss = () => {
        try {
            window.localStorage.setItem(DISMISS_KEY, '1');
        } catch {
            /* niets aan te doen */
        }
        setVisible(false);
    };

    if (!mounted || !visible) return null;

    return (
        <>
            <style>{`
                @keyframes drapit-bar-sheen {
                    0%   { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes drapit-bar-dot {
                    0%, 100% { opacity: 1;   box-shadow: 0 0 0 0 rgba(149,191,71,0.55); }
                    50%      { opacity: 0.7; box-shadow: 0 0 0 7px rgba(149,191,71,0); }
                }
                .d-bar {
                    position: fixed;
                    top: 0; left: 0; right: 0;
                    z-index: 320;
                    background:
                        linear-gradient(90deg,
                            rgba(149,191,71,0.16) 0%,
                            rgba(29,111,216,0.20) 48%,
                            rgba(149,191,71,0.16) 100%),
                        #070B12;
                    border-bottom: 1px solid rgba(149,191,71,0.28);
                    overflow: hidden;
                    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
                }
                .d-bar::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 50%, transparent 100%);
                    animation: drapit-bar-sheen 7s ease-in-out infinite;
                    pointer-events: none;
                }
                .d-bar-inner {
                    position: relative;
                    z-index: 1;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 11px 52px 11px 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 14px;
                    flex-wrap: wrap;
                    text-align: center;
                }
                .d-bar-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    flex-shrink: 0;
                    background: rgba(149,191,71,0.14);
                    border: 1px solid rgba(149,191,71,0.34);
                    border-radius: 100px;
                    padding: 3px 11px;
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 0.12em;
                    color: #B5DC72;
                    white-space: nowrap;
                }
                .d-bar-dot {
                    width: 6px; height: 6px; border-radius: 50%;
                    background: #95BF47;
                    animation: drapit-bar-dot 2.2s ease-in-out infinite;
                }
                .d-bar-text {
                    font-size: 14px;
                    font-weight: 500;
                    color: rgba(241,245,249,0.86);
                    letter-spacing: -0.005em;
                }
                .d-bar-text b { font-weight: 800; color: #F1F5F9; }
                .d-bar-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    flex-shrink: 0;
                    font-size: 13px;
                    font-weight: 700;
                    color: #B5DC72;
                    text-decoration: none;
                    border-bottom: 1px solid rgba(181,220,114,0.35);
                    padding-bottom: 1px;
                    transition: color 0.2s, border-color 0.2s, gap 0.2s;
                    white-space: nowrap;
                }
                .d-bar-link:hover {
                    color: #F1F5F9;
                    border-color: rgba(241,245,249,0.6);
                    gap: 9px;
                }
                .d-bar-close {
                    position: absolute;
                    top: 50%; right: 16px;
                    transform: translateY(-50%);
                    z-index: 2;
                    width: 26px; height: 26px;
                    display: flex; align-items: center; justify-content: center;
                    background: transparent;
                    border: 1px solid rgba(255,255,255,0.10);
                    border-radius: 8px;
                    color: rgba(241,245,249,0.45);
                    cursor: pointer;
                    transition: color 0.2s, background 0.2s, border-color 0.2s;
                    padding: 0;
                }
                .d-bar-close:hover {
                    color: #F1F5F9;
                    background: rgba(255,255,255,0.07);
                    border-color: rgba(255,255,255,0.2);
                }
                @media (max-width: 720px) {
                    .d-bar-inner { padding: 10px 46px 10px 18px; gap: 9px; }
                    .d-bar-text  { font-size: 12.5px; line-height: 1.45; }
                    .d-bar-chip  { display: none; }
                    .d-bar-link  { font-size: 12.5px; }
                }
            `}</style>

            <div ref={barRef} className="d-bar" role="region" aria-label={t('launch.bar.aria')}>
                <div className="d-bar-inner">
                    <span className="d-bar-chip">
                        <span className="d-bar-dot" />
                        {t('launch.bar.chip')}
                    </span>

                    <span className="d-bar-text">
                        {t('launch.bar.textStart')} <b>{t('launch.bar.textBold')}</b> {t('launch.bar.textEnd')}
                    </span>

                    <a
                        className="d-bar-link"
                        href={SHOPIFY_APP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {t('launch.bar.cta')}
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <path d="M5.25 2.625H2.625V11.375H11.375V8.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8.75 2.625H11.375V5.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6.125 7.875L11.375 2.625" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>
                </div>

                <button className="d-bar-close" onClick={dismiss} aria-label={t('launch.bar.dismiss')}>
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                </button>
            </div>
        </>
    );
}
