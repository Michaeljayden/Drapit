# Shopify App Store — volledig fixverslag

Laatst bijgewerkt: 2 juli 2026. Schorsing loopt tot **30 juli 2026** — dan herindienen.
Alle wijzigingen zijn live op drapit.io (via GitHub → Netlify). Stripe voor directe
(niet-Shopify) drapit.io-klanten blijft volledig intact; alle Shopify-logica is gescheiden
via `billing_source`.

---

## Status van de twee review-eisen

- **2.1.1 — App zonder kritieke fouten (widget-upload):** ✅ Geaccepteerd bij de 2e review
  (stond niet meer in de laatste afwijzing).
- **1.2.1 — Shopify Managed Pricing / geen off-platform billing:** ✅ Opgelost + live
  geverifieerd (zie "De doorbraak" hieronder). Klaar om op 30 juli in te dienen.

---

## De hoofdoorzaak die alles verklaarde (de doorbraak)

De reviewer bleef 1.2.1 afwijzen met *"een combinatie van Shopify Billing + off-platform
billing."* De database bevestigde waarom: het reviewer-account (`app.tester115@shopify.com`)
stond op `billing_source = 'stripe'` met `shopify_domain = null`.

**Oorzaak:** de App Store-installatie stuurt de merchant naar `drapit.io/dashboard?shop=…`,
maar de app deed daar niets mee. Zonder sessie belandde de reviewer in het gewone
aanmeldscherm en werd een **directe Stripe-account** → dus zag hij zowel Managed Pricing
(bij install) als de volledige Stripe-UI in de app.

**De fix (`lib/supabase/middleware.ts`):** zodra Shopify de app opent met `?shop=` en er is
geen sessie, start de app nu **automatisch de Shopify-OAuth-install**. Daardoor wordt élke
App Store-merchant correct als Shopify-merchant onboarded (`billing_source = 'shopify'`) →
alleen Managed Pricing, nooit Stripe. Plus: Shopify-merchants kunnen de (Stripe-)Studio-
pagina's niet meer bereiken.

**Live geverifieerd:** een verse bezoeker via `?shop=` wordt nu doorgestuurd naar Shopify-
OAuth (niet naar Stripe), en als Shopify-merchant ingelogd toont het dashboard geen Studio
en de billing-pagina alleen "Beheren in Shopify".

---

## Alle doorgevoerde fixes (chronologisch, incl. wat live testen blootlegde)

### 1.2.1 — Billing volledig on-platform
1. **Ontbrekende `SHOPIFY_API_KEY` in Netlify** → OAuth-install crashte ("client_id
   undefined"). Toegevoegd in Netlify env vars (`b4be0e4c410809e0f2b872950484cae1`).
2. **Unieke e-mail-constraint op `shops`** → "Failed to save shop data" bij install.
   Constraint verwijderd (een Shopify-install en een direct account mogen hetzelfde
   e-mailadres delen).
3. **Auto-login gebruikte de verkeerde token-flow** → merchant belandde op de login-pagina.
   `/auth/callback` verifieert nu server-side via `verifyOtp`.
4. **App Store-entry ging niet door OAuth** (de doorbraak hierboven) → middleware stuurt
   `?shop=` zonder sessie nu naar Shopify-OAuth.
5. **Dashboard verbergt Stripe voor Shopify-merchants:** billing-pagina toont alleen
   "Plan kiezen of wijzigen in Shopify" (Managed Pricing-deeplink); Studio + credit-packs +
   Stripe-portal + auto-topup verborgen; Studio ook geblokkeerd op URL-niveau.
6. **Plan-synchronisatie** (`syncShopifyPlan`): leest het actieve Managed-Pricing-abonnement
   en zet automatisch het juiste plan + try-on-limiet — per merchant, zonder CLI.

### 2.1.1 — Widget werkt zonder handmatige key
7. **Zero-config key:** bij install wordt automatisch een publiceerbare widget-key aangemaakt
   (`shops.widget_public_key`), en de widget haalt die op via `/api/widget/config` op basis
   van het shop-domein (`window.Shopify.shop`) — geen key plakken nodig.
8. **Widget-robuustheid:** popup wordt op body-niveau gemonteerd met geforceerde
   `display:block` (altijd bovenop, nooit achter het product), plus zelfherstel bij een
   tijdelijke netwerkhapering.

---

## Wat JIJ nog moet doen (op/na 30 juli)

1. **Herindienen:** Partner Dashboard → je app → **Distributie / App Store-recensie** →
   draai de **"Automatische controle op veelvoorkomende fouten"** opnieuw → **"Fixes indienen"**.
2. **(Aanbevolen) Vóór indienen samen verifiëren:** een verse installatie op de teststore
   doorlopen zoals de reviewer, en bevestigen dat je op de Shopify-only billing-pagina landt.

## Optioneel (geen blocker)
- `shopify app deploy` alleen als je de realtime `app_subscriptions/update`-webhook wilt
  registreren (de dashboard-sync dekt het plan/limiet nu al af).
- De reviewer's oude Stripe-testaccounts (`app.tester*@shopify.com`) in de database zijn
  onschadelijk; een verse install maakt een apart, correct Shopify-record aan.

## Belangrijke waarden / config
- Netlify env: `SHOPIFY_API_KEY` = `b4be0e4c410809e0f2b872950484cae1` (aanwezig),
  `SHOPIFY_API_SECRET` (aanwezig). App-handle voor Managed Pricing: `drapit-virtual-try-on`.
- Supabase Auth → Redirect URLs bevat `https://drapit.io/auth/callback` (nodig voor auto-login).
