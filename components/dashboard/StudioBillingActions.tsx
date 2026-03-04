'use client';

import { useState } from 'react';
import { colors } from '@/lib/design-tokens';
import type { StudioPlan } from '@/lib/supabase/types';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface StudioCheckoutProps {
    action: 'studio-checkout';
    plan: StudioPlan;
    isUpgrade?: boolean;
    isDowngrade?: boolean;
    popular?: boolean;
}

interface StudioCreditsProps {
    action: 'studio-credits';
    packIndex: number;          // 0 = 50 credits, 1 = 150 credits, 2 = 300 credits
    popular?: boolean;
}

type StudioBillingActionsProps = StudioCheckoutProps | StudioCreditsProps;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function StudioBillingActions(props: StudioBillingActionsProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ── Studio plan checkout ─────────────────────────────────────────────
    if (props.action === 'studio-checkout') {
        const { plan, isUpgrade, isDowngrade, popular } = props;

        async function handleStudioCheckout() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/stripe/studio-checkout', {
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
                    onClick={handleStudioCheckout}
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{
                        backgroundColor: popular ? '#7C3AED' : colors.gray100,
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

    // ── Credit pack purchase ─────────────────────────────────────────────
    const { packIndex, popular } = props;

    async function handleCreditPurchase() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/stripe/studio-credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pack_index: packIndex }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Fout bij starten checkout');
            window.location.href = data.checkout_url;
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Onbekende fout');
            setLoading(false);
        }
    }

    return (
        <div>
            <button
                onClick={handleCreditPurchase}
                disabled={loading}
                className="w-full py-2 rounded-xl text-sm font-semibold transition-colors duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{
                    backgroundColor: popular ? '#7C3AED' : colors.gray100,
                    color: popular ? colors.white : colors.gray900,
                }}
            >
                {loading && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                )}
                Kopen
            </button>
            {error && (
                <p className="text-xs mt-1 text-center" style={{ color: colors.red }}>{error}</p>
            )}
        </div>
    );
}
