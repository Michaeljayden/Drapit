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
                        text: `You are a professional virtual try-on system for a fashion e-commerce platform.

The FIRST image shows a person (the shopper).
The SECOND image shows a clothing item (the garment to try on).

Your task: Generate a photorealistic image of the person wearing the clothing item.

Rules:
- Keep the person's face, hairstyle, skin tone, body shape, and pose EXACTLY the same
- Keep the original background EXACTLY the same
- Replace ONLY the clothing with the garment from the second image
- The clothing must fit naturally on the person's body proportions
- Ensure realistic fabric draping, folds, creases, and shadows
- Match the lighting of the original photo
- The result must look like a real fashion photograph — not AI-generated
- Output a high quality, sharp image`,
                    },
                    {
                        inlineData: {
                            mimeType: humanMime,
                            data: humanBase64,
                        },
                    },
                    {
                        inlineData: {
                            mimeType: garmentMime,
                            data: garmentBase64,
                        },
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
