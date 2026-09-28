// =============================================================================
// Gemini VTON — second layer of an outfit (bottom garment on a try-on result)
// =============================================================================
// Used ONLY when /api/tryon is called with `layer: "bottom"` (outfit/set flow).
// The regular single-garment path (lib/gemini.ts) is deliberately untouched:
// this file duplicates the download/generation plumbing so the two prompts can
// evolve independently.
//
// Input: the person image is the result of round 1 (person already wearing the
// new top). The garment image is a bottom (jeans/trousers/skirt/shorts) that
// may be shown on a fully dressed model. Only the lower-body garment may change.
// =============================================================================

import { GoogleGenAI } from '@google/genai';

const MODEL = 'gemini-3.1-flash-image-preview';

export async function generateBottomLayerWithGemini(
    humanImageUrl: string,
    garmentImageUrl: string
): Promise<Buffer> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Missing GEMINI_API_KEY environment variable');

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

    console.log('[gemini-outfit] Sending bottom-layer request to Gemini...');

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
        model: MODEL,
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        text: `You are a virtual try-on engine performing the SECOND step of an outfit try-on. The person in IMAGE 1 is already wearing their chosen top. In this step you change ONLY the lower-body garment.

IMAGE 1 is the PERSON. Memorize every detail — face, hair, body, pose, background, lighting, AND the upper-body clothing they are wearing right now (top, shirt, hoodie, jacket): that upper-body clothing must remain exactly as it is.`,
                    },
                    { inlineData: { mimeType: humanMime, data: humanBase64 } },
                    {
                        text: `IMAGE 2 is a PRODUCT PHOTO of a LOWER-BODY GARMENT (jeans, trousers, pants, skirt or shorts). It may be a flat packshot, a folded item, or a model wearing a complete outfit. From IMAGE 2 use ONLY the lower-body garment. IGNORE everything else in IMAGE 2: the model, their face, their top/shirt/jacket, their shoes, the background. None of those may be transferred.

Memorize the lower-body garment: exact color and wash, fabric, fit (slim/straight/loose/wide), rise, length, hem, pockets, seams, buttons/zipper, any distressing or pattern.`,
                    },
                    { inlineData: { mimeType: garmentMime, data: garmentBase64 } },
                    {
                        text: `TASK: Generate a single photorealistic image of the person from IMAGE 1 now wearing the lower-body garment from IMAGE 2, with everything else unchanged.

MUST STAY 100% IDENTICAL TO IMAGE 1:
- Face, facial features, expression, skin tone, hair.
- Body proportions, pose, position, hands, framing and crop.
- The UPPER-BODY CLOTHING the person is wearing in IMAGE 1 — same garment, same color, same print, same fit. Do NOT replace it with any top visible in IMAGE 2. Do NOT restyle, tuck or untuck it unless the new waistband physically requires a minimal, realistic adjustment at the hem.
- Shoes and accessories, unless a leg is now covered differently.
- Background and lighting — reproduce exactly.

LOWER-BODY GARMENT — reproduced exactly from IMAGE 2:
- Exact color, wash, fabric texture and pattern; do not shift hue or brightness.
- Exact fit, rise, length and construction details.
- Fit it naturally to the person's legs and pose with realistic draping, folds and gravity; shadows must match IMAGE 1's light source.
- If the legs are partly hidden (seated, behind a table, cropped), render only the visible part of the garment and leave the rest of the scene untouched. Never invent legs or extend the frame.

OUTPUT: photorealistic, same framing and crop as IMAGE 1 — it must look like the person from IMAGE 1 simply changed their trousers and stood in the same spot.`,
                    },
                ],
            },
        ],
        config: { responseModalities: ['IMAGE', 'TEXT'] },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find(
        (p: { inlineData?: { data?: string; mimeType?: string }; text?: string }) => p.inlineData?.data
    );
    if (!imagePart?.inlineData?.data) {
        const textPart = parts.find(
            (p: { inlineData?: { data?: string; mimeType?: string }; text?: string }) => p.text
        );
        console.error('[gemini-outfit] No image in response. Text:', textPart?.text ?? 'none');
        throw new Error('Gemini did not return an image. The request may have been blocked by content policy.');
    }
    console.log('[gemini-outfit] Image generated successfully.');
    return Buffer.from(imagePart.inlineData.data, 'base64');
}
