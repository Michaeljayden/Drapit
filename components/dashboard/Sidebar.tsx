'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { useTranslations } from 'next-intl';
import Logo from '@/components/ui/Logo';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface SidebarProps {
    shopName?: string;
    tryonsUsed?: number;
    tryonsLimit?: number;
    studioCreditsUsed?: number;
    studioCreditsLimit?: number;
    studioExtraCredits?: number;
    isAdmin?: boolean;
}

export default function Sidebar({ shopName = 'Mijn Shop', tryonsUsed = 0, tryonsLimit = 500, studioCreditsUsed = 0, studioCreditsLimit = 20, studioExtraCredits = 0, isAdmin = false }: SidebarProps) {
    const t = useTranslations('nav');
    const tCommon = useTranslations('buttons');
    const pathname = usePathname();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = [
    {
        label: t('overview'),
        href: '/dashboard',
        icon: (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="10" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="1" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="10" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
        ),
    },
    {
        label: t('widget'),
        href: '/dashboard/widget',
        icon: (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 3l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="10" y1="1" x2="8" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        label: t('installation'),
        href: '/dashboard/installation',
        icon: (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 1v10m0 0l-3-3m3 3l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 13v2a2 2 0 002 2h10a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        label: t('studio'),
        href: '/dashboard/studio',
        badge: t('new'),
        icon: (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 13V5.5A1.5 1.5 0 014.5 4h.75L6 2.5h6L12.75 4h.75A1.5 1.5 0 0115 5.5V13a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 013 13z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="13.5" cy="5.5" r="0.5" fill="currentColor" />
            </svg>
        ),
        children: [
            {
                label: t('studio'),
                href: '/dashboard/studio',
                icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="10" y1="10" x2="14" y2="14" />
                        <line x1="14" y1="10" x2="10" y2="14" />
                        <circle cx="12" cy="12" r="10" />
                    </svg>
                ),
            },
            {
                label: t('gallery'),
                href: '/dashboard/studio/gallery',
                icon: (
                    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="3" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M1 12l4-4a1.5 1.5 0 012.1 0L11 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M11 11l1.5-1.5a1.5 1.5 0 012.1 0L17 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12.5" cy="7" r="1" fill="currentColor" />
                    </svg>
                ),
            },
            {
                label: t('guide'),
                href: '/dashboard/guide',
                icon: (
                    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 2H4a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V8l-4-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6 11h6M6 14h6M6 8h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                ),
            },
        ]
    },
    {
        label: t('apiKeys'),
        href: '/dashboard/api-keys',
        icon: (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.5 1.5l5 5-1.5 1.5-1-1-1.5 1.5-1-1-1.5 1.5-2.5-2.5a4.5 4.5 0 11-1.41-1.41L11.5 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="5.5" cy="12.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
        ),
    },
    {
        label: t('billing'),
        href: '/dashboard/billing',
        icon: (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="3" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <line x1="1" y1="7.5" x2="17" y2="7.5" stroke="currentColor" strokeWidth="1.5" />
                <line x1="4" y1="11" x2="8" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        label: t('support'),
        href: '/dashboard/support',
        icon: (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9 10.5V10c0-.83.5-1.27 1-1.62A2.5 2.5 0 106.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="13" r="0.75" fill="currentColor" />
            </svg>
        ),
    },
    {
        label: t('settings'),
        href: '/dashboard/settings',
        icon: (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14.5 9.5c0-.28.22-.5.5-.5.28 0 .5.22.5.5s-.22.5-.5.5c-.28 0-.5-.22-.5-.5zM3 9.5c0-.28-.22-.5-.5-.5-.28 0-.5.22-.5.5s.22.5.5.5c.28 0 .5-.22.5-.5zM9.5 14.5c.28 0 .5.22.5.5s-.22.5-.5.5c-.28 0-.5-.22-.5-.5 0-.28.22-.5.5-.5zM9.5 3c.28 0 .5.22.5.5s-.22.5-.5.5c-.28 0-.5-.22-.5-.5 0-.28.22-.5.5-.5z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12.89 12.89a.5.5 0 01.71 0c.2.2.2.51 0 .71a.5.5 0 01-.71 0 .5.5 0 010-.71zM4.4 4.4a.5.5 0 01.71 0c.2.2.2.51 0 .71a.5.5 0 01-.71 0 .5.5 0 010-.71zM12.89 5.11a.5.5 0 010-.71.5.5 0 01.71 0c.2.2.2.51 0 .71a.5.5 0 01-.71 0zM4.4 13.6a.5.5 0 010-.71.5.5 0 01.71 0c.2.2.2.51 0 .71a.5.5 0 01-.71 0z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
        ),
    },
];

    const usagePercent = tryonsLimit > 0 ? Math.min((tryonsUsed / tryonsLimit) * 100, 100) : 0;
    const usageColor = usagePercent > 90 ? '#EF4444' : usagePercent > 75 ? '#F59E0B' : '#1D6FD8';

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    async function handleLogout() {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    }

    const sidebarContent = (
        <>
            {/* Logo */}
            <div className="px-5 pt-6 pb-5">
                <Logo size="md" className="invert" />
                <div className="flex items-center gap-2 mt-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                    <p className="text-xs text-[#94A3B8] truncate font-medium">{shopName}</p>
                </div>
            </div>

            {/* Divider */}
            <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-3" />

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
                {navItems.map((item) => {
                    const isParentActive =
                        item.href === '/dashboard'
                            ? pathname === '/dashboard'
                            : pathname.startsWith(item.href);

                    const hasChildren = 'children' in item && item.children;

                    return (
                        <div key={item.href} className="flex flex-col gap-0.5">
                            <Link
                                href={item.href}
                                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${isParentActive
                                    ? 'bg-gradient-to-r from-[#1D6FD8] to-[#1558B0] text-white shadow-[0_4px_12px_rgba(29,111,216,0.35)]'
                                    : 'text-[#94A3B8] hover:bg-white/8 hover:text-white'
                                    }`}
                            >
                                <span className={isParentActive ? 'text-white' : 'text-[#94A3B8]'}>{item.icon}</span>
                                <span className="flex-1">{item.label}</span>
                                {'badge' in item && item.badge && (
                                    <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                                        {item.badge}
                                    </span>
                                )}
                                {hasChildren && (
                                    <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className={`transition-transform duration-200 ${isParentActive ? 'rotate-90' : ''}`}
                                    >
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                )}
                            </Link>

                            {/* Sub items - only show if parent is active */}
                            {hasChildren && isParentActive && (
                                <div className="ml-4 pl-4 border-l border-white/10 flex flex-col gap-0.5 mt-0.5 mb-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                    {item.children.map((child) => {
                                        const isChildActive = pathname === child.href;
                                        return (
                                            <Link
                                                key={child.href}
                                                href={child.href}
                                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150 ${isChildActive
                                                    ? 'bg-white/10 text-white'
                                                    : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
                                                    }`}
                                            >
                                                <span className={isChildActive ? 'text-[#3B9AF0]' : 'text-[#94A3B8]/60'}>{child.icon}</span>
                                                <span>{child.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Usage indicator */}
            <div className="px-4 py-3 mx-3 mb-3">
                <div className="bg-white/5 rounded-xl p-3 border border-white/5 space-y-3">
                    {/* Studio Credits */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[11px] font-semibold text-[#94A3B8]">Studio credits</span>
                            <span className="text-[11px] font-bold text-white">
                                {Math.max(0, (studioCreditsLimit + studioExtraCredits) - studioCreditsUsed)}
                                <span className="text-white/40 font-normal ml-1">
                                    / {studioCreditsLimit + studioExtraCredits}
                                </span>
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700 ease-out"
                                style={{
                                    width: `${Math.min((studioCreditsUsed / Math.max(studioCreditsLimit + studioExtraCredits, 1)) * 100, 100)}%`,
                                    background: studioCreditsUsed >= (studioCreditsLimit + studioExtraCredits)
                                        ? 'linear-gradient(90deg, #EF4444, #DC2626)'
                                        : studioCreditsUsed / (studioCreditsLimit + studioExtraCredits) > 0.75
                                            ? 'linear-gradient(90deg, #F59E0B, #D97706)'
                                            : 'linear-gradient(90deg, #1D6FD8, #3B9AF0)',
                                }}
                            />
                        </div>
                        {studioCreditsUsed >= (studioCreditsLimit + studioExtraCredits) && (
                            <a href="/dashboard/billing" className="text-[10px] text-amber-400 mt-1.5 font-medium hover:text-amber-300 transition-colors block">
                                ⚠ Credits op · Upgrade →
                            </a>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-white/8" />

                    {/* Try-ons */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[11px] font-semibold text-[#94A3B8]">Try-ons deze maand</span>
                            <span className="text-[11px] font-bold text-white">{tryonsUsed} <span className="text-white/40 font-normal">/ {tryonsLimit}</span></span>
                        </div>
                        <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700 ease-out"
                                style={{
                                    width: `${usagePercent}%`,
                                    background: usagePercent > 90
                                        ? 'linear-gradient(90deg, #EF4444, #DC2626)'
                                        : usagePercent > 75
                                            ? 'linear-gradient(90deg, #F59E0B, #D97706)'
                                            : 'linear-gradient(90deg, #1D6FD8, #3B9AF0)',
                                }}
                            />
                        </div>
                        {usagePercent > 80 && (
                            <p className="text-[10px] text-amber-400 mt-1.5 font-medium">
                                {usagePercent > 90 ? '⚠ Bijna vol' : 'Bijna op limiet'}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Language Switcher */}
            <div className="p-3 pt-0">
                <div className="flex justify-center">
                    <LanguageSwitcher />
                </div>
            </div>

            {/* Admin link */}
            {isAdmin && (
                <div className="px-3 pb-1">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 text-amber-400/80 hover:text-amber-300 hover:bg-white/8 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 w-full"
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 1.5l1.3 4h4.2l-3.4 2.5 1.3 4L9 9.5 5.6 12l1.3-4L3.5 5.5h4.2L9 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Admin
                    </Link>
                </div>
            )}

            {/* Logout */}
            <div className="p-3 pt-0">
                <div className="h-px bg-white/8 mb-2" />
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-[#64748B] hover:text-white hover:bg-white/8 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 w-full group"
                >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:text-red-400 transition-colors">
                        <path d="M6.5 16H3.5C2.67 16 2 15.33 2 14.5V3.5C2 2.67 2.67 2 3.5 2H6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M12 12.5L16 9L12 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="16" y1="9" x2="7" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    {tCommon('logout')}
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* ─── Mobile top bar ─────────────────────────────────── */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#0F2744] flex items-center justify-between px-4 h-14 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="text-white p-1.5 -ml-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        aria-label="Open menu"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                    <Logo size="sm" className="invert" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <p className="text-xs text-[#94A3B8] truncate max-w-[140px]">{shopName}</p>
                </div>
            </div>

            {/* ─── Mobile overlay ─────────────────────────────────── */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ─── Mobile drawer ──────────────────────────────────── */}
            <aside
                className={`
                    md:hidden fixed top-0 left-0 bottom-0 z-50 w-64
                    bg-[#0B1E38] text-white flex flex-col
                    transition-transform duration-300 ease-in-out
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {/* Close button */}
                <div className="absolute top-3 right-3">
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="text-[#94A3B8] hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        aria-label="Sluit menu"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                {sidebarContent}
            </aside>

            {/* ─── Desktop sidebar ────────────────────────────────── */}
            <aside className="hidden md:flex bg-[#0B1E38] text-white w-64 min-h-screen flex-col shrink-0 fixed top-0 left-0 bottom-0 z-30">
                {sidebarContent}
            </aside>
        </>
    );
}
