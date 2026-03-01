// =============================================================================
// Image processing pipeline — background removal + studio backdrop
// =============================================================================
//
// Flow per try-on result:
//   1. Call Replicate bg-removal (851-labs/background-remover) → transparent PNG
//   2. Composite transparent PNG on a generated studio backdrop using sharp
//   3. Return final JPEG buffer ready for Supabase Storage
//
// The studio backdrop is a smooth vertical gradient (light grey top → warm white
// bottom) generated programmatically — no external assets needed.
// =============================================================================

import sharp from 'sharp';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

// Replicate model for background removal (RMBG-1.4 — high quality, fast)
const BG_REMOVAL_MODEL = '851-labs/background-remover';

// Output dimensions — matches typical fashion product photo ratio (3:4)
const STUDIO_WIDTH = 768;
const STUDIO_HEIGHT = 1024;

// Max time (ms) to wait for bg-removal prediction before giving up
const BG_REMOVAL_TIMEOUT_MS = 30_000;
const BG_REMOVAL_POLL_INTERVAL_MS = 800;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReplicatePrediction {
    id: string;
    status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
    output: string | string[] | null;
    error: string | null;
}

// ---------------------------------------------------------------------------
// Remove background via Replicate (synchronous polling)
// ---------------------------------------------------------------------------

export async function removeBackground(imageUrl: string): Promise<Buffer> {
    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) throw new Error('Missing REPLICATE_API_TOKEN');

    // Start prediction
    const startRes = await fetch('https://api.replicate.com/v1/models/' + BG_REMOVAL_MODEL + '/predictions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Prefer: 'respond-async',
        },
        body: JSON.stringify({
            input: { image: imageUrl },
        }),
    });

    if (!startRes.ok) {
        const err = await startRes.text();
        throw new Error(`[bg-removal] Failed to start prediction: ${startRes.status} ${err}`);
    }

    let prediction: ReplicatePrediction = await startRes.json();
    console.log(`[bg-removal] Started prediction ${prediction.id}`);

    // Poll until done or timeout
    const deadline = Date.now() + BG_REMOVAL_TIMEOUT_MS;

    while (
        prediction.status !== 'succeeded' &&
        prediction.status !== 'failed' &&
        prediction.status !== 'canceled'
    ) {
        if (Date.now() > deadline) {
            throw new Error(`[bg-removal] Prediction ${prediction.id} timed out after ${BG_REMOVAL_TIMEOUT_MS}ms`);
        }

        await sleep(BG_REMOVAL_POLL_INTERVAL_MS);

        const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!pollRes.ok) {
            throw new Error(`[bg-removal] Poll failed: ${pollRes.status}`);
        }

        prediction = await pollRes.json();
        console.log(`[bg-removal] Prediction ${prediction.id} status: ${prediction.status}`);
    }

    if (prediction.status !== 'succeeded' || !prediction.output) {
        throw new Error(`[bg-removal] Prediction failed: ${prediction.error || 'unknown'}`);
    }

    // Download transparent PNG
    const outputUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
    const imgRes = await fetch(outputUrl);
    if (!imgRes.ok) throw new Error(`[bg-removal] Failed to download output: ${imgRes.status}`);

    const buffer = await imgRes.arrayBuffer();
    return Buffer.from(buffer);
}

// ---------------------------------------------------------------------------
// Generate studio backdrop (SVG gradient → PNG buffer)
// ---------------------------------------------------------------------------
//
// Creates a professional photography-studio seamless paper look:
//   - Top: soft neutral grey (#d4d4d4)
//   - Middle: slightly lighter (#e8e8e8) — simulates light falloff
//   - Bottom: warm near-white (#f2f2f2) — floor reflection
// ---------------------------------------------------------------------------

async function generateStudioBackground(width: number, height: number): Promise<Buffer> {
    const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="studio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stop-color="#c8c8c8"/>
                    <stop offset="40%"  stop-color="#d8d8d8"/>
                    <stop offset="75%"  stop-color="#e8e8e8"/>
                    <stop offset="100%" stop-color="#f0f0f0"/>
                </linearGradient>
            </defs>
            <rect width="${width}" height="${height}" fill="url(#studio)"/>
        </svg>
    `.trim();

    return sharp(Buffer.from(svg))
        .resize(width, height)
        .png()
        .toBuffer();
}

// ---------------------------------------------------------------------------
// Composite transparent foreground PNG on studio backdrop
// ---------------------------------------------------------------------------

async function compositeOnStudio(foregroundPng: Buffer): Promise<Buffer> {
    const background = await generateStudioBackground(STUDIO_WIDTH, STUDIO_HEIGHT);

    // Resize foreground to fit within the studio canvas (maintain aspect ratio)
    // Anchor to the bottom — person stands on the "floor"
    const resizedFg = await sharp(foregroundPng)
        .resize(STUDIO_WIDTH, STUDIO_HEIGHT, {
            fit: 'inside',
            withoutEnlargement: false,
        })
        .png()
        .toBuffer();

    // Get actual dimensions after resize to center horizontally + align to bottom
    const fgMeta = await sharp(resizedFg).metadata();
    const fgW = fgMeta.width ?? STUDIO_WIDTH;
    const fgH = fgMeta.height ?? STUDIO_HEIGHT;

    const left = Math.round((STUDIO_WIDTH - fgW) / 2);
    const top = STUDIO_HEIGHT - fgH; // bottom-align

    return sharp(background)
        .composite([{
            input: resizedFg,
            left,
            top,
            blend: 'over',
        }])
        .jpeg({ quality: 92, mozjpeg: true })
        .toBuffer();
}

// ---------------------------------------------------------------------------
// Main export — full pipeline: bg-removal + studio composite
// ---------------------------------------------------------------------------

export async function processVtonResult(imageUrl: string): Promise<Buffer> {
    console.log('[image-processing] Starting pipeline for:', imageUrl);

    const fgPng = await removeBackground(imageUrl);
    console.log('[image-processing] Background removed, compositing on studio backdrop...');

    const result = await compositeOnStudio(fgPng);
    console.log('[image-processing] Studio composite complete.');

    return result;
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
