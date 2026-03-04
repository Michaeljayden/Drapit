// =============================================================================
// POST /api/studio/generate — Drapit Studio AI generation endpoint
// =============================================================================
// Flow:
//   1. Authenticate via Supabase session (dashboard user)
//   2. Admin bypass: ADMIN_EMAIL has unlimited access, no credit deduction
//   3. Check available Studio credits (monthly + extra)
//   4. Generate image(s) via Gemini AI
//   5. Deduct credits from shop (skipped for admin)
//   6. Return generated images as base64 data URLs
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';
import { generateStudioImages, StudioGenerationParams } from '@/lib/studio/studioService';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Supabase admin client (service role — for credit deduction)
// ---------------------------------------------------------------------------

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createSupabaseAdminClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ---------------------------------------------------------------------------
// Credits cost per generation mode
// ---------------------------------------------------------------------------

const CREDITS_COST: Record<string, number> = {
  'virtual-model': 2,  // More complex — 2 credits
  'product-only': 1,   // Simple product shot — 1 credit
  'video-360': 4,      // 4 angle shots — 4 credits
};

// ---------------------------------------------------------------------------
// Request schema
// ---------------------------------------------------------------------------

const ClothingImagesSchema = z.object({
  top: z.object({
    front: z.string().optional(),
    back: z.string().optional(),
  }).optional(),
  bottom: z.object({
    front: z.string().optional(),
  }).optional(),
  outerwear: z.object({
    front: z.string().optional(),
  }).optional(),
});

const GenerateRequestSchema = z.object({
  mode: z.enum(['virtual-model', 'product-only', 'video-360']),
  clothing: ClothingImagesSchema,

  // Model options
  gender: z.string().optional(),
  ethnicityPrompt: z.string().optional(),
  age: z.number().min(16).max(80).optional(),
  weight: z.number().min(40).max(150).optional(),
  height: z.number().min(140).max(210).optional(),
  bodyType: z.string().optional(),
  customModelPrompt: z.string().max(500).optional(),

  // Pose & expression
  posePrompt: z.string().optional(),
  expressionPrompt: z.string().optional(),
  framingPrompt: z.string().optional(),
  rotationAngle: z.number().optional(),

  // Environment
  backgroundPrompt: z.string(),
  lightingPrompt: z.string(),
  timeOfDayPrompt: z.string().optional(),
  propText: z.string().max(200).optional(),

  // Camera
  lensPrompt: z.string().optional(),
  bokeh: z.number().min(1).max(10).optional(),

  // Branding
  clothingLogo: z.object({
    image: z.string(), // base64
    position: z.string(),
  }).optional(),

  // Batch
  numVariations: z.number().min(1).max(4).optional(),
});

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });
    }

    // 2. Fetch shop — everyone always has access (has_studio defaults to true)
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('id, has_studio, studio_credits_used, studio_credits_limit, studio_extra_credits')
      .eq('owner_id', user.id)
      .single();

    if (shopError || !shop) {
      return NextResponse.json({ error: 'Shop niet gevonden.' }, { status: 404 });
    }

    // Admin bypass: unlimited access, no credit deduction
    const isAdmin = user.email === process.env.ADMIN_EMAIL;

    // 3. Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Ongeldige JSON in request body.' }, { status: 400 });
    }

    const parsed = GenerateRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Ongeldige parameters.', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const params = parsed.data;

    // 4. Check if clothing was provided
    const hasClothing =
      params.clothing.top?.front ||
      params.clothing.bottom?.front ||
      params.clothing.outerwear?.front;

    if (!hasClothing) {
      return NextResponse.json({ error: 'Upload minimaal één kledingstuk.' }, { status: 400 });
    }

    // 5. Check credits (monthly plan credits + purchased extra credits)
    const variations = params.numVariations ?? 1;
    const baseCost = CREDITS_COST[params.mode] ?? 1;
    const totalCost = params.mode === 'video-360' ? baseCost : baseCost * variations;

    const creditsUsed = (shop.studio_credits_used as number) ?? 0;
    const creditsLimit = (shop.studio_credits_limit as number) ?? 0;
    const extraCredits = (shop.studio_extra_credits as number) ?? 0;

    // Monthly remaining + extra credits = total available
    const monthlyRemaining = Math.max(0, creditsLimit - creditsUsed);
    const totalRemaining = monthlyRemaining + extraCredits;

    // Admin never gets blocked by credits
    if (!isAdmin && totalRemaining < totalCost) {
      return NextResponse.json(
        {
          error: `Onvoldoende Studio-credits. Je hebt ${totalRemaining} credits beschikbaar maar hebt ${totalCost} nodig.`,
          code: 'INSUFFICIENT_CREDITS',
          remaining: totalRemaining,
          required: totalCost,
        },
        { status: 402 }
      );
    }

    // 6. Generate images
    const generationParams: StudioGenerationParams = {
      mode: params.mode,
      clothing: params.clothing,
      gender: params.gender,
      ethnicityPrompt: params.ethnicityPrompt,
      age: params.age,
      weight: params.weight,
      height: params.height,
      bodyType: params.bodyType,
      customModelPrompt: params.customModelPrompt,
      posePrompt: params.posePrompt,
      expressionPrompt: params.expressionPrompt,
      framingPrompt: params.framingPrompt,
      rotationAngle: params.rotationAngle,
      backgroundPrompt: params.backgroundPrompt,
      lightingPrompt: params.lightingPrompt,
      timeOfDayPrompt: params.timeOfDayPrompt,
      propText: params.propText,
      lensPrompt: params.lensPrompt,
      bokeh: params.bokeh,
      clothingLogo: params.clothingLogo,
      numVariations: params.mode === 'video-360' ? 1 : variations,
    };

    const result = await generateStudioImages(generationParams);

    // 7. Deduct credits: first from monthly allowance, then from extra credits
    //    Admin users never have credits deducted
    if (!isAdmin) {
      const adminClient = getAdmin();
      const monthlyDeduct = Math.min(totalCost, monthlyRemaining);
      const extraDeduct = totalCost - monthlyDeduct;

      await adminClient
        .from('shops')
        .update({
          studio_credits_used: creditsUsed + monthlyDeduct,
          studio_extra_credits: extraCredits - extraDeduct,
        })
        .eq('id', shop.id);
    }

    // 8. Return results
    return NextResponse.json({
      images: result.images,
      mode: result.mode,
      creditsUsed: isAdmin ? 0 : totalCost,
      creditsRemaining: isAdmin ? 99999 : totalRemaining - totalCost,
    });

  } catch (err: unknown) {
    console.error('[studio/generate] Error:', err);

    const message =
      err instanceof Error ? err.message : 'Onbekende fout bij generatie.';

    // Handle Gemini content policy blocks
    if (message.includes('content policy') || message.includes('SAFETY')) {
      return NextResponse.json(
        { error: 'De afbeelding kon niet worden gegenereerd wegens inhoudsbeleid. Probeer andere instellingen.' },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: 'Generatie mislukt. Probeer het opnieuw.' },
      { status: 500 }
    );
  }
}
