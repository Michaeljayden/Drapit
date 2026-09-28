'use client';

// =============================================================================
// ShopifyTryonPacks — "Extra try-ons kopen" for Shopify-billed merchants
// =============================================================================
// Shows the one-time packs, starts the purchase via /api/billing/shopify/topup
// and sends the merchant to Shopify's approval page. Result banners are driven
// by ?topup=success|declined|error on the billing page.
// =============================================================================

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { colors, typography, componentStyles } from '@/lib/design-tokens';
import { SHOPIFY_TRYON_PACKS } from '@/lib/shopify-tryon-packs';

interface Props {
    extraTryons: number;
    tryonsUsed: number;
    totalLimit: number;
}

export default function ShopifyTryonPacks({ extraTryons, tryonsUsed, totalLimit }: Props) {
    const params = useSearchParams();
    const [loadingKey, setLoadingKey] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const result = params.get('topup');
    const creditedTryons = params.get('tryons');
    const nearLimit = totalLimit > 0 && tryonsUsed / totalLimit >= 0.8;

    async function buy(packKey: string) {
        setLoadingKey(packKey);
        setError(null);
        try {
            const res = await fetch('/api/billing/shopify/topup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pack_key: packKey }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Aankoop starten mislukt');
            window.location.href = data.confirmation_url;
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Onbekende fout');
            setLoadingKey(null);
        }
    }

    return (
        <div className={componentStyles.dashboardCard}>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
                <h2 className={typography.h3} style={{ color: colors.gray900 }}>Extra try-ons kopen</h2>
                {extraTryons > 0 && (
                    <span
                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ backgroundColor: colors.blueLight, color: colors.blue }}
                    >
                        {extraTryons.toLocaleString('nl-NL')} extra beschikbaar
                    </span>
                )}
            </div>
            <p className="text-sm mb-4" style={{ color: colors.gray500 }}>
                Bundel bijna op? Koop eenmalig extra try-ons. Ze verlopen niet en worden pas gebruikt als je maandbundel op is.
                Betaling loopt via je Shopify-factuur.
            </p>

            {result === 'success' && (
                <div className="text-sm rounded-xl px-4 py-3 mb-4" style={{ backgroundColor: '#DCFCE7', color: '#166534' }}>
                    Gelukt — {creditedTryons ? `${Number(creditedTryons).toLocaleString('nl-NL')} extra try-ons` : 'de extra try-ons'} zijn toegevoegd aan je shop.
                </div>
            )}
            {result === 'declined' && (
                <div className="text-sm rounded-xl px-4 py-3 mb-4" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                    De aankoop is niet goedgekeurd in Shopify. Er is niets in rekening gebracht.
                </div>
            )}
            {result === 'error' && (
                <div className="text-sm rounded-xl px-4 py-3 mb-4" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                    De aankoop kon niet worden bevestigd. Probeer het opnieuw of neem contact op via support.
                </div>
            )}
            {nearLimit && result !== 'success' && (
                <div className="text-sm rounded-xl px-4 py-3 mb-4" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                    Je hebt {tryonsUsed.toLocaleString('nl-NL')} van {totalLimit.toLocaleString('nl-NL')} try-ons gebruikt. Zodra de limiet is bereikt, ziet de shopper geen try-on meer.
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SHOPIFY_TRYON_PACKS.map((pack) => {
                    const perTryon = pack.priceUsd / pack.tryons;
                    const busy = loadingKey === pack.key;
                    return (
                        <div
                            key={pack.key}
                            className="rounded-xl p-4 flex flex-col gap-3"
                            style={{ border: `1px solid ${colors.gray200}` }}
                        >
                            <div>
                                <div className="text-lg font-semibold" style={{ color: colors.gray900 }}>
                                    {pack.tryons.toLocaleString('nl-NL')} try-ons
                                </div>
                                <div className="text-xs mt-0.5" style={{ color: colors.gray500 }}>
                                    ${pack.priceUsd} eenmalig · ${perTryon.toFixed(2)} per try-on
                                </div>
                            </div>
                            <button
                                onClick={() => buy(pack.key)}
                                disabled={loadingKey !== null}
                                className="text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors duration-150 disabled:opacity-50"
                                style={{ backgroundColor: colors.blue, color: colors.white }}
                            >
                                {busy ? 'Naar Shopify…' : 'Kopen via Shopify'}
                            </button>
                        </div>
                    );
                })}
            </div>

            {error && (
                <p className="text-xs mt-3" style={{ color: colors.red }}>{error}</p>
            )}
            <p className="text-xs mt-4" style={{ color: colors.gray500 }}>
                Prijzen in USD, net als je Shopify-abonnement. Je bevestigt de aankoop op de beveiligde Shopify-pagina.
            </p>
        </div>
    );
}
