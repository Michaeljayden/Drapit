// =============================================================================
// lib/shopify-tryon-packs.ts — one-time try-on packs for Shopify merchants
// =============================================================================
// Kept free of server-only code so the dashboard (client) can import it.
// Prices are USD: Shopify App Store billing is USD-denominated, same as the
// Managed Pricing plans in shopify.app.toml.
// =============================================================================

export interface ShopifyTryonPack {
    key: string;        // stable identifier stored in topup_transactions.pack_key
    tryons: number;
    priceUsd: number;
    name: string;       // shown on Shopify's approval page + invoice
}

export const SHOPIFY_TRYON_PACKS: ShopifyTryonPack[] = [
    { key: 'pack_100',  tryons: 100,  priceUsd: 14,  name: 'Drapit — 100 extra try-ons' },
    { key: 'pack_500',  tryons: 500,  priceUsd: 65,  name: 'Drapit — 500 extra try-ons' },
    { key: 'pack_1000', tryons: 1000, priceUsd: 120, name: 'Drapit — 1.000 extra try-ons' },
];

export function shopifyTryonPackByKey(key: string): ShopifyTryonPack | null {
    return SHOPIFY_TRYON_PACKS.find((p) => p.key === key) ?? null;
}
