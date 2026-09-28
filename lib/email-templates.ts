// =============================================================================
// lib/email-templates.ts — HTML/tekst-templates voor Drapit transactionele mail
// =============================================================================
// Gebruikt door lib/email.ts (Resend). Eén stijl, geen externe afbeeldingen,
// Nederlandstalig (merchants NL/BE). Elke template geeft subject, html en text.
// =============================================================================

export interface EmailContent {
    subject: string;
    html: string;
    text: string;
}

const BRAND = {
    blue: '#1D6FD8',
    dark: '#06090F',
    text: '#0F172A',
    muted: '#64748B',
    bg: '#F4F6FA',
};

function esc(s: string): string {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function button(href: string, label: string): string {
    return `<a href="${href}" style="display:inline-block;background:${BRAND.blue};color:#fff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:8px;font-size:15px">${esc(label)}</a>`;
}

function layout(title: string, bodyHtml: string, preheader = ''): string {
    return `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:'Plus Jakarta Sans',Inter,Segoe UI,Arial,sans-serif;color:${BRAND.text}">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</span>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.bg};padding:32px 12px"><tr><td align="center">
<table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;background:#fff;border-radius:14px;overflow:hidden">
<tr><td style="background:${BRAND.dark};padding:20px 28px"><span style="color:#fff;font-weight:800;font-size:18px;letter-spacing:.04em">DRAPIT</span></td></tr>
<tr><td style="padding:28px 28px 8px;font-size:16px;line-height:1.6">${bodyHtml}</td></tr>
<tr><td style="padding:16px 28px 28px;font-size:13px;line-height:1.5;color:${BRAND.muted}">Vragen? Antwoord gewoon op deze mail — je krijgt Michael zelf.<br>Drapit · <a href="https://drapit.io" style="color:${BRAND.muted}">drapit.io</a></td></tr>
</table></td></tr></table></body></html>`;
}

const APP = () => process.env.NEXT_PUBLIC_APP_URL || 'https://drapit.io';

// ---------------------------------------------------------------------------
// Trial-/onboardingreeks (dag 1, 3, 10, 14)
// ---------------------------------------------------------------------------
export function welcomeEmail(shopName: string): EmailContent {
    const dash = `${APP()}/dashboard`;
    const subject = `Welkom bij Drapit, ${shopName} — zo staat de pasknop binnen 10 minuten live`;
    const html = layout(subject, `
<h1 style="font-size:22px;margin:0 0 12px">Welkom, ${esc(shopName)} 👋</h1>
<p>Je hebt Drapit geïnstalleerd. Vanaf nu kunnen je klanten je kleding virtueel passen op hun eigen foto, direct op de productpagina.</p>
<p><strong>Drie stappen, tien minuten:</strong></p>
<ol style="padding-left:20px">
<li>Open het dashboard en zet de widget aan.</li>
<li>Kies de kleur en tekst van de knop (standaard: "Virtueel passen").</li>
<li>Open een productpagina in je shop en probeer het zelf met een foto van jezelf.</li>
</ol>
<p style="margin:22px 0">${button(dash, 'Naar het dashboard')}</p>
<p>De eerste 14 dagen zijn gratis. Loop je ergens vast? Antwoord op deze mail, dan help ik je persoonlijk — desnoods samen aan de telefoon.</p>
<p>Michael<br><span style="color:${BRAND.muted}">oprichter Drapit</span></p>`, 'Zet de pasknop in drie stappen live.');
    const text = `Welkom bij Drapit, ${shopName}!

Je hebt Drapit geïnstalleerd. Zo staat de pasknop binnen 10 minuten live:
1. Open het dashboard en zet de widget aan: ${dash}
2. Kies kleur en tekst van de knop.
3. Open een productpagina en probeer het zelf met een foto van jezelf.

De eerste 14 dagen zijn gratis. Vragen? Antwoord op deze mail.

Michael, oprichter Drapit`;
    return { subject, html, text };
}

export function day3Email(shopName: string): EmailContent {
    const dash = `${APP()}/dashboard`;
    const subject = `Staat de pasknop al aan, ${shopName}?`;
    const html = layout(subject, `
<p>Korte check: staat de "Virtueel passen"-knop al op je productpagina's?</p>
<p><strong>Ja?</strong> Mooi — deel 'm vandaag één keer op Instagram of in je nieuwsbrief ("pas onze nieuwe collectie op jezelf"). Winkels die dat doen zien de eerste dag meteen try-ons binnenkomen.</p>
<p><strong>Nee?</strong> Meestal zit het in één van deze twee dingen:</p>
<ul style="padding-left:20px">
<li>De widget staat nog uit in het dashboard.</li>
<li>Het thema toont de app-embed niet — zet in je Shopify-thema onder <em>Thema aanpassen → App-embeds</em> Drapit aan.</li>
</ul>
<p style="margin:22px 0">${button(dash, 'Dashboard openen')}</p>
<p>Lukt het niet binnen vijf minuten? Antwoord op deze mail met de link van je shop, dan kijk ik vandaag nog mee.</p>
<p>Michael</p>`, 'Eén check en één tip.');
    const text = `Staat de "Virtueel passen"-knop al op je productpagina's, ${shopName}?

Ja? Deel 'm vandaag één keer op Instagram of in je nieuwsbrief.
Nee? Check: staat de widget aan in het dashboard (${dash}) en staat de Drapit app-embed aan in je Shopify-thema (Thema aanpassen → App-embeds)?

Lukt het niet? Antwoord op deze mail met de link van je shop.

Michael`;
    return { subject, html, text };
}

export function day10Email(shopName: string, tryonsUsed: number): EmailContent {
    const dash = `${APP()}/dashboard`;
    const subject = tryonsUsed > 0
        ? `${tryonsUsed} keer virtueel gepast in ${shopName} — nog 4 dagen gratis`
        : `Nog 4 dagen gratis, ${shopName} — nog geen try-ons gezien`;
    const body = tryonsUsed > 0
        ? `<p>In de eerste tien dagen is er <strong>${tryonsUsed} keer</strong> virtueel gepast in je shop. Elk van die momenten is een klant die twijfelde over maat of model en het toch heeft bekeken in plaats van weg te klikken.</p>
<p>In het dashboard zie je welke producten het meest gepast worden — dat zijn je kandidaten voor de homepage en je volgende post.</p>`
        : `<p>Je proefperiode loopt nog vier dagen, maar ik zie nog geen try-ons binnenkomen. Dat betekent bijna altijd dat de knop nog niet zichtbaar is op de productpagina.</p>
<p>Antwoord op deze mail met de link van je shop en ik check het vandaag nog voor je — dat kost jou nul minuten.</p>`;
    const html = layout(subject, `${body}
<p style="margin:22px 0">${button(dash, 'Bekijk je try-ons')}</p>
<p>Over vier dagen gaat je gekozen plan in. Wil je wisselen van plan of stoppen? Dat kan altijd via <em>Abonnement</em> in het dashboard.</p>
<p>Michael</p>`, 'Tussenstand na tien dagen.');
    const text = (tryonsUsed > 0
        ? `In de eerste tien dagen is er ${tryonsUsed} keer virtueel gepast in ${shopName}. In het dashboard zie je welke producten het meest gepast worden: ${dash}`
        : `Je proefperiode loopt nog vier dagen, maar ik zie nog geen try-ons in ${shopName}. Antwoord op deze mail met de link van je shop, dan check ik het vandaag voor je.`)
        + `\n\nOver vier dagen gaat je gekozen plan in. Wisselen of stoppen kan altijd via Abonnement in het dashboard.\n\nMichael`;
    return { subject, html, text };
}

export function day14Email(shopName: string, tryonsUsed: number): EmailContent {
    const billing = `${APP()}/dashboard/billing`;
    const subject = `Je proefperiode is voorbij, ${shopName} — dit is wat er nu gebeurt`;
    const html = layout(subject, `
<p>Je 14 dagen gratis Drapit zijn om. Vanaf vandaag loopt je gekozen plan gewoon door; je hoeft niets te doen.</p>
<p>Tussenstand: <strong>${tryonsUsed} try-ons</strong> in twee weken.</p>
<p>Twee dingen die je mag verwachten van mij:</p>
<ul style="padding-left:20px">
<li>Je houdt je huidige prijs zolang je klant blijft — ook als de actieprijzen straks omhoog gaan.</li>
<li>Ik stuur je één keer per maand een kort overzicht: try-ons, meest gepaste producten, en wat andere winkels ermee doen.</li>
</ul>
<p style="margin:22px 0">${button(billing, 'Plan bekijken of wijzigen')}</p>
<p>En als het niet gebracht heeft wat je hoopte: antwoord op deze mail en vertel me wat er miste. Daar leer ik meer van dan van elke klant die blijft.</p>
<p>Michael</p>`, 'Je plan loopt nu door.');
    const text = `Je 14 dagen gratis Drapit zijn om, ${shopName}. Vanaf vandaag loopt je gekozen plan door; je hoeft niets te doen.

Tussenstand: ${tryonsUsed} try-ons in twee weken.

Je houdt je huidige prijs zolang je klant blijft. Plan bekijken of wijzigen: ${billing}

Niet gebracht wat je hoopte? Antwoord op deze mail en vertel me wat er miste.

Michael`;
    return { subject, html, text };
}

// ---------------------------------------------------------------------------
// Overige transactionele mails
// ---------------------------------------------------------------------------
export function usageAlertEmail(shopName: string, used: number, limit: number, percentage: 80 | 100): EmailContent {
    const billing = `${APP()}/dashboard/billing`;
    const reached = percentage === 100;
    const subject = reached
        ? `Maandlimiet bereikt — ${shopName}`
        : `Heads-up: ${shopName} zit op ${percentage}% van de maandlimiet`;
    const html = layout(subject, `
<p>${reached
        ? `Je shop heeft deze maand de limiet van <strong>${limit} try-ons</strong> bereikt. De pasknop blijft zichtbaar, maar nieuwe try-ons worden pas weer verwerkt na de maandwissel — of direct na een upgrade of extra bundel.`
        : `Je shop zit op <strong>${used} van ${limit} try-ons</strong> deze maand (${percentage}%). Goed teken: je klanten gebruiken het. Nog ${Math.max(0, limit - used)} te gaan.`}</p>
<p style="margin:22px 0">${button(billing, reached ? 'Upgrade of koop extra try-ons' : 'Bekijk je plan')}</p>
<p>Michael</p>`);
    const text = `${subject}\n\n${used} van ${limit} try-ons gebruikt deze maand. Plan bekijken: ${billing}\n\nMichael`;
    return { subject, html, text };
}

export function newMerchantAdminEmail(p: { merchantEmail: string; merchantName: string; shopName: string; domain: string; phone?: string; plan: string; }): EmailContent {
    const subject = `Nieuwe merchant: ${p.shopName} (${p.plan})`;
    const rows = [
        ['Shop', p.shopName], ['Domein', p.domain], ['Contact', p.merchantName], ['E-mail', p.merchantEmail],
        ['Telefoon', p.phone || 'Niet opgegeven'], ['Plan', p.plan],
    ].map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:${BRAND.muted}">${esc(k)}</td><td style="padding:4px 0">${esc(v)}</td></tr>`).join('');
    const html = layout(subject, `<h2 style="font-size:18px;margin:0 0 12px">Nieuwe merchant aangemeld</h2><table style="font-size:15px">${rows}</table><p style="margin-top:18px">${button(`${APP()}/admin`, 'Open admin')}</p>`);
    const text = `Nieuwe merchant: ${p.shopName}\nDomein: ${p.domain}\nContact: ${p.merchantName}\nE-mail: ${p.merchantEmail}\nTelefoon: ${p.phone || 'Niet opgegeven'}\nPlan: ${p.plan}\n${APP()}/admin`;
    return { subject, html, text };
}

export function contactFormEmail(p: { fromName: string; fromEmail: string; phone?: string; webshopName?: string; brandClothing?: string; subject: string; message: string; }): EmailContent {
    const subject = `Contactformulier: ${p.subject} — ${p.fromName}`;
    const rows = [
        ['Naam', p.fromName], ['E-mail', p.fromEmail], ['Telefoon', p.phone || 'Niet opgegeven'],
        ['Webshop', p.webshopName || 'Niet opgegeven'], ['Merk/kleding', p.brandClothing || 'Niet opgegeven'],
    ].map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:${BRAND.muted}">${esc(k)}</td><td style="padding:4px 0">${esc(v)}</td></tr>`).join('');
    const html = layout(subject, `<h2 style="font-size:18px;margin:0 0 12px">${esc(p.subject)}</h2><table style="font-size:15px">${rows}</table><p style="white-space:pre-wrap;margin-top:18px;padding:14px;background:${BRAND.bg};border-radius:8px">${esc(p.message)}</p>`);
    const text = `${p.subject}\nVan: ${p.fromName} <${p.fromEmail}>\nTelefoon: ${p.phone || '-'}\nWebshop: ${p.webshopName || '-'}\nMerk: ${p.brandClothing || '-'}\n\n${p.message}`;
    return { subject, html, text };
}
