// =============================================================================
// Gemini VTON client — Virtual try-on via Google Gemini 2.0 Flash
// =============================================================================
// Replaces Replicate IDM-VTON with Gemini's multimodal image generation.
//
// How it works:
//   1. Download person photo + garment photo as base64
//   2. Send both to Gemini 2.0 Flash with a detailed VTON prompt
//   3. Gemini generates a new image of the person wearing the garment
//   4. Return result as Buffer (JPEG)
// =============================================================================

import { GoogleGenAI } from '@google/genai';

// ---------------------------------------------------------------------------
// Main export — generate VTON image via Gemini
// ---------------------------------------------------------------------------

export async function generateVtonWithGemini(
    humanImageUrl: string,
    garmentImageUrl: string
): Promise<Buffer> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Missing GEMINI_API_KEY environment variable');

    console.log('[gemini] Downloading images...');

    // Download both images in parallel
    const [humanRes, garmentRes] = await Promise.all([
        fetch(humanImageUrl),
        fetch(garmentImageUrl),
    ]);

    if (!humanRes.ok) throw new Error(`Failed to fetch human image: ${humanRes.status}`);
    if (!garmentRes.ok) throw new Error(`Failed to fetch garment image: ${garmentRes.status}`);

    const humanBase64 = Buffer.from(await humanRes.arrayBuffer()).toString('base64');
    const garmentBase64 = Buffer.from(await garmentRes.arrayBuffer()).toString('base64');

    const humanMime = (humanRes.headers.get('content-type') || 'image/jpeg').split(';')[0];
    const garmentMime = (garmentRes.headers.get('content-type') || 'image/jpeg').split(';')[0];

    console.log('[gemini] Sending to Gemini 2.0 Flash for VTON generation...');

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp-image-generation',
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        text: `You are a virtual try-on engine. You will receive two images. Study them carefully before proceeding.

IMAGE 1 is the PERSON. Memorize every detail of this person:`,
                    },
                    {
                        inlineData: {
                            mimeType: humanMime,
                            data: humanBase64,
                        },
                    },
                    {
                        text: `IMAGE 2 is the GARMENT to try on. Memorize every visual detail of this garment — its exact color(s), any pattern, print, graphic, logo or text on it, the neckline shape, collar style, sleeve length and cut, button or zipper placement, pocket details, hemline shape, fabric texture, and any other design details:`,
                    },
                    {
                        inlineData: {
                            mimeType: garmentMime,
                            data: garmentBase64,
                        },
                    },
                    {
                        text: `TASK: Generate a single photorealistic image of the person from IMAGE 1 wearing the garment from IMAGE 2.

PERSON — must stay 100% identical:
- Same face, facial features, expressions, skin tone, and complexion. Do not alter the face at all.
- Same hair: color, length, style, texture.
- Same body: proportions, shape, height, pose, and position.
- Same background: reproduce it exactly — do not blur, change, or replace it.
- Same lighting direction and color temperature on the person's skin.
- DO NOT replace the person with a stock model or different person.

GARMENT — must be reproduced exactly from IMAGE 2:
- Exact color(s): do not shift hue, saturation, or brightness.
- Exact print, pattern, or graphic: reproduce every detail — stripes, checks, florals, logos, text, artwork.
- Exact silhouette: neckline shape, collar type, sleeve length, hemline, fit (loose/fitted/oversized).
- Exact construction details: buttons, zippers, seams, pockets, cuffs, waistband.
- DO NOT simplify the design, merge patterns into solid colors, or invent details not present in IMAGE 2.
- Fit the garment naturally to the person's body pose — show realistic fabric draping, gravity-affected folds, and wrinkles.
- The garment's lighting and shadows must match the light source in IMAGE 1.

OUTPUT:
- Photorealistic fashion photo quality — indistinguishable from a real photograph.
- Same framing and crop as IMAGE 1.
- The result must look exactly like the person from IMAGE 1 physically put on the garment from IMAGE 2 and stood in the same spot.`,
                    },
                ],
            },
        ],
        config: {
            responseModalities: ['IMAGE', 'TEXT'],
        },
    });

    // Extract image from response
    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find(
        (p: { inlineData?: { data?: string; mimeType?: string }; text?: string }) => p.inlineData?.data
    );

    if (!imagePart?.inlineData?.data) {
        // Log any text response for debugging
        const textPart = parts.find(
            (p: { inlineData?: { data?: string; mimeType?: string }; text?: string }) => p.text
        );
        console.error('[gemini] No image in response. Text:', textPart?.text ?? 'none');
        throw new Error('Gemini did not return an image. The request may have been blocked by content policy.');
    }

    console.log('[gemini] Image generated successfully.');
    return Buffer.from(imagePart.inlineData.data, 'base64');
}
