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
                        text: `Task: Virtual try-on. Edit the person photo so they are wearing the garment shown in the second image.

CRITICAL IDENTITY RULES — these must be followed exactly:
- The output must show THE EXACT SAME PERSON as in image 1. Same face, same facial features, same skin tone, same hair color and style, same body shape, same height, same age appearance.
- DO NOT change the person's face or generate a new face. Copy it pixel-perfectly.
- DO NOT change the person's hairstyle or hair color.
- DO NOT change the person's skin tone or ethnicity.
- DO NOT change the person's body proportions or pose.
- DO NOT change the background. Keep it identical to image 1.
- DO NOT replace the person with a model or mannequin.

CLOTHING CHANGE — only this should change:
- Remove the clothing the person is currently wearing.
- Replace it with the garment shown in image 2, fitted naturally to their body.
- The garment must follow the body's pose, shape, and proportions realistically.
- Show natural fabric draping, wrinkles, folds, and shadows matching the scene lighting.
- Preserve the garment's exact color, pattern, texture, and design from image 2.

OUTPUT:
- Photorealistic fashion photograph quality.
- Same resolution and framing as image 1.
- The result should look like the person in image 1 actually put on the clothes from image 2 and a photo was taken.`,
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
