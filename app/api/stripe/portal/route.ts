import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getStripe } from '@/lib/stripe';
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

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// POST /api/stripe/portal
// Returns: { portal_url: string }
// ═════════════════════════════════════════════════════════════════════════════
export async function POST(request: NextRequest) {
    try {
        // ── Authenticate ────────────────────────────────────────────────
        const { data: { user }, error: authErr } = await getAuthenticatedUser();
        if (authErr || !user) {
            return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
        }

        // ── Get shop ────────────────────────────────────────────────────
        const admin = getSupabaseAdmin();
        const { data: shop, error: shopErr } = await admin
            .from('shops')
            .select('stripe_customer_id')
            .eq('owner_id', user.id)
            .single();

        if (shopErr || !shop) {
            return NextResponse.json({ error: 'Geen shop gevonden' }, { status: 404 });
        }

        const customerId = shop.stripe_customer_id as string | null;
        if (!customerId) {
            return NextResponse.json(
                { error: 'Geen Stripe-account gevonden. Start eerst een abonnement.' },
                { status: 400 }
            );
        }

        // ── Build return URL ────────────────────────────────────────────
        const origin = request.headers.get('origin')
            || request.headers.get('referer')?.replace(/\/$/, '')
            || 'http://localhost:3000';

        // ── Create Portal Session ───────────────────────────────────────
        const stripe = getStripe();
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${origin}/dashboard/billing`,
        });

        return NextResponse.json({ portal_url: session.url });
    } catch (err: unknown) {
        console.error('[stripe/portal] Error:', err);
        const message = err instanceof Error ? err.message : 'Onbekende fout';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
