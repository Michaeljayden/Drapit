// =============================================================================
// lib/email.ts — Drapit transactionele mail via Resend (REST, geen SDK nodig)
// =============================================================================
// Vervangt EmailJS sinds 2026-09-28. Zelfde publieke functies als voorheen,
// zodat de aanroepende routes niet hoeven te veranderen.
//
// Required env vars:
//   RESEND_API_KEY   — Resend → API Keys (sending access is voldoende)
//   RESEND_FROM      — bv. "Drapit <hello@drapit.io>" (domein moet geverifieerd zijn)
// Optional:
//   ADMIN_EMAIL      — ontvanger van admin-notificaties (default info@drapit.io)
//
// De onboardingreeks (dag 3 / 10 / 14) wordt NIET hier ingepland maar dagelijks
// verstuurd door app/api/cron/trial-emails/route.ts, zodat de mails de actuele
// try-on-cijfers bevatten en automatisch stoppen als een shop opzegt.
// =============================================================================

import {
    welcomeEmail, day3Email, day10Email, day14Email,
    usageAlertEmail, newMerchantAdminEmail, contactFormEmail,
    type EmailContent,
} from '@/lib/email-templates';

const RESEND_API = 'https://api.resend.com/emails';
const ADMIN_EMAIL = () => process.env.ADMIN_EMAIL || 'info@drapit.io';
const FROM = () => process.env.RESEND_FROM || 'Drapit <hello@drapit.io>';
const REPLY_TO = () => process.env.RESEND_REPLY_TO || 'info@drapit.io';

export interface SendOptions {
    to: string | string[];
    content: EmailContent;
    replyTo?: string;
    tags?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Internal: één mail via Resend. Geeft het Resend-id terug, of null bij falen.
// Gooit nooit — mail mag een request nooit laten crashen.
// ---------------------------------------------------------------------------
export async function sendViaResend(opts: SendOptions): Promise<string | null> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.warn('[email] RESEND_API_KEY ontbreekt — mail overgeslagen:', opts.content.subject);
        return null;
    }

    const body = {
        from: FROM(),
        to: Array.isArray(opts.to) ? opts.to : [opts.to],
        reply_to: opts.replyTo || REPLY_TO(),
        subject: opts.content.subject,
        html: opts.content.html,
        text: opts.content.text,
        tags: opts.tags
            ? Object.entries(opts.tags).map(([name, value]) => ({ name, value }))
            : undefined,
    };

    try {
        const res = await fetch(RESEND_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            console.error(`[email] Resend error ${res.status}:`, await res.text());
            return null;
        }
        const data = (await res.json()) as { id?: string };
        return data.id ?? null;
    } catch (err) {
        console.error('[email] Resend niet bereikbaar:', err);
        return null;
    }
}

// =============================================================================
// PUBLIC EMAIL FUNCTIONS (zelfde signatures als het EmailJS-tijdperk)
// =============================================================================

// 1. Welkomstmail (dag 1) — bij eerste installatie / aanmelding
export async function sendWelcomeEmail(toEmail: string, shopName: string): Promise<boolean> {
    const id = await sendViaResend({
        to: toEmail,
        content: welcomeEmail(shopName),
        tags: { type: 'welcome' },
    });
    console.log(id
        ? `[email] Welkomstmail verstuurd naar ${toEmail} (${shopName}) — ${id}`
        : `[email] Welkomstmail MISLUKT voor ${toEmail} (${shopName})`);
    return !!id;
}

// 2. Onboardingreeks dag 3 / 10 / 14 — aangeroepen door de dagelijkse cron
export async function sendTrialStepEmail(
    step: 3 | 10 | 14,
    toEmail: string,
    shopName: string,
    tryonsUsed: number
): Promise<boolean> {
    const content = step === 3 ? day3Email(shopName)
        : step === 10 ? day10Email(shopName, tryonsUsed)
        : day14Email(shopName, tryonsUsed);
    const id = await sendViaResend({ to: toEmail, content, tags: { type: `trial_day_${step}` } });
    if (id) console.log(`[email] Trial dag ${step} verstuurd naar ${toEmail} (${shopName})`);
    return !!id;
}

// 3. Usage alert — bij 80% en 100% van de maandlimiet
export async function sendUsageAlertEmail(
    toEmail: string,
    shopName: string,
    used: number,
    limit: number,
    percentage: 80 | 100
): Promise<void> {
    const id = await sendViaResend({
        to: toEmail,
        content: usageAlertEmail(shopName, used, limit, percentage),
        tags: { type: `usage_${percentage}` },
    });
    if (id) console.log(`[email] Usage alert (${percentage}%) naar ${toEmail} (${shopName}) — ${used}/${limit}`);
}

// 4. Nieuwe merchant — admin-notificatie
export async function sendNewMerchantNotification(params: {
    merchantEmail: string;
    merchantName: string;
    shopName: string;
    domain: string;
    phone?: string;
    plan: string;
}): Promise<void> {
    const id = await sendViaResend({
        to: ADMIN_EMAIL(),
        content: newMerchantAdminEmail(params),
        replyTo: params.merchantEmail,
        tags: { type: 'admin_signup' },
    });
    if (id) console.log(`[email] Admin-notificatie voor ${params.merchantEmail} (${params.shopName})`);
}

// 5. Contactformulier — melding naar admin, reply-to = afzender
export async function sendContactEmail(params: {
    fromName: string;
    fromEmail: string;
    phone?: string;
    webshopName?: string;
    brandClothing?: string;
    subject: string;
    message: string;
}): Promise<boolean> {
    const id = await sendViaResend({
        to: ADMIN_EMAIL(),
        content: contactFormEmail(params),
        replyTo: params.fromEmail,
        tags: { type: 'contact' },
    });
    if (id) console.log(`[email] Contactformulier van ${params.fromEmail}`);
    return !!id;
}
