// =============================================================================
// POST /api/contact — contactformulier handler
// Ontvangt naam, email, onderwerp en bericht; stuurt melding naar info@drapit.io
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendContactEmail } from '@/lib/email';

const contactSchema = z.object({
    name: z.string().min(1, 'Naam is verplicht').max(100),
    email: z.string().email('Ongeldig e-mailadres'),
    phone: z.string().max(30).optional().default(''),
    webshopName: z.string().max(200).optional().default(''),
    brandClothing: z.string().max(50).optional().default(''),
    subject: z.string().min(1, 'Onderwerp is verplicht').max(200),
    message: z.string().min(10, 'Bericht moet minimaal 10 tekens bevatten').max(5000),
});

// Eenvoudige rate-limit: max 3 verzoeken per IP per 10 minuten
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const window = 10 * 60 * 1000; // 10 minuten
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + window });
        return true;
    }

    if (entry.count >= 3) return false;

    entry.count++;
    return true;
}

export async function POST(request: NextRequest) {
    // Rate limiting op IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(ip)) {
        return NextResponse.json(
            { error: 'Te veel verzoeken. Probeer het later opnieuw.' },
            { status: 429 }
        );
    }

    // Parse & valideer body
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Ongeldig verzoek' }, { status: 400 });
    }

    const result = contactSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json(
            {
                error: 'Validatiefout',
                details: result.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })),
            },
            { status: 400 }
        );
    }

    const { name, email, phone, webshopName, brandClothing, subject, message } = result.data;

    const sent = await sendContactEmail({
        fromName: name,
        fromEmail: email,
        phone: phone || undefined,
        webshopName: webshopName || undefined,
        brandClothing: brandClothing || undefined,
        subject,
        message,
    });

    if (!sent) {
        return NextResponse.json(
            { error: 'Kon het bericht niet verzenden. Probeer het later opnieuw.' },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true });
}
