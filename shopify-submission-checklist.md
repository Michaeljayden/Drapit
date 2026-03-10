# Drapit — Shopify App Store Submission Checklist
> Gebaseerd op de officiële [Shopify App Store requirements](https://shopify.dev/docs/apps/launch/app-reviews/requirements)
> Status: **klaar voor indiening** — alle technische punten zijn afgehandeld

---

## ✅ GDPR Webhooks (verplicht)

| Webhook | Route | Status |
|---------|-------|--------|
| `customers/data_request` | `/api/webhook/shopify/customers/data_request` | ✅ Geïmplementeerd |
| `customers/redact` | `/api/webhook/shopify/customers/redact` | ✅ Geïmplementeerd |
| `shop/redact` | `/api/webhook/shopify/shop/redact` | ✅ Geïmplementeerd |
| `app/uninstalled` | `/api/webhook/shopify/app/uninstalled` | ✅ Geïmplementeerd |

Alle webhooks verifiëren HMAC-SHA256 via `lib/shopify-webhook.ts`.

---

## ✅ Billing via Shopify Billing API (verplicht voor App Store)

| Plan | Prijs | Try-ons/maand |
|------|-------|--------------|
| Free trial | €0 | 20 |
| Starter | €49/m | 500 |
| Pro | €199/m | 2.500 |
| Scale | €399/m | 5.000 |
| Business | €799/m | 10.000 |

- ✅ `lib/shopify-billing.ts` — RecurringApplicationCharge flow
- ✅ `/api/billing/shopify/create` — maakt charge aan, retourneert confirmation_url
- ✅ `/api/billing/shopify/callback` — activeert na goedkeuring merchant
- ✅ `billing_source` column in Supabase (stripe | shopify) — dual billing werkt

---

## ✅ OAuth / Security

| Check | Status |
|-------|--------|
| HMAC verificatie in install callback | ✅ |
| CSRF state nonce (in cookie) | ✅ Geïmplementeerd in deze sessie |
| Shop domain validatie (regex) | ✅ Geïmplementeerd in deze sessie |
| Redirect URI exact match | ✅ (registreer beide in Partner Dashboard) |
| Constant-time HMAC vergelijking | ✅ |

---

## ✅ Access Scopes (least privilege)

```toml
scopes = "read_themes,write_themes"
```

- `write_products` is **verwijderd** — widget leest productafbeelding uit Liquid context (`product.featured_image`), niet via Admin API
- `read_themes,write_themes` is nodig om de widget script tag te injecteren

---

## ✅ App Configuration

```toml
embedded = false   # standalone dashboard op drapit.io, geen App Bridge nodig
```

- App Bridge is NIET nodig — Drapit's functionaliteit zit in de Liquid theme extension
- Merchants beheren alles op drapit.io/dashboard (externe URL)

---

## ✅ Privacy Policy

- URL: `https://drapit.io/privacy`
- Bevat: GDPR-rechten, sub-processors tabel, shoppers foto beleid (direct verwijderd), Shopify GDPR webhook compliance
- Footer links bijgewerkt (geen placeholder `href="#"` meer)

---

## ✅ App Store Listing (klaar om in te vullen)

Zie `shopify-app-store-listing.md` voor alle teksten.

**In Partner Dashboard invullen:**
- App name: `Drapit ‑ Virtual Try‑On` (let op: U+2011 non-breaking hyphen)
- Subtitle, Short description, Long description: uit listing bestand
- Privacy Policy URL: `https://drapit.io/privacy`
- Support email: `info@drapit.io`
- Developer website: `https://drapit.io`
- Pricing: 5 plannen zoals beschreven

---

## 🔲 NOG TE DOEN (handmatig)

### Screenshots (jij moet dit doen)
Shopify vereist minimaal 3 screenshots. Maak ze van de echte app.

| Screenshot | Afmetingen | Inhoud |
|------------|-----------|--------|
| Desktop 1 | 1600×900px | Try-on widget op productpagina met resultaat |
| Desktop 2 | 1600×900px | Drapit dashboard — analytics/try-on overzicht |
| Desktop 3 | 1600×900px | Widget aanpassen (kleur/tekst) in dashboard |
| Mobile 1 | 900×1600px | Widget op mobiele productpagina |

### App Icon
- Formaat: 1200×1200px, PNG
- Geen tekst, geen transparante achtergrond
- Geen rood/oranje (verwarring met Shopify UI)

### Partner Dashboard registratie
1. Ga naar [partners.shopify.com](https://partners.shopify.com) → Apps → jouw app
2. Stel de redirect URL's in:
   - `https://drapit.io/api/auth/callback`
   - `https://drapit.io/api/auth/shopify/callback`
3. Deploy `shopify.app.toml` met `shopify app deploy`
4. Vul de listing in (gebruik `shopify-app-store-listing.md`)
5. Upload screenshots en app icon
6. Submit for review

### Deploy toml naar Shopify
```bash
shopify app deploy
```
Dit registreert de gewijzigde webhooks, scopes en `embedded = false` bij Shopify.

---

## 🔲 Testen vóór indiening

| Test | Hoe |
|------|-----|
| Installeer app op test store | Shopify development store |
| Doorloop volledige OAuth flow | Controleer state nonce, HMAC |
| Kies een plan via Shopify Billing | Merchant approval flow |
| Gebruik try-on widget op productpagina | Upload foto → zie resultaat |
| Verwijder app → shop/redact webhook | Verifieer data verwijdering |
| Test GDPR webhooks met Shopify CLI | `shopify app dev` → webhook triggers |

---

## Shopify Review — Wat reviewers controleren

1. **Functioneert de app?** — installeren, widget activeren, plan kiezen
2. **GDPR webhooks?** — reageren binnen 5 seconden op alle 3 GDPR topics
3. **Shopify Billing?** — geen directe betalingen buiten Shopify om voor App Store installs
4. **Privacy Policy?** — URL bereikbaar, GDPR-compliant
5. **Scopes?** — alleen wat écht nodig is (least privilege)
6. **Listingkwaliteit?** — screenshots van echte software, geen stockfoto's

---

*Gegenereerd op 10 maart 2026*
