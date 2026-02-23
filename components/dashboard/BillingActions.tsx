'use client';

import { useState } from 'react';
import { colors, componentStyles } from '@/lib/design-tokens';
import type { Plan } from '@/lib/supabase/types';

interface CheckoutProps {
    action: 'checkout';
    plan: Plan;
    isUpgrade?: boolean;
    isDowngrade?: boolean;
    popular?: boolean;
}

interface PortalProps {
    action: 'portal';
}

type BillingActionsProps = CheckoutProps | PortalProps;

export default function BillingActions(props: BillingActionsProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ── Portal button ───────────────────────────────────────────────────
    if (props.action === 'portal') {
        async function handlePortal() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/stripe/portal', { method: 'POST' });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Fout bij openen portal');
                window.location.href = data.portal_url;
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Onbekende fout');
                setLoading(false);
            }
        }

        return (
            <div>
                <button
                    onClick={handlePortal}
                    disabled={loading}
                    className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors duration-150 disabled:opacity-50"
                    style={{
                        backgroundColor: colors.gray100,
                        color: colors.gray900,
                    }}
                >
                    {loading ? (
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <rect x="1.5" y="3" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.3" />
                            <line x1="1.5" y1="7" x2="14.5" y2="7" stroke="currentColor" strokeWidth="1.3" />
                        </svg>
                    )}
                    Stripe Portal
                </button>
                {error && (
                    <p className="text-xs mt-1" style={{ color: colors.red }}>{error}</p>
                )}
            </div>
        );
    }

    // ── Checkout button ─────────────────────────────────────────────────
    const { plan, isUpgrade, isDowngrade, popular } = props;

    async function handleCheckout() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Fout bij starten checkout');
            window.location.href = data.checkout_url;
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Onbekende fout');
            setLoading(false);
        }
    }

    const label = isDowngrade
        ? 'Downgraden'
        : isUpgrade
            ? 'Upgraden'
            : 'Selecteren';

    return (
        <div>
            <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{
                    backgroundColor: popular ? colors.blue : colors.gray100,
                    color: popular ? colors.white : colors.gray900,
                }}
            >
                {loading && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                )}
                {label}
            </button>
            {error && (
                <p className="text-xs mt-2 text-center" style={{ color: colors.red }}>{error}</p>
            )}
        </div>
    );
}
