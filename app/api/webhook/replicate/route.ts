// =============================================================================
// POST /api/webhook/replicate — Replicate async webhook handler
// =============================================================================
// Receives webhook callbacks from Replicate when a prediction completes or fails.
//
// Flow:
// 1. Verify Replicate webhook signature (REPLICATE_WEBHOOK_SECRET)
// 2. Read replicate_prediction_id and output URL from payload
// 3. Download generated image and store in Supabase Storage (bucket: results)
// 4. Update tryons table: status, result_image_url, completed_at
// 5. Return 200 OK
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { processVtonResult } from '@/lib/image-processing';

// ---------------------------------------------------------------------------
// Supabase admin client (service role — bypasses RLS)
// ---------------------------------------------------------------------------
function getSupabaseAdmin(): SupabaseClient {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        throw new Error('Missing Supabase environment variables');
    }
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

// ---------------------------------------------------------------------------
// Replicate webhook signature verification
// ---------------------------------------------------------------------------
// Replicate signs webhooks using an HMAC-SHA256 signature in the
// 'webhook-id', 'webhook-timestamp', and 'webhook-signature' headers.
// See: https://replicate.com/docs/reference/webhooks#verifying-webhooks
// ---------------------------------------------------------------------------
async function verifyReplicateWebhook(
    request: NextRequest,
    body: string
): Promise<boolean> {
    const secret = process.env.REPLICATE_WEBHOOK_SECRET;

    // If no secret is configured, skip verification (dev mode)
    if (!secret) {
        console.warn('[webhook/replicate] REPLICATE_WEBHOOK_SECRET not set — skipping signature verification');
        return true;
    }

    const webhookId = request.headers.get('webhook-id');
    const webhookTimestamp = request.headers.get('webhook-timestamp');
    const webhookSignature = request.headers.get('webhook-signature');

    if (!webhookId || !webhookTimestamp || !webhookSignature) {
        console.error('[webhook/replicate] Missing webhook signature headers');
        return false;
    }

    // Verify timestamp is within 5 minutes to prevent replay attacks
    const timestamp = parseInt(webhookTimestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > 300) {
        console.error('[webhook/replicate] Webhook timestamp too old/future');
        return false;
    }

    // Reconstruct the signed content
    const signedContent = `${webhookId}.${webhookTimestamp}.${body}`;

    // The secret is base64-encoded with a "whsec_" prefix
    const secretBytes = base64ToUint8Array(secret.replace('whsec_', ''));

    // Import key for HMAC-SHA256
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        secretBytes.buffer as ArrayBuffer,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    // Sign the content
    const signatureBuffer = await crypto.subtle.sign(
        'HMAC',
        cryptoKey,
        new TextEncoder().encode(signedContent)
    );

    const expectedSignature = 'v1,' + uint8ArrayToBase64(new Uint8Array(signatureBuffer));

    // Replicate may send multiple signatures separated by spaces
    const signatures = webhookSignature.split(' ');
    return signatures.some((sig) => sig === expectedSignature);
}

// ---------------------------------------------------------------------------
// Base64 helpers (Edge-compatible, no Node.js Buffer)
// ---------------------------------------------------------------------------
function base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// ---------------------------------------------------------------------------
// Replicate webhook payload types
// ---------------------------------------------------------------------------
interface ReplicateWebhookPayload {
    id: string;
    status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
    output: string | string[] | null;
    error: string | null;
}

// ---------------------------------------------------------------------------
// Download image from URL and upload to Supabase Storage
// ---------------------------------------------------------------------------
async function storeResultImage(
    supabase: SupabaseClient,
    imageUrl: string,
    storagePath: string
): Promise<string> {
    const response = await fetch(imageUrl);
    if (!response.ok) {
        throw new Error(`Failed to download result image: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const imageBuffer = await response.arrayBuffer();

    const { error } = await supabase.storage
        .from('results')
        .upload(storagePath, imageBuffer, {
            contentType,
            upsert: true,
        });

    if (error) {
        throw new Error(`Storage upload failed: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
        .from('results')
        .getPublicUrl(storagePath);

    return urlData.publicUrl;
}

// ---------------------------------------------------------------------------
// Upload a pre-processed image buffer directly to Supabase Storage
// ---------------------------------------------------------------------------
async function storeProcessedImage(
    supabase: SupabaseClient,
    imageBuffer: Buffer,
    storagePath: string
): Promise<string> {
    const { error } = await supabase.storage
        .from('results')
        .upload(storagePath, imageBuffer, {
            contentType: 'image/jpeg',
            upsert: true,
        });

    if (error) {
        throw new Error(`Storage upload failed: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
        .from('results')
        .getPublicUrl(storagePath);

    return urlData.publicUrl;
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
    let body: string;

    try {
        body = await request.text();
    } catch {
        return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
        );
    }

    // -------------------------------------------------------------------
    // 1. VERIFY webhook signature
    // -------------------------------------------------------------------
    const isValid = await verifyReplicateWebhook(request, body);
    if (!isValid) {
        console.error('[webhook/replicate] Invalid webhook signature');
        return NextResponse.json(
            { error: 'Invalid webhook signature' },
            { status: 401 }
        );
    }

    // -------------------------------------------------------------------
    // 2. PARSE payload
    // -------------------------------------------------------------------
    let payload: ReplicateWebhookPayload;
    try {
        payload = JSON.parse(body);
    } catch {
        return NextResponse.json(
            { error: 'Invalid JSON payload' },
            { status: 400 }
        );
    }

    const { id: predictionId, status, output, error: predictionError } = payload;

    console.log(`[webhook/replicate] Received: prediction=${predictionId}, status=${status}`);

    if (!predictionId) {
        return NextResponse.json(
            { error: 'Missing prediction ID' },
            { status: 400 }
        );
    }

    const supabase = getSupabaseAdmin();

    // -------------------------------------------------------------------
    // Look up the try-on record by replicate_prediction_id
    // -------------------------------------------------------------------
    const { data: tryon, error: lookupError } = await supabase
        .from('tryons')
        .select('id, shop_id, status')
        .eq('replicate_prediction_id', predictionId)
        .single();

    if (lookupError || !tryon) {
        console.error(`[webhook/replicate] Try-on not found for prediction ${predictionId}:`, lookupError);
        // Return 200 anyway to prevent Replicate from retrying
        return NextResponse.json({ received: true, warning: 'Try-on record not found' });
    }

    // Skip if already in a terminal state (idempotency)
    if (tryon.status === 'succeeded' || tryon.status === 'failed') {
        console.log(`[webhook/replicate] Try-on ${tryon.id} already in terminal state: ${tryon.status}`);
        return NextResponse.json({ received: true });
    }

    // -------------------------------------------------------------------
    // 3. Handle COMPLETED prediction
    // -------------------------------------------------------------------
    if (status === 'succeeded') {
        // Extract the output URL — can be a string or array of strings
        const outputUrl = Array.isArray(output) ? output[0] : output;

        if (!outputUrl) {
            console.error(`[webhook/replicate] Prediction ${predictionId} succeeded but has no output URL`);
            await supabase
                .from('tryons')
                .update({
                    status: 'failed',
                    completed_at: new Date().toISOString(),
                })
                .eq('id', tryon.id);

            return NextResponse.json({ received: true });
        }

        // -------------------------------------------------------------------
        // Process image: remove background + composite on studio backdrop
        // Falls back to raw VTON output if processing fails (safe degradation)
        // -------------------------------------------------------------------
        let processedImageBuffer: Buffer | null = null;
        try {
            processedImageBuffer = await processVtonResult(outputUrl);
            console.log(`[webhook/replicate] Studio processing complete for try-on ${tryon.id}`);
        } catch (processErr) {
            console.error(`[webhook/replicate] Image processing failed, falling back to raw output:`, processErr);
        }

        // Download and store the result image
        let resultStorageUrl: string;
        try {
            if (processedImageBuffer) {
                // Store the studio-processed image directly from buffer
                resultStorageUrl = await storeProcessedImage(
                    supabase,
                    processedImageBuffer,
                    `${tryon.shop_id}/${tryon.id}/result.jpg`
                );
            } else {
                // Fallback: store raw VTON output
                resultStorageUrl = await storeResultImage(
                    supabase,
                    outputUrl,
                    `${tryon.shop_id}/${tryon.id}/result.jpg`
                );
            }
        } catch (storageErr) {
            console.error(`[webhook/replicate] Failed to store result image:`, storageErr);
            // Last resort: use temporary Replicate URL
            resultStorageUrl = outputUrl;
        }

        // -------------------------------------------------------------------
        // 4. UPDATE try-on record → succeeded
        // -------------------------------------------------------------------
        const { error: updateError } = await supabase
            .from('tryons')
            .update({
                status: 'succeeded',
                result_image_url: resultStorageUrl,
                completed_at: new Date().toISOString(),
            })
            .eq('id', tryon.id);

        if (updateError) {
            console.error(`[webhook/replicate] Failed to update try-on ${tryon.id}:`, updateError);
            return NextResponse.json(
                { error: 'Database update failed' },
                { status: 500 }
            );
        }

        console.log(`[webhook/replicate] Try-on ${tryon.id} completed successfully. Result: ${resultStorageUrl}`);
    }

    // -------------------------------------------------------------------
    // Handle FAILED prediction
    // -------------------------------------------------------------------
    if (status === 'failed' || status === 'canceled') {
        const { error: updateError } = await supabase
            .from('tryons')
            .update({
                status: 'failed',
                completed_at: new Date().toISOString(),
            })
            .eq('id', tryon.id);

        if (updateError) {
            console.error(`[webhook/replicate] Failed to update try-on ${tryon.id}:`, updateError);
        }

        console.log(`[webhook/replicate] Try-on ${tryon.id} failed. Error: ${predictionError || 'unknown'}`);
    }

    // -------------------------------------------------------------------
    // 5. RETURN 200 OK
    // -------------------------------------------------------------------
    return NextResponse.json({ received: true });
}
