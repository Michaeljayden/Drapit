'use client';

import { useState } from 'react';
import { colors, componentStyles } from '@/lib/design-tokens';
import { TRYON_PACKS } from '@/lib/stripe';
import BillingActions from './BillingActions';

interface AutoTopupSettingsProps {
    shopId: string;
    autoTopupEnabled: boolean;
    autoTopupThresholdPct: number;
    autoTopupPackIndex: number;
    autoTopupMonthlyCap: number;
    autoTopupSpentThisMonth: number;
    extraTryons: number;
    billingSource: string | null;
    hasStripeCustomer: boolean;
    plan: string;
}

export default function AutoTopupSettings({
    autoTopupEnabled: initialEnabled,
    autoTopupThresholdPct: initialThreshold,
    autoTopupPackIndex: initialPackIndex,
    autoTopupMonthlyCap: initialCap,
    autoTopupSpentThisMonth,
    extraTryons,
    billingSource,
    hasStripeCustomer,
    plan,
}: AutoTopupSettingsProps) {
    const [enabled, setEnabled] = useState(initialEnabled);
    const [threshold, setThreshold] = useState(initialThreshold);
    const [packIndex, setPackIndex] = useState(initialPackIndex);
    const [monthlyCap, setMonthlyCap] = useState(initialCap);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const isShopify = billingSource === 'shopify';
    const isTrial = plan === 'trial';
    const isDisabled = isShopify || isTrial || !hasStripeCustomer;

    const selectedPack = TRYON_PACKS[packIndex] || TRYON_PACKS[1];
    const spentThisMonth = Number(autoTopupSpentThisMonth) || 0;

    async function handleSave() {
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/settings/auto-topup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    auto_topup_enabled: enabled,
                    auto_topup_threshold_pct: threshold,
                    auto_topup_pack_index: packIndex,
                    auto_topup_monthly_cap: monthlyCap,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: 'error', text: data.error || 'Er ging iets mis' });
                return;
            }

            setMessage({ type: 'success', text: 'Instellingen opgeslagen' });
        } catch {
            setMessage({ type: 'error', text: 'Kon instellingen niet opslaan' });
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className={componentStyles.dashboardCard}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Automatisch bijvullen</h3>
                {extraTryons > 0 && (
                    <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: colors.blueLight, color: colors.blue }}
                    >
                        {extraTryons} extra try-ons
                    </span>
                )}
            </div>

            {/* Disabled state messages */}
            {isShopify && (
                <p className="text-sm text-gray-500">
                    Auto top-up is alleen beschikbaar voor Stripe-klanten. Neem contact op als je deze functie wilt gebruiken.
                </p>
            )}
            {isTrial && !isShopify && (
                <p className="text-sm text-gray-500">
                    Upgrade je abonnement om auto top-up te gebruiken.
                </p>
            )}
            {!hasStripeCustomer && !isTrial && !isShopify && (
                <div className="space-y-3">
                    <p className="text-sm text-gray-500">
                        Voeg eerst een betaalmethode toe om auto top-up te gebruiken.
                    </p>
                    <div className="w-fit">
                        <BillingActions action="portal" />
                    </div>
                </div>
            )}

            {!isDisabled && (
                <>
                    {/* Toggle */}
                    <div className="flex items-center gap-3 mb-5">
                        <button
                            type="button"
                            role="switch"
                            aria-checked={enabled}
                            onClick={() => setEnabled(!enabled)}
                            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                            style={{
                                backgroundColor: enabled ? colors.blue : colors.gray300,
                            }}
                        >
                            <span
                                className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm"
                                style={{ transform: enabled ? 'translateX(22px)' : 'translateX(4px)' }}
                            />
                        </button>
                        <span className="text-sm font-medium text-gray-700">
                            Automatisch try-ons bijkopen
                        </span>
                    </div>

                    {enabled && (
                        <div className="space-y-4">
                            {/* Threshold slider */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Trigger bij verbruik van
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min={50}
                                        max={100}
                                        step={5}
                                        value={threshold}
                                        onChange={e => setThreshold(Number(e.target.value))}
                                        className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, ${colors.blue} 0%, ${colors.blue} ${((threshold - 50) / 50) * 100}%, ${colors.gray300} ${((threshold - 50) / 50) * 100}%, ${colors.gray300} 100%)`,
                                        }}
                                    />
                                    <span
                                        className="text-sm font-semibold min-w-[3rem] text-right"
                                        style={{ color: colors.blue }}
                                    >
                                        {threshold}%
                                    </span>
                                </div>
                            </div>

                            {/* Pack selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Pakket
                                </label>
                                <select
                                    value={packIndex}
                                    onChange={e => {
                                        const newIndex = Number(e.target.value);
                                        setPackIndex(newIndex);
                                        // Auto-adjust cap if it's lower than the new pack price
                                        const newPack = TRYON_PACKS[newIndex];
                                        if (newPack && monthlyCap < newPack.price) {
                                            setMonthlyCap(newPack.price);
                                        }
                                    }}
                                    className={componentStyles.input}
                                >
                                    {TRYON_PACKS.map((pack, i) => (
                                        <option key={i} value={i}>
                                            {pack.name} — €{pack.price}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Monthly cap */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Max per maand
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">€</span>
                                    <input
                                        type="number"
                                        min={selectedPack.price}
                                        step={1}
                                        value={monthlyCap}
                                        onChange={e => setMonthlyCap(Math.max(selectedPack.price, Number(e.target.value)))}
                                        className={componentStyles.input}
                                        style={{ paddingLeft: '1.75rem' }}
                                    />
                                </div>
                            </div>

                            {/* Spent this month indicator */}
                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <span>Besteed deze maand</span>
                                <span className="font-medium" style={{ color: spentThisMonth > 0 ? colors.amber : colors.gray500 }}>
                                    €{spentThisMonth.toFixed(0)} / €{monthlyCap}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Save button */}
                    <div className="mt-5">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`${componentStyles.buttonPrimary} ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {saving ? 'Opslaan...' : 'Opslaan'}
                        </button>
                    </div>

                    {/* Feedback message */}
                    {message && (
                        <div className="mt-4 space-y-3">
                            <p
                                className="text-sm font-medium"
                                style={{ color: message.type === 'success' ? colors.green : colors.red }}
                            >
                                {message.text}
                            </p>
                            {message.type === 'error' && message.text.includes('Stripe Portal') && (
                                <div className="w-fit">
                                    <BillingActions action="portal" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Info text */}
                    <p className="mt-4 text-xs text-gray-400 leading-relaxed">
                        Extra try-ons vervallen niet en worden pas verbruikt als je maandlimiet op is.
                        Bij een mislukte betaling wordt auto top-up automatisch uitgeschakeld.
                    </p>
                </>
            )}
        </div>
    );
}
