// =============================================================================
// Replicate API client — IDM-VTON virtual try-on
// =============================================================================
// Uses /v1/predictions with explicit version hash for cuuupid/idm-vton.
// Model: cuuupid/idm-vton (CC BY-NC-SA 4.0 — non-commercial, testing only)
// =============================================================================

const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';

// cuuupid/idm-vton — version hash (latest as of 2024)
// Using /v1/predictions with explicit version is more reliable than model-specific endpoint
const REPLICATE_IDM_VTON_VERSION = '3b032a70c29aef7b9c3222f2e40b71660201d8c288336475ba326f3ca278a3e1';

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
    webhookEventsFilter: string[] = ['completed']
): Promise<ReplicatePrediction> {
    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) {
        throw new Error('Missing REPLICATE_API_TOKEN environment variable');
    }

    // Use /v1/predictions with explicit version hash — more reliable than model-specific endpoint
    const res = await fetch(REPLICATE_API_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            version: REPLICATE_IDM_VTON_VERSION,
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
