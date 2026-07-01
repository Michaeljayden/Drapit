import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function makeClient() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                },
            },
        }
    );
}

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const tokenHash = searchParams.get('token_hash');
    const next = searchParams.get('next') ?? '/dashboard';

    // 1) Magic-link OTP login (used by the Shopify install auto-login).
    //    Verified server-side so the session is set on our own domain.
    if (tokenHash) {
        const supabase = await makeClient();
        const candidateTypes: ('email' | 'magiclink')[] = ['email', 'magiclink'];
        for (const type of candidateTypes) {
            const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
            if (!error) {
                return NextResponse.redirect(`${origin}${next}`);
            }
        }
        return NextResponse.redirect(`${origin}/dashboard/login?error=magic_link_failed`);
    }

    // 2) PKCE code exchange (password / email links initiated from the UI).
    if (code) {
        const supabase = await makeClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`);
        }
        return NextResponse.redirect(`${origin}/dashboard/login?error=${encodeURIComponent(error.message)}`);
    }

    return NextResponse.redirect(`${origin}/dashboard/login`);
}
