import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getStripe, STUDIO_CREDIT_PACKS } from '@/lib/stripe';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ── Auth helper ─────────────────────────────────────────────────────────────
async function getAuthenticatedUser() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch { /* Server Component — safe to ignore */ }
                },
            },
        }
    );
    return supabase.auth.getUser();
}

// ── Admin client ─────────────────────────────────────────────────────────────
function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// POST /api/stripe/studio-credits
// Body: { pack_index: number }  (0 = 50 credits, 1 = 150 credits, 2 = 300 credits)
// Returns: { checkout_url: string }
// One-time payment — credits added to studio_extra_credits on success.
// ═════════════════════════════════════════════════════════════════════════════
export async function POST(request: NextRequest) {
    try {
        // ── Authenticate ────────────────────────────────────────────────
        const { data: { user }, error: authErr } = await getAuthenticatedUser();
        if (authErr || !user) {
            return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
        }

        // ── Parse body ──────────────────────────────────────────────────
        const body = await request.json();
        const packIndex = body.pack_index as number;

        if (
            typeof packIndex !== 'number' ||
            packIndex < 0 ||
            packIndex >= STUDIO_CREDIT_PACKS.length
        ) {
            return NextResponse.json(
                { error: `Ongeldig pack_index. Kies 0, 1, of 2.` },
                { status: 400 }
            );
        }

        const pack = STUDIO_CREDIT_PACKS[packIndex];

        // ── Get shop ────────────────────────────────────────────────────
        const admin = getSupabaseAdmin();
        const { data: shop, error: shopErr } = await admin
            .from('shops')
            .select('id, stripe_customer_id, email, name, has_studio')
            .eq('owner_id', user.id)
            .single();

        if (shopErr || !shop) {
            return NextResponse.json({ error: 'Geen shop gevonden' }, { status: 404 });
        }

        if (!shop.has_studio) {
            return NextResponse.json({ error: 'Geen Studio-toegang' }, { status: 403 });
        }

        const stripe = getStripe();

        // ── Get or create Stripe Customer ───────────────────────────────
        let customerId = shop.stripe_customer_id as string | null;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: shop.email as string,
                name: shop.name as string,
                metadata: {
                    shop_id: shop.id as string,
                    supabase_user_id: user.id,
                },
            });
            customerId = customer.id;

            await admin
                .from('shops')
                .update({ stripe_customer_id: customerId })
                .eq('id', shop.id);
        }

        // ── Build base URL ──────────────────────────────────────────────
        const origin = request.headers.get('origin')
            || request.headers.get('referer')?.replace(/\/$/, '')
            || 'http://localhost:3000';

        // ── Create one-time payment Checkout Session ────────────────────
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'payment',
            payment_method_types: ['card', 'ideal'],
            line_items: [
                {
                    price: pack.price_id,
                    quantity: 1,
                },
            ],
            success_url: `${origin}/dashboard/billing?checkout=credits_success&credits=${pack.credits}`,
            cancel_url: `${origin}/dashboard/billing?checkout=cancelled`,
            metadata: {
                shop_id: shop.id as string,
                credits_amount: String(pack.credits),
                product_type: 'studio_credits',
            },
        });

        return NextResponse.json({ checkout_url: session.url });
    } catch (err: unknown) {
        console.error('[stripe/studio-credits] Error:', err);
        const message = err instanceof Error ? err.message : 'Onbekende fout';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
