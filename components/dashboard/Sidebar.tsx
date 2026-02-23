'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Logo from '@/components/ui/Logo';

const navItems = [
    {
        label: 'Overzicht',
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
        label: 'Widget',
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
        label: 'API-sleutels',
        href: '/dashboard/api-keys',
        icon: (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.5 1.5l5 5-1.5 1.5-1-1-1.5 1.5-1-1-1.5 1.5-2.5-2.5a4.5 4.5 0 11-1.41-1.41L11.5 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="5.5" cy="12.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
        ),
    },
    {
        label: 'Abonnement',
        href: '/dashboard/billing',
        icon: (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="3" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <line x1="1" y1="7.5" x2="17" y2="7.5" stroke="currentColor" strokeWidth="1.5" />
                <line x1="4" y1="11" x2="8" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
];

interface SidebarProps {
    shopName?: string;
    tryonsUsed?: number;
    tryonsLimit?: number;
}

export default function Sidebar({ shopName = 'Mijn Shop', tryonsUsed = 0, tryonsLimit = 500 }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const usagePercent = tryonsLimit > 0 ? Math.min((tryonsUsed / tryonsLimit) * 100, 100) : 0;
    const usageColor = usagePercent > 90 ? '#DC2626' : usagePercent > 75 ? '#D97706' : '#1D6FD8';

    async function handleLogout() {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        await supabase.auth.signOut();
        router.push('/dashboard/login');
        router.refresh();
    }

    return (
        <aside className="bg-[#0F2744] text-white w-64 min-h-screen flex flex-col shrink-0">
            {/* Logo */}
            <div className="p-6">
                <Logo size="md" className="brightness-0 invert" />
                <p className="text-xs text-[#94A3B8] mt-2 truncate">{shopName}</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive =
                        item.href === '/dashboard'
                            ? pathname === '/dashboard'
                            : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 ${isActive
                                ? 'bg-[#1D6FD8] text-white rounded-lg px-4 py-2.5 text-sm font-medium'
                                : 'text-[#94A3B8] hover:bg-[#1A3A5C] hover:text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-150'
                                }`}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Usage indicator */}
            <div className="px-4 py-3 mx-3 mb-2 rounded-lg bg-white/5">
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium text-[#94A3B8]">Try-ons deze maand</span>
                    <span className="text-xs font-bold text-white">{tryonsUsed} / {tryonsLimit}</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${usagePercent}%`, backgroundColor: usageColor }}
                    />
                </div>
            </div>

            {/* Logout */}
            <div className="p-3 border-t border-white/10">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-[#94A3B8] hover:bg-[#1A3A5C] hover:text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-150 w-full"
                >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.5 16H3.5C2.67 16 2 15.33 2 14.5V3.5C2 2.67 2.67 2 3.5 2H6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M12 12.5L16 9L12 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="16" y1="9" x2="7" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Uitloggen
                </button>
            </div>
        </aside>
    );
}
