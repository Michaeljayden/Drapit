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
    cyan: '#22D3EE',
    dark: '#06090F',
    text: '#0F172A',
    body: '#334155',
    muted: '#64748B',
    line: '#E2E8F0',
    bg: '#F1F5F9',
    soft: '#F8FAFC',
};

const FONT = `'Plus Jakarta Sans','Segoe UI',Helvetica,Arial,sans-serif`;
const APP_URL = () => process.env.NEXT_PUBLIC_APP_URL || 'https://drapit.io';
const LOGO_URL = () => process.env.EMAIL_LOGO_URL || `${APP_URL()}/email/drapit-logo.png`;

function esc(s: string): string {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// Bulletproof knop (tabel-gebaseerd, werkt ook in Outlook)
function button(href: string, label: string): string {
    return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:10px 0 24px"><tr>
<td bgcolor="${BRAND.blue}" style="border-radius:10px;background:${BRAND.blue}">
<a href="${href}" target="_blank" style="display:inline-block;padding:14px 28px;font-family:${FONT};font-size:15px;font-weight:700;line-height:1;color:#ffffff;text-decoration:none;border-radius:10px">${esc(label)} &rarr;</a>
</td></tr></table>`;
}

// Genummerde stappen met blauwe badges
function steps(items: string[]): string {
    const rows = items.map((html, i) => `<tr>
<td valign="top" width="40" style="padding:0 0 14px">
<div style="width:28px;height:28px;border-radius:14px;background:#EFF6FF;color:${BRAND.blue};font-family:${FONT};font-size:14px;font-weight:800;line-height:28px;text-align:center">${i + 1}</div></td>
<td valign="top" style="padding:3px 0 14px;font-family:${FONT};font-size:15px;line-height:1.55;color:${BRAND.body}">${html}</td></tr>`).join('');
    return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:6px 0 18px">${rows}</table>`;
}

// Grijs kader voor cijfers / kerninfo
function statBox(value: string, label: string): string {
    return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:6px 0 20px"><tr>
<td style="background:${BRAND.soft};border:1px solid ${BRAND.line};border-radius:12px;padding:18px 22px;font-family:${FONT}">
<div style="font-size:30px;font-weight:800;color:${BRAND.text};line-height:1.1">${esc(value)}</div>
<div style="font-size:13px;color:${BRAND.muted};margin-top:4px">${esc(label)}</div></td></tr></table>`;
}

function signature(): string {
    return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:26px;border-top:1px solid ${BRAND.line};width:100%"><tr>
<td style="padding-top:18px;font-family:${FONT};font-size:14px;line-height:1.5;color:${BRAND.body}">
<strong style="color:${BRAND.text}">Michael Maessen</strong><br>
<span style="color:${BRAND.muted}">Oprichter, Drapit</span></td></tr></table>`;
}

function layout(title: string, bodyHtml: string, preheader = '', footerNote = '', withSignature = true): string {
    const app = APP_URL();
    return `<!doctype html>
<html lang="nl" xmlns="http://www.w3.org/1999/xhtml"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light">
<title>${esc(title)}</title>
<style>
@media (max-width:620px){ .container{width:100%!important} .px{padding-left:22px!important;padding-right:22px!important} .h1{font-size:22px!important} }
a{color:${BRAND.blue}}
</style></head>
<body style="margin:0;padding:0;background:${BRAND.bg};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">${esc(preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${BRAND.bg}" style="background:${BRAND.bg}">
<tr><td align="center" style="padding:36px 12px">
<table role="presentation" class="container" width="600" cellspacing="0" cellpadding="0" border="0" style="width:600px;max-width:600px">

<tr><td bgcolor="${BRAND.dark}" style="background:${BRAND.dark};border-radius:16px 16px 0 0;padding:26px 36px" class="px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
<td align="left"><a href="${app}" target="_blank"><img src="${LOGO_URL()}" width="132" height="49" alt="Drapit" style="display:block;border:0;outline:none;width:132px;height:auto"></a></td>
<td align="right" style="font-family:${FONT};font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#94A3B8">Virtual Try-On</td>
</tr></table></td></tr>
<tr><td height="4" bgcolor="${BRAND.blue}" style="height:4px;line-height:4px;font-size:0;background:${BRAND.blue};background-image:linear-gradient(90deg,${BRAND.blue},${BRAND.cyan})">&nbsp;</td></tr>

<tr><td bgcolor="#ffffff" class="px" style="background:#ffffff;padding:36px 36px 34px;font-family:${FONT};font-size:15px;line-height:1.65;color:${BRAND.body};border-radius:0 0 16px 16px">
${bodyHtml}
${withSignature ? signature() : ''}
</td></tr>

<tr><td align="center" style="padding:26px 24px 8px;font-family:${FONT};font-size:12px;line-height:1.7;color:${BRAND.muted}">
<a href="${app}/dashboard" style="color:${BRAND.muted};text-decoration:none">Dashboard</a> &nbsp;·&nbsp;
<a href="${app}/contact" style="color:${BRAND.muted};text-decoration:none">Support</a> &nbsp;·&nbsp;
<a href="${app}" style="color:${BRAND.muted};text-decoration:none">drapit.io</a><br>
${footerNote ? esc(footerNote) + '<br>' : ''}Vragen? Beantwoord deze e-mail gewoon — je krijgt een mens, geen ticketsysteem.
</td></tr>
</table></td></tr></table></body></html>`;
}

function h1(text: string): string {
    return `<h1 class="h1" style="margin:0 0 14px;font-family:${FONT};font-size:24px;line-height:1.3;font-weight:800;color:${BRAND.text}">${text}</h1>`;
}

function p(html: string): string {
    return `<p style="margin:0 0 16px">${html}</p>`;
}

const APP = APP_URL;

// ---------------------------------------------------------------------------
// Trial-/onboardingreeks (dag 1, 3, 10, 14)
// ---------------------------------------------------------------------------
export function welcomeEmail(shopName: string): EmailContent {
    const dash = `${APP()}/dashboard`;
    const subject = `Welkom bij Drapit, ${shopName}`;
    const html = layout(subject, `
${h1(`Welkom bij Drapit, ${esc(shopName)}`)}
${p(`Je hebt Drapit geïnstalleerd. Vanaf nu kunnen je bezoekers je kleding virtueel passen op hun eigen foto, direct op de productpagina — zonder dat ze de site verlaten.`)}
${p(`<strong style="color:${BRAND.text}">In drie stappen live, binnen tien minuten:</strong>`)}
${steps([
        `<strong style="color:${BRAND.text}">Zet de widget aan</strong> in je Drapit-dashboard.`,
        `<strong style="color:${BRAND.text}">Activeer de app-embed</strong> in Shopify: Online Store → Thema aanpassen → App-embeds → Drapit.`,
        `<strong style="color:${BRAND.text}">Test het zelf</strong> op een productpagina met een foto van jezelf.`,
    ])}
${button(dash, 'Open je dashboard')}
${p(`<span style="font-size:14px;color:${BRAND.muted}">Je proefperiode duurt 14 dagen. Loop je ergens tegenaan, beantwoord dan deze e-mail — ik help je persoonlijk, desnoods samen aan de telefoon.</span>`)}`,
        'In drie stappen staat de pasknop live op je productpagina’s.',
        `Je ontvangt deze e-mail omdat Drapit is geïnstalleerd voor ${shopName}.`);
    const text = `Welkom bij Drapit, ${shopName}

Je hebt Drapit geïnstalleerd. Zo staat de pasknop binnen tien minuten live:
1. Zet de widget aan in je dashboard: ${dash}
2. Activeer de app-embed in Shopify: Online Store > Thema aanpassen > App-embeds > Drapit.
3. Test het zelf op een productpagina met een foto van jezelf.

Je proefperiode duurt 14 dagen. Vragen? Beantwoord deze e-mail.

Michael Maessen
Oprichter, Drapit`;
    return { subject, html, text };
}

export function day3Email(shopName: string): EmailContent {
    const dash = `${APP()}/dashboard`;
    const subject = `Staat de pasknop al live, ${shopName}?`;
    const html = layout(subject, `
${h1('Staat de pasknop al live?')}
${p(`Een korte check na drie dagen. Winkels die de knop in de eerste week live zetten, zien meteen try-ons binnenkomen — dus het loont om het nu af te ronden.`)}
${p(`<strong style="color:${BRAND.text}">Nog niet zichtbaar? Meestal is het een van deze twee:</strong>`)}
${steps([
        `De widget staat nog <strong style="color:${BRAND.text}">uit</strong> in het Drapit-dashboard.`,
        `De <strong style="color:${BRAND.text}">app-embed</strong> staat niet aan in je thema (Thema aanpassen → App-embeds → Drapit).`,
    ])}
${button(dash, 'Controleer je instellingen')}
${p(`<strong style="color:${BRAND.text}">Staat hij al live?</strong> Deel het dan één keer met je volgers — "pas onze nieuwe collectie virtueel op jezelf" doet het goed in een story of nieuwsbrief.`)}
${p(`<span style="font-size:14px;color:${BRAND.muted}">Kom je er niet uit? Stuur me de link van je shop, dan kijk ik vandaag nog mee.</span>`)}`,
        'Een korte check na drie dagen — en één tip.',
        `Je ontvangt deze e-mail omdat Drapit is geïnstalleerd voor ${shopName}.`);
    const text = `Staat de pasknop al live, ${shopName}?

Nog niet zichtbaar? Meestal:
1. De widget staat nog uit in het dashboard: ${dash}
2. De app-embed staat niet aan in je thema (Thema aanpassen > App-embeds > Drapit).

Staat hij live? Deel het één keer met je volgers.
Kom je er niet uit? Stuur me de link van je shop.

Michael Maessen
Oprichter, Drapit`;
    return { subject, html, text };
}

export function day10Email(shopName: string, tryonsUsed: number): EmailContent {
    const dash = `${APP()}/dashboard`;
    const has = tryonsUsed > 0;
    const subject = has
        ? `${tryonsUsed} try-ons in 10 dagen — je tussenstand, ${shopName}`
        : `Nog 4 dagen proefperiode, ${shopName}`;
    const body = has
        ? `${h1('Je tussenstand na tien dagen')}
${statBox(String(tryonsUsed), 'keer virtueel gepast in je shop')}
${p(`Elk van die momenten is een bezoeker die twijfelde over maat of model — en het toch bekeek in plaats van weg te klikken. In het dashboard zie je welke producten het vaakst gepast worden: dat zijn je kandidaten voor de homepage en je volgende post.`)}
${button(dash, 'Bekijk je statistieken')}`
        : `${h1('Nog vier dagen proefperiode')}
${p(`Ik zie nog geen try-ons binnenkomen. Dat betekent bijna altijd dat de knop nog niet zichtbaar is op je productpagina's.`)}
${p(`Stuur me de link van je shop als antwoord op deze mail — ik controleer het vandaag nog voor je. Dat kost jou geen minuut.`)}
${button(dash, 'Open je dashboard')}`;
    const html = layout(subject, `${body}
${p(`<span style="font-size:14px;color:${BRAND.muted}">Over vier dagen gaat je gekozen plan in. Wisselen of stoppen kan altijd via Abonnement in het dashboard.</span>`)}`,
        'Tussenstand na tien dagen.',
        `Je ontvangt deze e-mail omdat Drapit is geïnstalleerd voor ${shopName}.`);
    const text = (has
        ? `In tien dagen is er ${tryonsUsed} keer virtueel gepast in ${shopName}. Bekijk welke producten het meest gepast worden: ${dash}`
        : `Nog vier dagen proefperiode, maar nog geen try-ons in ${shopName}. Stuur me de link van je shop, dan controleer ik het vandaag.`)
        + `\n\nOver vier dagen gaat je gekozen plan in. Wisselen of stoppen kan via Abonnement in het dashboard.\n\nMichael Maessen\nOprichter, Drapit`;
    return { subject, html, text };
}

export function day14Email(shopName: string, tryonsUsed: number): EmailContent {
    const billing = `${APP()}/dashboard/billing`;
    const subject = `Je proefperiode is afgerond, ${shopName}`;
    const html = layout(subject, `
${h1('Je proefperiode is afgerond')}
${p(`Je 14 dagen Drapit zitten erop. Je gekozen plan loopt vanaf vandaag door — je hoeft niets te doen.`)}
${statBox(String(tryonsUsed), 'try-ons in je eerste twee weken')}
${p(`<strong style="color:${BRAND.text}">Wat je van mij mag verwachten:</strong>`)}
${steps([
        `Je <strong style="color:${BRAND.text}">houdt je huidige prijs</strong> zolang je klant blijft, ook als de actieprijzen straks omhoog gaan.`,
        `Eén keer per maand een kort overzicht: try-ons, meest gepaste producten en wat andere winkels ermee doen.`,
    ])}
${button(billing, 'Bekijk je abonnement')}
${p(`<span style="font-size:14px;color:${BRAND.muted}">Bracht het niet wat je hoopte? Vertel me wat er miste — daar leer ik meer van dan van elke klant die blijft.</span>`)}`,
        'Je plan loopt nu door.',
        `Je ontvangt deze e-mail omdat Drapit is geïnstalleerd voor ${shopName}.`);
    const text = `Je proefperiode is afgerond, ${shopName}.

Je gekozen plan loopt vanaf vandaag door; je hoeft niets te doen.
Try-ons in je eerste twee weken: ${tryonsUsed}

Je houdt je huidige prijs zolang je klant blijft. Abonnement bekijken: ${billing}

Bracht het niet wat je hoopte? Beantwoord deze e-mail.

Michael Maessen
Oprichter, Drapit`;
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
${h1(reached ? 'Maandlimiet bereikt' : `${percentage}% van je maandlimiet gebruikt`)}
${statBox(`${used} / ${limit}`, 'try-ons deze maand')}
<p style="margin:0 0 16px">${reached
        ? `Je shop heeft deze maand de limiet van <strong>${limit} try-ons</strong> bereikt. De pasknop blijft zichtbaar, maar nieuwe try-ons worden pas weer verwerkt na de maandwissel — of direct na een upgrade of extra bundel.`
        : `Je shop zit op <strong>${used} van ${limit} try-ons</strong> deze maand (${percentage}%). Goed teken: je klanten gebruiken het. Nog ${Math.max(0, limit - used)} te gaan.`}</p>
${button(billing, reached ? 'Upgrade of koop extra try-ons' : 'Bekijk je plan')}`);
    const text = `${subject}\n\n${used} van ${limit} try-ons gebruikt deze maand. Plan bekijken: ${billing}\n\nMichael`;
    return { subject, html, text };
}

export function newMerchantAdminEmail(p: { merchantEmail: string; merchantName: string; shopName: string; domain: string; phone?: string; plan: string; }): EmailContent {
    const subject = `Nieuwe merchant: ${p.shopName} (${p.plan})`;
    const rows = [
        ['Shop', p.shopName], ['Domein', p.domain], ['Contact', p.merchantName], ['E-mail', p.merchantEmail],
        ['Telefoon', p.phone || 'Niet opgegeven'], ['Plan', p.plan],
    ].map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:${BRAND.muted}">${esc(k)}</td><td style="padding:4px 0">${esc(v)}</td></tr>`).join('');
    const html = layout(subject, `<h2 style="font-size:18px;margin:0 0 12px">Nieuwe merchant aangemeld</h2><table style="font-size:15px">${rows}</table>${button(`${APP()}/admin`, 'Open admin')}`, '', '', false);
    const text = `Nieuwe merchant: ${p.shopName}\nDomein: ${p.domain}\nContact: ${p.merchantName}\nE-mail: ${p.merchantEmail}\nTelefoon: ${p.phone || 'Niet opgegeven'}\nPlan: ${p.plan}\n${APP()}/admin`;
    return { subject, html, text };
}

export function contactFormEmail(p: { fromName: string; fromEmail: string; phone?: string; webshopName?: string; brandClothing?: string; subject: string; message: string; }): EmailContent {
    const subject = `Contactformulier: ${p.subject} — ${p.fromName}`;
    const rows = [
        ['Naam', p.fromName], ['E-mail', p.fromEmail], ['Telefoon', p.phone || 'Niet opgegeven'],
        ['Webshop', p.webshopName || 'Niet opgegeven'], ['Merk/kleding', p.brandClothing || 'Niet opgegeven'],
    ].map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:${BRAND.muted}">${esc(k)}</td><td style="padding:4px 0">${esc(v)}</td></tr>`).join('');
    const html = layout(subject, `<h2 style="font-size:18px;margin:0 0 12px">${esc(p.subject)}</h2><table style="font-size:15px">${rows}</table><p style="white-space:pre-wrap;margin-top:18px;padding:14px;background:${BRAND.bg};border-radius:8px">${esc(p.message)}</p>`, '', '', false);
    const text = `${p.subject}\nVan: ${p.fromName} <${p.fromEmail}>\nTelefoon: ${p.phone || '-'}\nWebshop: ${p.webshopName || '-'}\nMerk: ${p.brandClothing || '-'}\n\n${p.message}`;
    return { subject, html, text };
}
