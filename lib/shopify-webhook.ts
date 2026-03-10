// =============================================================================
// lib/shopify-webhook.ts — Shopify webhook HMAC verification
// =============================================================================
// Used by all Shopify GDPR webhook endpoints to verify that incoming requests
// are genuinely from Shopify.
//
// Shopify sends the HMAC in the X-Shopify-Hmac-Sha256 header (Base64-encoded).
// We recompute it using HMAC-SHA256 over the raw request body with our
// SHOPIFY_API_SECRET, then compare in constant time.
// =============================================================================

/**
 * Verifies the Shopify webhook HMAC signature.
 *
 * @param rawBody  - The raw request body as a string (do NOT parse as JSON first)
 * @param hmacHeader - Value of the X-Shopify-Hmac-Sha256 header
 * @returns true if the signature is valid, false otherwise
 */
export async function verifyShopifyWebhookHmac(
    rawBody: string,
    hmacHeader: string | null,
): Promise<boolean> {
    const secret = process.env.SHOPIFY_API_SECRET;

    if (!secret) {
        console.warn('[shopify-webhook] SHOPIFY_API_SECRET not set — skipping HMAC check');
        return true; // dev fallback; never reaches prod without the secret
    }

    if (!hmacHeader) return false;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const msgData = encoder.encode(rawBody);

    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, msgData);

    // Shopify sends Base64-encoded HMAC
    const computedBase64 = btoa(
        Array.from(new Uint8Array(signatureBuffer))
            .map((b) => String.fromCharCode(b))
            .join(''),
    );

    // Constant-time comparison to prevent timing attacks
    if (computedBase64.length !== hmacHeader.length) return false;
    let mismatch = 0;
    for (let i = 0; i < computedBase64.length; i++) {
        mismatch |= computedBase64.charCodeAt(i) ^ hmacHeader.charCodeAt(i);
    }
    return mismatch === 0;
}
