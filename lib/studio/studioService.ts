// =============================================================================
// Drapit Studio — Gemini AI generation service (quality-optimised)
// =============================================================================
// Handles three generation modes:
//   1. virtual-model  → AI fashion model wearing the uploaded garment
//   2. product-only   → Professional product shot without a model
//   3. video-360      → Multi-angle product shots (4 perspectives)
//
// Quality strategy:
//   Step 1 — Analyse garment(s): ask Gemini to produce a hyper-detailed written
//             description of every visual property (colour, print, logo, cut…).
//   Step 2 — Generate image: feed the analysis + original images back into the
//             generation prompt so the model has maximum context.
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
// Model names
// ---------------------------------------------------------------------------

// Best available image generation model via Gemini API
const GENERATION_MODEL = 'gemini-2.0-flash-preview-image-generation';

// Text-only model for garment analysis (fast, accurate)
const ANALYSIS_MODEL = 'gemini-2.0-flash';

// ---------------------------------------------------------------------------
// Gemini client helper
// ---------------------------------------------------------------------------

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');
  return new GoogleGenAI({ apiKey });
}

// ---------------------------------------------------------------------------
// Types for Gemini parts
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
// Build clothing image parts for Gemini
// ---------------------------------------------------------------------------

function buildClothingImageParts(clothing: ClothingImages): GeminiPart[] {
  const parts: GeminiPart[] = [];

  if (clothing.top?.front) {
    parts.push({ text: 'KLEDINGSTUK — BOVENSTUK (voorkant):' });
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: clothing.top.front } });
  }
  if (clothing.top?.back) {
    parts.push({ text: 'KLEDINGSTUK — BOVENSTUK (achterkant):' });
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: clothing.top.back } });
  }
  if (clothing.bottom?.front) {
    parts.push({ text: 'KLEDINGSTUK — ONDERSTUK (voorkant):' });
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: clothing.bottom.front } });
  }
  if (clothing.outerwear?.front) {
    parts.push({ text: 'KLEDINGSTUK — BOVENLAAG (voorkant):' });
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: clothing.outerwear.front } });
  }

  return parts;
}

// ---------------------------------------------------------------------------
// Step 1: Garment analysis — produces a rich text description
// ---------------------------------------------------------------------------

async function analyseGarment(
  ai: GoogleGenAI,
  clothing: ClothingImages,
  logo?: ClothingLogo
): Promise<string> {
  const analysisPrompt = `You are an expert fashion analyst and technical garment descriptor. 
Carefully examine the uploaded garment image(s) and produce an EXTREMELY DETAILED written description.

Your description MUST cover ALL of the following without exception:

1. GARMENT TYPE & SILHOUETTE
   - Exact garment type (e.g. crew-neck sweatshirt, relaxed-fit straight-leg jeans)
   - Fit: slim / regular / relaxed / oversized
   - Length: crop / regular / longline / midi / maxi
   - Neckline shape, collar style
   - Sleeve type and length (in approximate cm or % of arm length)
   - Hemline shape and finish

2. COLOURS (be extremely precise)
   - Primary colour(s): describe as specific as possible (e.g. "muted sage green, similar to #8FAF8F", NOT just "green")
   - Secondary/accent colours with exact placement
   - Any gradients, colour blocks, or tonal variations

3. PRINTS, GRAPHICS & TEXT (CRITICAL — reproduce exactly)
   - Every piece of text: exact wording, punctuation, capitalisation, letter spacing
   - Font style: serif / sans-serif / script / bold / italic / condensed
   - Font colour and any outline or shadow effects
   - Graphic elements: logo shape, icon, emblem — describe shape, symbol, style in detail
   - Exact position on garment (e.g. "centred on chest, approx 8cm below neckline, spanning 60% of chest width")
   - Size relative to garment
   - Any distressed, vintage, or worn-in appearance of the print

4. FABRIC & TEXTURE
   - Apparent material (cotton, denim, linen, knit, satin, etc.)
   - Texture: smooth, brushed, ribbed, waffle, terry cloth, etc.
   - Sheen level: matte / semi-matte / slight sheen / glossy

5. CONSTRUCTION DETAILS
   - Seam placement and style (e.g. "flatlock seams at shoulders")
   - Pockets: position, type, size
   - Closures: buttons, zip, snap buttons — material, colour, style
   - Cuffs, waistband, hem finish
   - Any embroidery, appliqué, patches, studs, or 3D elements

6. BRANDING (if visible)
   - Label or tag position
   - Any woven or printed branding

Write in precise, technical English. Be exhaustive — this description will be used as the single source of truth for recreating the garment in a photorealistic image. Every detail you mention will be reproduced; every detail you omit may be lost.`;

  const parts: GeminiPart[] = [
    { text: analysisPrompt },
    ...buildClothingImageParts(clothing),
  ];

  if (logo) {
    parts.push({ text: `\nBRAND LOGO (to be placed at "${logo.position.replace(/_/g, ' ')}"):` });
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: logo.image } });
    parts.push({ text: 'Also describe this logo in extreme detail: shape, colours, symbols, text, style.' });
  }

  const response = await ai.models.generateContent({
    model: ANALYSIS_MODEL,
    contents: [{ role: 'user', parts }],
  });

  const text = response.candidates?.[0]?.content?.parts
    ?.filter((p: any) => p.text)
    ?.map((p: any) => p.text)
    ?.join('\n') ?? '';

  if (!text || text.length < 50) {
    return 'A garment as shown in the reference image(s). Reproduce all visible details exactly.';
  }

  return text;
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
// Mode 1: Virtual Model Image (two-step: analyse → generate)
// ---------------------------------------------------------------------------

async function generateVirtualModelImage(params: StudioGenerationParams): Promise<string> {
  const ai = getClient();

  // ── Step 1: Analyse garment ──
  const garmentAnalysis = await analyseGarment(ai, params.clothing, params.clothingLogo);

  // ── Step 2: Generate image ──
  const bokehDesc =
    (params.bokeh ?? 5) <= 3
      ? 'very shallow depth of field, strongly blurred background (f/1.4–f/2)'
      : (params.bokeh ?? 5) <= 6
        ? 'moderate depth of field, naturally blurred background (f/2.8–f/4)'
        : 'deep focus, sharp background (f/8–f/11)';

  const propInstruction = params.propText
    ? `\n- Include the following prop: ${params.propText}`
    : '';

  const timeInstruction = params.timeOfDayPrompt
    ? `\n- Time of day atmosphere: ${params.timeOfDayPrompt}`
    : '';

  const customModelInstruction = params.customModelPrompt
    ? `\n- Additional model details: ${params.customModelPrompt}`
    : '';

  const logoPlacementInstruction = params.clothingLogo
    ? `\n- A custom brand logo is on the garment at position: "${params.clothingLogo.position.replace(/_/g, ' ')}". The logo reference image is included below — reproduce it with PIXEL-PERFECT accuracy: every line, colour, shape, and symbol must match exactly.`
    : '';

  const prompt = `You are a world-class AI fashion photographer producing editorial-quality campaign imagery.

══════════════════════════════════════════════════════
EXPERT GARMENT ANALYSIS (USE AS ABSOLUTE REFERENCE)
══════════════════════════════════════════════════════
The following technical analysis describes every detail of the garment. This is your GROUND TRUTH:

${garmentAnalysis}

══════════════════════════════════════════════════════
CRITICAL REPRODUCTION RULES
══════════════════════════════════════════════════════
You MUST reproduce the garment with extreme fidelity to the analysis above AND the reference images provided:

• PRINTS, LOGOS & TEXT — TOP PRIORITY:
  - Every letter, number, symbol: exact wording, font, weight, style, colour
  - Exact position, size, and proportion on the garment
  - Do NOT simplify, paraphrase, or alter any text or graphic
  - Render each letterform individually with correct spacing
  - Match all colours to the reference exactly (correct hue, saturation, brightness)${logoPlacementInstruction}

• COLOURS: Match exact shades from the reference — no hue or saturation shifts
• SILHOUETTE: Exact neckline, collar, sleeve length, hemline, fit
• CONSTRUCTION: All buttons, zippers, seams, pockets, cuffs as shown
• FABRIC DRAPE: Realistic gravity folds and natural wrinkles for the material type

══════════════════════════════════════════════════════
MODEL
══════════════════════════════════════════════════════
- Gender: ${params.gender || 'female'}
- Ethnicity: ${params.ethnicityPrompt || 'caucasian, European features'}
- Age: approximately ${params.age || 25} years old
- Build: ${params.bodyType || 'slim build, model physique'}
- Height: approximately ${params.height || 175}cm${customModelInstruction}

══════════════════════════════════════════════════════
SHOT COMPOSITION
══════════════════════════════════════════════════════
- Framing: ${params.framingPrompt || 'full body shot, head to toe'}
- Pose: ${params.posePrompt || 'natural standing pose, facing forward'}
- Expression: ${params.expressionPrompt || 'natural, pleasant, relaxed'}
- Camera: ${params.lensPrompt || '50mm standard lens, natural perspective, no distortion'}
- Depth of field: ${bokehDesc}${propInstruction}

══════════════════════════════════════════════════════
ENVIRONMENT
══════════════════════════════════════════════════════
- Background: ${params.backgroundPrompt}
- Lighting: ${params.lightingPrompt}${timeInstruction}

══════════════════════════════════════════════════════
TECHNICAL OUTPUT REQUIREMENTS
══════════════════════════════════════════════════════
- Photorealistic — indistinguishable from a real professional fashion photograph
- High-end editorial / campaign quality (Vogue, Arena Homme+)
- Ultra-sharp focus on model and ALL garment details simultaneously
- True-to-life colour reproduction throughout
- Maximum detail in print / logo areas — these must be razor sharp
- Render as if captured on a high-resolution medium-format camera
- Do NOT add text, watermarks, frames, or UI elements of any kind`;

  const contents: GeminiPart[] = [
    { text: prompt },
    { text: '\n\n── REFERENCE IMAGES (use for exact garment reproduction) ──' },
    ...buildClothingImageParts(params.clothing),
  ];

  if (params.clothingLogo) {
    contents.push({ text: `\n── BRAND LOGO REFERENCE (place at: "${params.clothingLogo.position.replace(/_/g, ' ')}") ──` });
    contents.push({ inlineData: { mimeType: 'image/jpeg', data: params.clothingLogo.image } });
  }

  const response = await ai.models.generateContent({
    model: GENERATION_MODEL,
    contents: [{ role: 'user', parts: contents }],
    config: { responseModalities: ['IMAGE', 'TEXT'] },
  });

  const image = extractImage(response);
  if (!image) throw new Error('Gemini did not return an image for virtual-model mode.');
  return image;
}

// ---------------------------------------------------------------------------
// Mode 2: Product-Only Photo (two-step: analyse → generate)
// ---------------------------------------------------------------------------

async function generateProductPhoto(params: StudioGenerationParams): Promise<string> {
  const ai = getClient();

  // ── Step 1: Analyse garment ──
  const garmentAnalysis = await analyseGarment(ai, params.clothing, params.clothingLogo);

  // ── Step 2: Generate image ──
  const logoPlacementInstruction = params.clothingLogo
    ? `\n- The garment has a custom brand logo at position: "${params.clothingLogo.position.replace(/_/g, ' ')}". The logo reference image is included — reproduce it with PIXEL-PERFECT fidelity.`
    : '';

  const prompt = `You are a world-class commercial product photographer specialising in fashion and apparel.

══════════════════════════════════════════════════════
EXPERT GARMENT ANALYSIS (USE AS ABSOLUTE REFERENCE)
══════════════════════════════════════════════════════
${garmentAnalysis}

══════════════════════════════════════════════════════
CRITICAL REPRODUCTION RULES
══════════════════════════════════════════════════════
• PRINTS, LOGOS & TEXT — TOP PRIORITY:
  - Reproduce every character, graphic, and symbol with pixel-perfect accuracy
  - Exact font, weight, colour, position, size, and proportion
  - Do NOT change, simplify, or omit any text or graphic element
  - Each print area must be razor-sharp and fully legible${logoPlacementInstruction}

• COLOURS: Exact colour match — no shifts in hue, saturation, or brightness
• SILHOUETTE: Faithful reproduction of neckline, cut, hemline, and fit
• DETAILS: All construction details (stitching, zippers, pockets, cuffs) clearly visible
• FABRIC: Realistic drape with authentic texture representation

══════════════════════════════════════════════════════
PRESENTATION STYLE
══════════════════════════════════════════════════════
- ghost mannequin (invisible mannequin) — the garment appears as if worn but no body visible
- The garment should appear perfectly presented with natural fabric drape
- All design details must be fully visible and in sharp focus
- No model or person in the image

══════════════════════════════════════════════════════
ENVIRONMENT
══════════════════════════════════════════════════════
- Background: ${params.backgroundPrompt}
- Lighting: ${params.lightingPrompt} — illuminate the garment evenly to show true colours and texture with no harsh shadows obscuring details
- Camera: ${params.lensPrompt || '80–100mm macro-capable lens, no distortion, product photography standard'}

══════════════════════════════════════════════════════
TECHNICAL OUTPUT REQUIREMENTS
══════════════════════════════════════════════════════
- Professional high-end e-commerce / lookbook quality
- Ultra-sharp focus across the entire garment — especially print areas
- True colour reproduction as if under calibrated studio lighting
- Render at maximum resolution and detail
- Do NOT add text, watermarks, labels, or borders`;

  const contents: GeminiPart[] = [
    { text: prompt },
    { text: '\n\n── REFERENCE IMAGES ──' },
    ...buildClothingImageParts(params.clothing),
  ];

  if (params.clothingLogo) {
    contents.push({ text: `\n── BRAND LOGO REFERENCE (position: "${params.clothingLogo.position.replace(/_/g, ' ')}") ──` });
    contents.push({ inlineData: { mimeType: 'image/jpeg', data: params.clothingLogo.image } });
  }

  const response = await ai.models.generateContent({
    model: GENERATION_MODEL,
    contents: [{ role: 'user', parts: contents }],
    config: { responseModalities: ['IMAGE', 'TEXT'] },
  });

  const image = extractImage(response);
  if (!image) throw new Error('Gemini did not return an image for product-only mode.');
  return image;
}

// ---------------------------------------------------------------------------
// Mode 3: 360° Multi-angle product shots (shared analysis across all angles)
// ---------------------------------------------------------------------------

const ROTATION_ANGLES = [
  { label: 'Front', instruction: 'Front view — directly facing forward (0°). Show the complete front of the garment including all front-facing prints, logos, and details.' },
  { label: 'Three-Quarter Right', instruction: 'Three-quarter right angle view (45°). Reveal the right side detail while still showing most of the front.' },
  { label: 'Side', instruction: 'Direct right side (profile) view (90°). Show the complete right profile of the garment.' },
  { label: 'Back', instruction: 'Back view — directly from behind (180°). Show all back details, prints, and construction.' },
];

async function generateProductRotation(params: StudioGenerationParams): Promise<string[]> {
  const ai = getClient();

  // ── Step 1: Analyse garment ONCE — reuse for all angles ──
  const garmentAnalysis = await analyseGarment(ai, params.clothing, params.clothingLogo);

  const results: string[] = [];

  for (const angle of ROTATION_ANGLES) {
    const prompt = `You are a world-class product photographer producing a consistent 360° product photography set.

══════════════════════════════════════════════════════
EXPERT GARMENT ANALYSIS (GROUND TRUTH FOR ALL ANGLES)
══════════════════════════════════════════════════════
${garmentAnalysis}

══════════════════════════════════════════════════════
CURRENT ANGLE: ${angle.label.toUpperCase()}
══════════════════════════════════════════════════════
${angle.instruction}

CRITICAL: For this specific angle, show the appropriate details for that perspective. Adapt the garment naturally to the viewing angle — show back seams, side panels, etc. as appropriate. Maintain 100% colour and detail accuracy from the analysis above.

══════════════════════════════════════════════════════
REPRODUCTION RULES (APPLY TO ALL ANGLES)
══════════════════════════════════════════════════════
- Every print, logo, and text visible from this angle: pixel-perfect accuracy
- Exact garment colours — no shifts between angles
- ghost mannequin presentation (no model, no body)
- Consistent lighting and background across all angles (same studio session appearance)

══════════════════════════════════════════════════════
ENVIRONMENT (CONSISTENT ACROSS ALL SHOTS)
══════════════════════════════════════════════════════
- Background: ${params.backgroundPrompt}
- Lighting: ${params.lightingPrompt}
- Camera: consistent product photography setup — same focal length and distance as all other angles

══════════════════════════════════════════════════════
TECHNICAL
══════════════════════════════════════════════════════
- Professional 360° e-commerce photography quality
- Maximum sharpness across entire garment
- Do NOT add text, watermarks, angle labels, or borders`;

    const contents: GeminiPart[] = [
      { text: prompt },
      { text: '\n\n── REFERENCE IMAGES ──' },
      ...buildClothingImageParts(params.clothing),
    ];

    try {
      const response = await ai.models.generateContent({
        model: GENERATION_MODEL,
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
