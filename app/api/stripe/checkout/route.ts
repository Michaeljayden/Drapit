import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getStripe, PLANS } from '@/lib/stripe';
import type { Plan } from '@/lib/supabase/types';
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

// ── Admin client for DB writes ──────────────────────────────────────────────
function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// POST /api/stripe/checkout
// Body: { plan: 'starter' | 'growth' | 'enterprise' }
// Returns: { checkout_url: string }
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
        const plan = body.plan as Plan;

        if (!plan || !PLANS[plan]) {
            return NextResponse.json(
                { error: 'Ongeldig plan. Kies uit: starter, growth, enterprise' },
                { status: 400 }
            );
        }

        const planConfig = PLANS[plan];

        // ── Get shop ────────────────────────────────────────────────────
        const admin = getSupabaseAdmin();
        const { data: shop, error: shopErr } = await admin
            .from('shops')
            .select('id, stripe_customer_id, email, name')
            .eq('owner_id', user.id)
            .single();

        if (shopErr || !shop) {
            return NextResponse.json({ error: 'Geen shop gevonden' }, { status: 404 });
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

            // Persist customer ID
            await admin
                .from('shops')
                .update({ stripe_customer_id: customerId })
                .eq('id', shop.id);
        }

        // ── Build base URL ──────────────────────────────────────────────
        const origin = request.headers.get('origin')
            || request.headers.get('referer')?.replace(/\/$/, '')
            || 'http://localhost:3000';

        // ── Create Checkout Session ─────────────────────────────────────
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card', 'ideal'],
            line_items: [
                {
                    price: planConfig.price_id,
                    quantity: 1,
                },
            ],
            success_url: `${origin}/dashboard/billing?checkout=success&plan=${plan}`,
            cancel_url: `${origin}/dashboard/billing?checkout=cancelled`,
            subscription_data: {
                metadata: {
                    shop_id: shop.id as string,
                    plan_key: plan,
                },
            },
            metadata: {
                shop_id: shop.id as string,
                plan_key: plan,
            },
        });

        return NextResponse.json({ checkout_url: session.url });
    } catch (err: unknown) {
        console.error('[stripe/checkout] Error:', err);
        const message = err instanceof Error ? err.message : 'Onbekende fout';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
