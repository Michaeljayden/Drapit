'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LanguageSwitcher from './LanguageSwitcher';

/* ─────────────────────────────────────────────────────────────────────────────
   DRAPIT — FOOTER
   Aesthetic: Dark luxury-tech. Matches landing page theme.
   ───────────────────────────────────────────────────────────────────────────── */

export default function Footer() {
    return (
        <footer style={{
            background: '#06090F',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '80px 28px 40px',
            position: 'relative',
            zIndex: 10,
            overflow: 'hidden'
        }}>
            {/* Ambient background glow */}
            <div style={{
                position: 'absolute',
                bottom: '-10%',
                left: '20%',
                width: '600px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(29,111,216,0.08) 0%, transparent 70%)',
                filter: 'blur(80px)',
                pointerEvents: 'none'
            }} />

            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '40px',
                    marginBottom: '64px'
                }}>
                    {/* Brand Section */}
                    <div style={{ maxWidth: '360px' }}>
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', marginBottom: '24px' }}>
                            <img src="/images/2.png" alt="Drapit" style={{ height: 36, width: 'auto', filter: 'invert(1)' }} />
                        </Link>
                        <p style={{
                            fontSize: '15px',
                            lineHeight: '1.6',
                            color: 'rgba(241,245,249,0.5)',
                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                            marginBottom: '28px'
                        }}>
                            AI-powered virtual try-on technologie. Wij transformeren webshops met intelligente automatisering en realistische passessies.
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {['linkedin', 'twitter', 'github'].map((social) => (
                                <a key={social} href={`#${social}`} style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease',
                                    color: 'rgba(241,245,249,0.5)'
                                }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'rgba(29,111,216,0.1)';
                                        e.currentTarget.style.borderColor = 'rgba(29,111,216,0.3)';
                                        e.currentTarget.style.color = '#1D6FD8';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                        e.currentTarget.style.color = 'rgba(241,245,249,0.5)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}>
                                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{social[0].toUpperCase()}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Columns Container */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '40px', gridColumn: 'span 2' }}>
                        {/* Product Links */}
                        <div>
                            <h4 style={footerHeadingStyle}>Product</h4>
                            <ul style={footerListStyle}>
                                <li><a href="#hoe-het-werkt" style={footerLinkStyle}>Hoe het werkt</a></li>
                                <li><a href="#shopify" style={footerLinkStyle}>Shopify Integratie</a></li>
                                <li><a href="#prijzen" style={footerLinkStyle}>Prijzen</a></li>
                                <li><Link href="/dashboard/login" style={footerLinkStyle}>Demo aanvragen</Link></li>
                            </ul>
                        </div>

                        {/* Bedrijf Links */}
                        <div>
                            <h4 style={footerHeadingStyle}>Bedrijf</h4>
                            <ul style={footerListStyle}>
                                <li><a href="#" style={footerLinkStyle}>Over Ons</a></li>
                                <li><a href="#faq" style={footerLinkStyle}>FAQ</a></li>
                                <li><Link href="/privacy" style={footerLinkStyle}>Privacy Policy</Link></li>
                                <li><Link href="/privacy#8" style={footerLinkStyle}>Cookie Beleid</Link></li>
                            </ul>
                        </div>

                        {/* Contact Section */}
                        <div>
                            <h4 style={footerHeadingStyle}>Contact</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <a href="mailto:info@drapit.io" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    textDecoration: 'none',
                                    color: 'rgba(241,245,249,0.5)',
                                    fontSize: '14px',
                                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                                    transition: 'color 0.2s'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#F1F5F9'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(241,245,249,0.5)'}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                    info@drapit.io
                                </a>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '12px',
                                    color: 'rgba(241,245,249,0.5)',
                                    fontSize: '14px',
                                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                                    lineHeight: '1.5'
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginTop: '3px', flexShrink: 0 }}>
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    Kastanjelaan 400, 5616 LZ<br />Eindhoven, Nederland
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    paddingTop: '32px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '20px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <p style={{
                            fontSize: '13px',
                            color: 'rgba(241,245,249,0.3)',
                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                            margin: 0
                        }}>
                            © 2026 Drapit. Alle rechten voorbehouden.
                        </p>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            paddingLeft: '12px',
                            borderLeft: '1px solid rgba(255,255,255,0.08)'
                        }}>
                            <Image
                                src="/images/ideal wero.png"
                                alt="iDeal / Wero"
                                width={60}
                                height={28}
                                style={{ objectFit: 'contain', opacity: 0.7 }}
                            />
                            <Image
                                src="/images/visa-brandmark-blue-1960x622.png"
                                alt="Visa"
                                width={45}
                                height={28}
                                style={{ objectFit: 'contain', opacity: 0.7 }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                        <Link href="/privacy" style={bottomLinkStyle}>Privacy</Link>
                        <Link href="/privacy" style={bottomLinkStyle}>Voorwaarden</Link>
                        <a href="#faq" style={bottomLinkStyle}>FAQ</a>
                        <div style={{ marginLeft: '12px' }}>
                            <LanguageSwitcher />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

const footerHeadingStyle = {
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.12em',
    color: '#F1F5F9',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    textTransform: 'uppercase' as const,
    marginBottom: '24px'
};

const footerListStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '14px'
};

const footerLinkStyle: React.CSSProperties = {
    fontSize: '14px',
    color: 'rgba(241,245,249,0.5)',
    textDecoration: 'none',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    transition: 'all 0.2s ease',
    display: 'inline-block'
};

const bottomLinkStyle: React.CSSProperties = {
    fontSize: '13px',
    color: 'rgba(241,245,249,0.3)',
    textDecoration: 'none',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    transition: 'color 0.2s'
};

// We would handle hover states via JS/CSS in a real project,
// but for this implementation we use inline styles with onMouseEnter/Leave where needed.
