// =============================================================================
// Drapit Studio — Gemini AI generation service
// =============================================================================
// Handles three generation modes:
//   1. virtual-model  → AI fashion model wearing the uploaded garment
//   2. product-only   → Professional product shot without a model
//   3. video-360      → Multi-angle product shots (4 perspectives)
// =============================================================================

import { GoogleGenAI } from '@google/genai';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ClothingImages {
  top?: { front?: string; back?: string };    // base64 JPEG/PNG
  bottom?: { front?: string };
  outerwear?: { front?: string };
}

export interface WatermarkOptions {
  enabled: boolean;
  text: string;
  position: string;
  opacity: number;
  size: number;
}

export interface ClothingLogo {
  image: string; // base64
  position: string;
}

export interface StudioGenerationParams {
  mode: 'virtual-model' | 'product-only' | 'video-360';
  clothing: ClothingImages;

  // Model (virtual-model only)
  gender?: string;
  ethnicityPrompt?: string;
  age?: number;
  weight?: number;
  height?: number;
  bodyType?: string;
  customModelPrompt?: string;

  // Pose & expression (virtual-model only)
  posePrompt?: string;
  expressionPrompt?: string;
  framingPrompt?: string;
  rotationAngle?: number;

  // Environment
  backgroundPrompt: string;
  lightingPrompt: string;
  timeOfDayPrompt?: string;
  propText?: string;

  // Camera
  lensPrompt?: string;
  bokeh?: number;

  // Branding
  clothingLogo?: ClothingLogo;

  // Batch
  numVariations?: number;
}

export interface StudioGenerationResult {
  images: string[]; // base64 data URLs
  mode: string;
}

// ---------------------------------------------------------------------------
// Gemini client helper
// ---------------------------------------------------------------------------

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');
  return new GoogleGenAI({ apiKey });
}

// ---------------------------------------------------------------------------
// Build clothing description from images
// ---------------------------------------------------------------------------

function buildClothingParts(clothing: ClothingImages): { text: string; inlineData: { mimeType: string; data: string } }[] {
  const parts: { text: string; inlineData: { mimeType: string; data: string } }[] = [];

  if (clothing.top?.front) {
    parts.push(
      { text: 'TOP GARMENT (front view):', inlineData: null as any },
      { text: null as any, inlineData: { mimeType: 'image/jpeg', data: clothing.top.front } }
    );
  }
  if (clothing.top?.back) {
    parts.push(
      { text: 'TOP GARMENT (back view):', inlineData: null as any },
      { text: null as any, inlineData: { mimeType: 'image/jpeg', data: clothing.top.back } }
    );
  }
  if (clothing.bottom?.front) {
    parts.push(
      { text: 'BOTTOM GARMENT (front view):', inlineData: null as any },
      { text: null as any, inlineData: { mimeType: 'image/jpeg', data: clothing.bottom.front } }
    );
  }
  if (clothing.outerwear?.front) {
    parts.push(
      { text: 'OUTERWEAR (front view):', inlineData: null as any },
      { text: null as any, inlineData: { mimeType: 'image/jpeg', data: clothing.outerwear.front } }
    );
  }

  return parts.filter(p => p.text !== null || p.inlineData !== null);
}

// ---------------------------------------------------------------------------
// Build content parts (filter nulls)
// ---------------------------------------------------------------------------

type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

function buildParts(rawParts: { text?: string | null; inlineData?: { mimeType: string; data: string } | null }[]): GeminiPart[] {
  return rawParts
    .filter(p => p.text != null || p.inlineData != null)
    .map(p => {
      if (p.inlineData) return { inlineData: p.inlineData };
      return { text: p.text as string };
    });
}

// ---------------------------------------------------------------------------
// Extract image from Gemini response
// ---------------------------------------------------------------------------

function extractImage(response: any): string | null {
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p: any) => p.inlineData?.data);
  if (!imagePart?.inlineData?.data) return null;
  const { mimeType, data } = imagePart.inlineData;
  return `data:${mimeType || 'image/jpeg'};base64,${data}`;
}

// ---------------------------------------------------------------------------
// Mode 1: Virtual Model Image
// ---------------------------------------------------------------------------

async function generateVirtualModelImage(params: StudioGenerationParams): Promise<string> {
  const ai = getClient();

  const bokehDesc =
    (params.bokeh ?? 5) <= 3
      ? 'very shallow depth of field, strongly blurred background (f/1.4–f/2)'
      : (params.bokeh ?? 5) <= 6
      ? 'moderate depth of field, naturally blurred background (f/2.8–f/4)'
      : 'deep focus, sharp background (f/8–f/11)';

  const logoInstruction = params.clothingLogo
    ? `\n- The garment has a small brand logo placed at the ${params.clothingLogo.position.replace(/_/g, ' ')} — reproduce it exactly.`
    : '';

  const propInstruction = params.propText
    ? `\n- Include the following prop: ${params.propText}`
    : '';

  const timeInstruction = params.timeOfDayPrompt
    ? `\n- Time of day atmosphere: ${params.timeOfDayPrompt}`
    : '';

  const customModelInstruction = params.customModelPrompt
    ? `\n- Additional model details: ${params.customModelPrompt}`
    : '';

  const prompt = `You are a world-class AI fashion photographer. Generate a single photorealistic professional fashion photography image based on the garment(s) provided.

═══ MODEL ═══
- Gender: ${params.gender || 'female'}
- Ethnicity: ${params.ethnicityPrompt || 'caucasian, European features'}
- Age: approximately ${params.age || 25} years old
- Build: ${params.bodyType || 'slim build, model physique'}
- Height: approximately ${params.height || 175}cm${customModelInstruction}

═══ OUTFIT ═══
Study the uploaded garment image(s) carefully. Reproduce EVERY detail exactly:
- Exact colors (do not shift hue or saturation)
- All patterns, prints, graphics, logos, and text
- Exact silhouette: neckline, collar, sleeve length, hemline, fit
- All construction details: buttons, zippers, seams, pockets, cuffs
- Realistic fabric draping, gravity folds, natural wrinkles${logoInstruction}

═══ SHOT ═══
- Framing: ${params.framingPrompt || 'full body shot, head to toe'}
- Pose: ${params.posePrompt || 'natural standing pose, facing forward'}
- Expression: ${params.expressionPrompt || 'natural, pleasant'}
- Camera: ${params.lensPrompt || '50mm standard lens, natural perspective'}
- Depth of field: ${bokehDesc}${propInstruction}

═══ ENVIRONMENT ═══
- Background: ${params.backgroundPrompt}
- Lighting: ${params.lightingPrompt}${timeInstruction}

═══ TECHNICAL ═══
- Professional high-fashion editorial quality
- Sharp focus on model and garment
- Realistic photographic rendering — indistinguishable from a real photo
- Magazine quality, 2K resolution appearance
- Do NOT add text, watermarks, or borders`;

  const clothingParts = buildClothingParts(params.clothing);

  const contents: GeminiPart[] = buildParts([
    { text: prompt },
    ...clothingParts.map(p => p.text != null ? { text: p.text } : { inlineData: p.inlineData }),
    params.clothingLogo ? { text: `\nBRAND LOGO to place on garment (position: ${params.clothingLogo.position.replace(/_/g, ' ')}):` } : null,
    params.clothingLogo ? { inlineData: { mimeType: 'image/jpeg', data: params.clothingLogo.image } } : null,
  ].filter(Boolean) as any);

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp-image-generation',
    contents: [{ role: 'user', parts: contents }],
    config: { responseModalities: ['IMAGE', 'TEXT'] },
  });

  const image = extractImage(response);
  if (!image) throw new Error('Gemini did not return an image for virtual-model mode.');
  return image;
}

// ---------------------------------------------------------------------------
// Mode 2: Product-Only Photo
// ---------------------------------------------------------------------------

async function generateProductPhoto(params: StudioGenerationParams): Promise<string> {
  const ai = getClient();

  const logoInstruction = params.clothingLogo
    ? `\n- Include the brand logo at the ${params.clothingLogo.position.replace(/_/g, ' ')} of the garment.`
    : '';

  const prompt = `You are a world-class product photographer specializing in fashion and apparel. Create a single professional product photography image of the garment(s) shown.

═══ GARMENT ═══
Reproduce the product EXACTLY as shown in the uploaded image(s):
- Exact color(s) — match perfectly
- All patterns, prints, textures, graphics, logos, and text
- Full garment silhouette: shape, neckline, hemline, sleeves, fit
- All details: buttons, zippers, seams, pockets, cuffs, waistband
- Natural fabric texture and subtle fold/crease details${logoInstruction}

═══ PRESENTATION ═══
- Display the garment flat-lay style OR as a ghost mannequin (invisible mannequin) OR floating/hanging — choose whichever looks most professional and clean
- The garment should appear perfectly pressed with natural fabric drape
- All design details should be clearly visible

═══ ENVIRONMENT ═══
- Background: ${params.backgroundPrompt}
- Lighting: ${params.lightingPrompt} — illuminate the garment evenly to show true colors and texture
- Camera: ${params.lensPrompt || '50mm standard lens'}

═══ TECHNICAL ═══
- Professional commercial product photography
- Sharp focus across the entire garment
- True-to-life color reproduction
- Clean, high-end e-commerce quality image
- No model or person
- Do NOT add text, watermarks, or borders`;

  const clothingParts = buildClothingParts(params.clothing);

  const contents: GeminiPart[] = buildParts([
    { text: prompt },
    ...clothingParts.map(p => p.text != null ? { text: p.text } : { inlineData: p.inlineData }),
    params.clothingLogo ? { text: `\nBRAND LOGO (position: ${params.clothingLogo.position.replace(/_/g, ' ')}):` } : null,
    params.clothingLogo ? { inlineData: { mimeType: 'image/jpeg', data: params.clothingLogo.image } } : null,
  ].filter(Boolean) as any);

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp-image-generation',
    contents: [{ role: 'user', parts: contents }],
    config: { responseModalities: ['IMAGE', 'TEXT'] },
  });

  const image = extractImage(response);
  if (!image) throw new Error('Gemini did not return an image for product-only mode.');
  return image;
}

// ---------------------------------------------------------------------------
// Mode 3: 360° Multi-angle product shots
// ---------------------------------------------------------------------------

const ROTATION_ANGLES = [
  { label: 'Front', instruction: 'Front view — directly facing forward (0°). Show the front of the garment.' },
  { label: 'Three-Quarter Right', instruction: 'Three-quarter right angle view (45°). Show the right side detail.' },
  { label: 'Side', instruction: 'Direct right side view (90°). Show the complete right profile.' },
  { label: 'Back', instruction: 'Back view — directly from behind (180°). Show all back details.' },
];

async function generateProductRotation(params: StudioGenerationParams): Promise<string[]> {
  const ai = getClient();

  const results: string[] = [];

  for (const angle of ROTATION_ANGLES) {
    const prompt = `You are a world-class product photographer. Create a professional product image of the garment shown, specifically from this angle: ${angle.instruction}

═══ GARMENT ═══
Reproduce the garment EXACTLY as shown — same colors, patterns, textures, logos, and design details.
Adapt naturally to the viewing angle: show appropriate back/side details for that perspective.

═══ ENVIRONMENT ═══
- Background: ${params.backgroundPrompt}
- Lighting: ${params.lightingPrompt}
- Camera: consistent product photography setup across all angles

═══ TECHNICAL ═══
- Professional 360° product photography quality
- Ghost mannequin or flat-lay presentation (no model)
- Sharp, commercially clean result
- Same lighting and background as if it is one consistent photo session
- Do NOT add text, watermarks, labels, or angle annotations`;

    const clothingParts = buildClothingParts(params.clothing);
    const contents: GeminiPart[] = buildParts([
      { text: prompt },
      ...clothingParts.map(p => p.text != null ? { text: p.text } : { inlineData: p.inlineData }),
    ]);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp-image-generation',
        contents: [{ role: 'user', parts: contents }],
        config: { responseModalities: ['IMAGE', 'TEXT'] },
      });

      const image = extractImage(response);
      if (image) results.push(image);
    } catch (err) {
      console.error(`[studio] Failed to generate ${angle.label} view:`, err);
    }
  }

  if (results.length === 0) throw new Error('Geen enkel 360°-beeld kon worden gegenereerd.');
  return results;
}

// ---------------------------------------------------------------------------
// Main export — dispatch based on mode
// ---------------------------------------------------------------------------

export async function generateStudioImages(params: StudioGenerationParams): Promise<StudioGenerationResult> {
  const variations = params.numVariations ?? 1;

  if (params.mode === 'video-360') {
    // 360° mode generates 4 angles — always 1 "set"
    const images = await generateProductRotation(params);
    return { images, mode: 'video-360' };
  }

  if (params.mode === 'product-only') {
    const promises = Array.from({ length: variations }, () => generateProductPhoto(params));
    const images = await Promise.all(promises);
    return { images, mode: 'product-only' };
  }

  // Default: virtual-model
  const promises = Array.from({ length: variations }, () => generateVirtualModelImage(params));
  const images = await Promise.all(promises);
  return { images, mode: 'virtual-model' };
}
