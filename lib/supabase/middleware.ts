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

    // Protect all /dashboard/* routes (except login)
    if (isDashboardRoute && !isLoginPage && !isSignupPage && !user) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/dashboard/login';
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
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
    if (isDashboardRoute && !isLoginPage && !isOnboardingPage && user) {
        const { data: shop } = await supabase
            .from('shops')
            .select('id')
            .eq('owner_id', user.id)
            .single();

        if (!shop) {
            const onboardingUrl = request.nextUrl.clone();
            onboardingUrl.pathname = '/dashboard/onboarding';
            return NextResponse.redirect(onboardingUrl);
        }
    }

    return supabaseResponse;
}
