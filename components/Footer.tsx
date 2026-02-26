'use client';

import React from 'react';
import Link from 'next/link';

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
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '48px',
                    marginBottom: '64px'
                }}>
                    {/* Brand Section */}
                    <div style={{ gridColumn: 'span 1.5', minWidth: '300px' }}>
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', marginBottom: '24px' }}>
                            <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
                                <path d="M9.5 3.5C9.5 2.67 8.83 2 8 2S6.5 2.67 6.5 3.5" stroke="#1D6FD8" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M8 5L2.5 10.5C2.18 10.77 2 11.15 2 11.56C2 12.35 2.65 13 3.44 13H12.56C13.35 13 14 12.35 14 11.56C14 11.15 13.82 10.77 13.5 10.5L8 5Z" stroke="#1D6FD8" strokeWidth="1.5" strokeLinejoin="round" />
                            </svg>
                            <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 24, color: '#F1F5F9', letterSpacing: '-0.015em' }}>Drapit</span>
                        </Link>
                        <p style={{
                            fontSize: '15px',
                            lineHeight: '1.6',
                            color: 'rgba(241,245,249,0.5)',
                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                            maxWidth: '320px',
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

                    {/* Product Links */}
                    <div>
                        <h4 style={{
                            fontSize: '12px',
                            fontWeight: 800,
                            letterSpacing: '0.12em',
                            color: '#F1F5F9',
                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                            textTransform: 'uppercase',
                            marginBottom: '24px'
                        }}>Product</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <li><a href="#hoe-het-werkt" style={footerLinkStyle}>Hoe het werkt</a></li>
                            <li><a href="#shopify" style={footerLinkStyle}>Shopify Integratie</a></li>
                            <li><a href="#prijzen" style={footerLinkStyle}>Prijzen</a></li>
                            <li><Link href="/dashboard/login" style={footerLinkStyle}>Demo aanvragen</Link></li>
                        </ul>
                    </div>

                    {/* Bedrijf Links */}
                    <div>
                        <h4 style={{
                            fontSize: '12px',
                            fontWeight: 800,
                            letterSpacing: '0.12em',
                            color: '#F1F5F9',
                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                            textTransform: 'uppercase',
                            marginBottom: '24px'
                        }}>Bedrijf</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <li><a href="#" style={footerLinkStyle}>Over Ons</a></li>
                            <li><a href="#faq" style={footerLinkStyle}>FAQ</a></li>
                            <li><a href="#" style={footerLinkStyle}>Privacy Policy</a></li>
                            <li><a href="#" style={footerLinkStyle}>Cookie Beleid</a></li>
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div style={{ minWidth: '220px' }}>
                        <h4 style={{
                            fontSize: '12px',
                            fontWeight: 800,
                            letterSpacing: '0.12em',
                            color: '#F1F5F9',
                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                            textTransform: 'uppercase',
                            marginBottom: '24px'
                        }}>Contact</h4>
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
                    <p style={{
                        fontSize: '13px',
                        color: 'rgba(241,245,249,0.3)',
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        margin: 0
                    }}>
                        © 2026 Drapit. Alle rechten voorbehouden.
                    </p>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <a href="#" style={bottomLinkStyle}>Privacy</a>
                        <a href="#" style={bottomLinkStyle}>Voorwaarden</a>
                        <a href="#faq" style={bottomLinkStyle}>FAQ</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

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
