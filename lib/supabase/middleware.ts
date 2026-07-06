import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh the session — important for Server Components
    const { data: { user } } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;
    const isDashboardRoute = pathname.startsWith('/dashboard');
    const isLoginPage = pathname === '/dashboard/login';
    const isSignupPage = pathname === '/auth/signup';
    const isOnboardingPage = pathname === '/dashboard/onboarding';

    // ── Shopify App Store entry ──────────────────────────────────────────
    // When Shopify opens the app with a ?shop= param and there is no session
    // yet, start the Shopify OAuth install so the merchant is onboarded as a
    // Shopify (billing_source = 'shopify') merchant — never the direct Stripe
    // signup flow. This guarantees App Store merchants only ever see Shopify
    // Managed Pricing, never off-platform billing. (Auth routes are excluded to
    // avoid a redirect loop.)
    const shopParam = request.nextUrl.searchParams.get('shop');
    const isAuthFlow = pathname.startsWith('/api/auth') || pathname.startsWith('/auth');
    if (
        shopParam &&
        /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shopParam) &&
        !user &&
        isDashboardRoute &&
        !isAuthFlow
    ) {
        return NextResponse.redirect(
            new URL(`/api/auth/shopify/install?shop=${encodeURIComponent(shopParam)}`, request.url),
        );
    }

    // Protect all /dashboard/* routes (except login)
    if (isDashboardRoute && !isLoginPage && !isSignupPage && !user) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/dashboard/login';
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Protect /admin route
    if (pathname.startsWith('/admin')) {
        if (!user) {
            // Not logged in → send to login with redirect back to /admin
            const loginUrl = request.nextUrl.clone();
            loginUrl.pathname = '/dashboard/login';
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
        if (user.email?.toLowerCase() !== process.env.ADMIN_EMAIL?.toLowerCase()) {
            // Logged in but not admin → send to dashboard
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // Redirect logged-in users away from login page
    if (isLoginPage && user) {
        const redirectTo = request.nextUrl.searchParams.get('redirect') || '/dashboard';
        const dashboardUrl = request.nextUrl.clone();
        dashboardUrl.pathname = redirectTo;
        dashboardUrl.searchParams.delete('redirect');
        return NextResponse.redirect(dashboardUrl);
    }

    // Redirect authenticated users without a shop to onboarding
    if (isDashboardRoute && !isLoginPage && !isOnboardingPage && user && user.email?.toLowerCase() !== process.env.ADMIN_EMAIL?.toLowerCase()) {
        const { data: shop } = await supabase
            .from('shops')
            .select('id, billing_source')
            .eq('owner_id', user.id)
            .single();

        if (!shop) {
            const onboardingUrl = request.nextUrl.clone();
            onboardingUrl.pathname = '/dashboard/onboarding';
            return NextResponse.redirect(onboardingUrl);
        }

        // Shopify merchants may not access the Stripe-billed Studio product.
        if (shop.billing_source === 'shopify' && pathname.startsWith('/dashboard/studio')) {
            return NextResponse.redirect(new URL('/dashboard/billing', request.url));
        }
    }

    return supabaseResponse;
}
