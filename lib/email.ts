// =============================================================================
// lib/email.ts — Drapit transactional email via EmailJS REST API
// =============================================================================
// EmailJS Pro (server-side) docs: https://www.emailjs.com/docs/rest-api/send/
//
// EmailJS service: gebruik Hostinger SMTP (smtp.hostinger.com:465 SSL)
//   Sender-adres: info@drapit.io
//
// Required env vars:
//   EMAILJS_SERVICE_ID        — EmailJS → Email Services → Service ID
//   EMAILJS_PUBLIC_KEY        — EmailJS → Account → Public Key
//   EMAILJS_PRIVATE_KEY       — EmailJS → Account → Private Key (Pro only)
//   EMAILJS_TEMPLATE_WELCOME  — Template ID voor welcome email
//   EMAILJS_TEMPLATE_USAGE    — Template ID voor usage alert email
//   EMAILJS_TEMPLATE_CONTACT  — Template ID voor contact form notificatie
// =============================================================================

const EMAILJS_API_URL = 'https://api.emailjs.com/api/v1.0/email/send';

function getCredentials() {
    return {
        service_id: process.env.EMAILJS_SERVICE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_PRIVATE_KEY,
    };
}

// ---------------------------------------------------------------------------
// Internal: send a single email via EmailJS REST API
// Returns true on success, false on failure (never throws)
// ---------------------------------------------------------------------------
async function sendEmail(
    templateId: string,
    templateParams: Record<string, string | number>
): Promise<boolean> {
    const { service_id, user_id, accessToken } = getCredentials();

    if (!service_id || !user_id || !accessToken) {
        console.warn('[email] EmailJS credentials not configured — skipping email send');
        return false;
    }

    if (!templateId) {
        console.warn('[email] No templateId provided — skipping email send');
        return false;
    }

    const payload = {
        service_id,
        template_id: templateId,
        user_id,
        accessToken,
        template_params: templateParams,
    };

    try {
        const res = await fetch(EMAILJS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const text = await res.text();
            console.error(`[email] EmailJS error ${res.status}:`, text);
            return false;
        }

        return true;
    } catch (err) {
        console.error('[email] Failed to reach EmailJS API:', err);
        return false;
    }
}

// =============================================================================
// PUBLIC EMAIL FUNCTIONS
// =============================================================================

// ---------------------------------------------------------------------------
// 1. Welcome email — fired once when a new merchant installs Drapit
// ---------------------------------------------------------------------------
export async function sendWelcomeEmail(
    toEmail: string,
    shopName: string
): Promise<void> {
    const templateId = process.env.EMAILJS_TEMPLATE_WELCOME;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://drapit.io';

    const sent = await sendEmail(templateId!, {
        to_email: toEmail,
        to_name: shopName,
        shop_name: shopName,
        dashboard_url: `${appUrl}/dashboard`,
        docs_url: `${appUrl}/docs`,
        support_email: 'support@drapit.io',
    });

    if (sent) {
        console.log(`[email] Welcome email sent to ${toEmail} (${shopName})`);
    }
}

// ---------------------------------------------------------------------------
// 2. Usage alert — fired at 80% and 100% of monthly try-on limit
// ---------------------------------------------------------------------------
export async function sendUsageAlertEmail(
    toEmail: string,
    shopName: string,
    used: number,
    limit: number,
    percentage: 80 | 100
): Promise<void> {
    const templateId = process.env.EMAILJS_TEMPLATE_USAGE;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://drapit.io';

    const isLimitReached = percentage === 100;
    const subject = isLimitReached
        ? `⚠️ Maandlimiet bereikt — ${shopName}`
        : `Heads-up: ${shopName} is op ${percentage}% van de maandlimiet`;

    const sent = await sendEmail(templateId!, {
        to_email: toEmail,
        to_name: shopName,
        shop_name: shopName,
        subject,
        used_tryons: used,
        monthly_limit: limit,
        remaining: Math.max(0, limit - used),
        percentage,
        is_limit_reached: isLimitReached ? 'true' : 'false',
        upgrade_url: `${appUrl}/dashboard/settings`,
        support_email: 'support@drapit.io',
    });

    if (sent) {
        console.log(`[email] Usage alert (${percentage}%) sent to ${toEmail} (${shopName}) — ${used}/${limit}`);
    }
}

// ---------------------------------------------------------------------------
// 3. Contact form — melding naar info@drapit.io wanneer iemand het formulier stuurt
// ---------------------------------------------------------------------------
export async function sendContactEmail(params: {
    fromName: string;
    fromEmail: string;
    phone?: string;
    webshopName?: string;
    brandClothing?: string;
    subject: string;
    message: string;
}): Promise<boolean> {
    const templateId = process.env.EMAILJS_TEMPLATE_CONTACT;

    const sent = await sendEmail(templateId!, {
        to_email: 'info@drapit.io',
        from_name: params.fromName,
        from_email: params.fromEmail,
        phone: params.phone || 'Niet opgegeven',
        webshop_name: params.webshopName || 'Niet opgegeven',
        brand_clothing: params.brandClothing || 'Niet opgegeven',
        subject: params.subject,
        message: params.message,
        reply_to: params.fromEmail,
    });

    if (sent) {
        console.log(`[email] Contact form submission from ${params.fromEmail}`);
    }

    return sent;
}
