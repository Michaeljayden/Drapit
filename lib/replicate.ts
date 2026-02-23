// =============================================================================
// Replicate API client — IDM-VTON virtual try-on
// =============================================================================
// Uses direct fetch against the Replicate v1 predictions endpoint.
// Model: viktorfa/idm-vton
// =============================================================================

const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TryOnInput {
    human_img: string;      // URL of the person photo
    garm_img: string;       // URL of the garment photo
    garment_des: string;    // Text description of the garment
    is_checked: boolean;    // Use auto-crop for person
    is_checked_crop: boolean; // Use auto-crop for garment
    denoise_steps: number;  // Number of denoising steps
    seed: number;           // Random seed for reproducibility
}

export interface ReplicatePrediction {
    id: string;
    status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
    output: string | string[] | null;
    error: string | null;
    urls?: {
        get: string;
        cancel: string;
    };
}

// ---------------------------------------------------------------------------
// Create async prediction with webhook
// ---------------------------------------------------------------------------

export async function createTryOnPrediction(
    input: TryOnInput,
    webhookUrl: string,
    webhookEventsFilter: string[] = ['completed', 'failed']
): Promise<ReplicatePrediction> {
    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) {
        throw new Error('Missing REPLICATE_API_TOKEN environment variable');
    }

    const res = await fetch(REPLICATE_API_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Prefer: 'respond-async',
        },
        body: JSON.stringify({
            model: 'viktorfa/idm-vton',
            input: {
                human_img: input.human_img,
                garm_img: input.garm_img,
                garment_des: input.garment_des,
                is_checked: input.is_checked,
                is_checked_crop: input.is_checked_crop,
                denoise_steps: input.denoise_steps,
                seed: input.seed,
            },
            webhook: webhookUrl,
            webhook_events_filter: webhookEventsFilter,
        }),
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Replicate API error ${res.status}: ${body}`);
    }

    return res.json() as Promise<ReplicatePrediction>;
}

// ---------------------------------------------------------------------------
// Poll prediction status (fallback / status check)
// ---------------------------------------------------------------------------

export async function getPredictionStatus(
    predictionId: string
): Promise<ReplicatePrediction> {
    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) {
        throw new Error('Missing REPLICATE_API_TOKEN environment variable');
    }

    const res = await fetch(`${REPLICATE_API_URL}/${predictionId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Replicate API error ${res.status}: ${body}`);
    }

    return res.json() as Promise<ReplicatePrediction>;
}
