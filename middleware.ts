import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const locales = ['nl', 'en'];
const defaultLocale = 'nl';

export async function middleware(request: NextRequest) {
    // First, handle Supabase session
    const response = await updateSession(request);

    // Then, handle locale detection
    const locale = request.cookies.get('NEXT_LOCALE')?.value;

    if (!locale || !locales.includes(locale)) {
        // Detect browser language
        const acceptLanguage = request.headers.get('accept-language');
        const detected = acceptLanguage?.split(',')[0]?.split('-')[0];
        const newLocale = locales.includes(detected || '') ? detected : defaultLocale;

        response.cookies.set('NEXT_LOCALE', newLocale!, {
            maxAge: 365 * 24 * 60 * 60, // 1 year
            path: '/',
        });
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico (favicon)
         * - public folder assets
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
