# Shopify App Store — herindiening: implementatieplan

Status: 30 juni 2026. Schorsing is voorbij (eindigde 26 mei). Twee openstaande eisen:
**1.2.1** (Managed Pricing / Billing API) en **2.1.1** (geen kritieke fouten — widget-uploadfout).

Onderbouwing komt uit je live Supabase (`gnodjtnirqoosurekdgd`) + codebase.

---

## Bevestigde oorzaken

### 1.2.1 — Off-platform billing
- **Elke** shop in de DB staat op `billing_source = 'stripe'`, `shopify_domain = null`,
  `shopify_app_installed = false` — inclusief het reviewer-account "App rev" (23 apr).
  Er is dus nooit een merchant via Shopify-OAuth binnengekomen.
- Je dashboard koppelt accounts op `owner_id` (Supabase-login). De Shopify-install
  (`/api/auth/shopify/callback`) maakt een **losse** shop op `shopify_domain` **zonder**
  `owner_id` en zonder login. Gevolg: een Shopify-merchant wordt in het dashboard niet
  als Shopify herkend en valt in het **Stripe**-pad → "plan wijzigen" → Stripe checkout
  = de off-platform pagina uit de screencast.
- In `shopify.app.toml` staat **Shopify Managed Pricing al geconfigureerd** (`[pricing_plans]`:
  Starter/Pro/Scale/Business). Maar het dashboard toont daarnaast eigen Stripe-plan-kaarten.
  Die twee botsen — Shopify wil exact één on-platform mechanisme.

### 2.1.1 — Widget-fout na uploaden
- Geen enkele `tryon` (ook geen mislukte) van het reviewer-account, en dat account heeft
  **geen API-key**. Echte keys beginnen met `Drapit_…`; de theme-block heeft als default
  de placeholder `dk_live_…`.
- Conclusie: de reviewer uploadde met een ongeldige/placeholder key → `/api/upload` gaf
  **401** → "Foto upload mislukt". De fout zit vóór de AI-verwerking, in de key-koppeling.
  Gemini en storage werken (buckets `tryons`/`results`/`custom_models` bestaan; 16 try-ons
  geslaagd vanaf je eigen testshop).

---

## Plan 1.2.1 — billing volledig on-platform

### A. Koppel Shopify-install aan een dashboard-account
`app/api/auth/shopify/callback/route.ts`
- Na het upserten van de shop: zoek/maak een Supabase auth-user op basis van het shop-email,
  zet `shops.owner_id` op die user, en log de merchant direct in (magic-link/sessie), zodat
  hij in het dashboard als Shopify-merchant herkend wordt.
- `billing_source='shopify'` en `shopify_app_installed=true` worden al gezet — behouden.

### B. Dashboard verbergt Stripe voor Shopify-merchants
`app/(dashboard)/dashboard/billing/page.tsx` + `components/dashboard/BillingActions.tsx`,
`StudioBillingActions.tsx`, `AutoTopupSettings.tsx`, sidebar
- Als `billing_source === 'shopify'`:
  - VTON plan-kaarten vervangen door één knop **"Beheer abonnement in Shopify"** die deeplinkt
    naar de Managed Pricing-pagina:
    `https://admin.shopify.com/store/<store>/charges/<app-handle>/pricing_plans`.
  - **Studio-sectie + credit-packs volledig verbergen** (Stripe-only) — conform jouw keuze.
  - Stripe-portal en auto-topup-UI verbergen.
- Server-routes (`/api/stripe/*`) blokkeren Shopify al met 403; de UI mag ze simpelweg niet tonen.

### C. Actief plan uit Shopify lezen + sync
`lib/shopify-billing.ts` (+ nieuwe webhook, `shopify.app.toml`)
- Helper `getActiveSubscription()` via GraphQL
  `currentAppInstallation { activeSubscriptions { name status } }` → map naar jouw plan-keys
  en `monthly_tryon_limit`.
- Webhook `app_subscriptions/update` toevoegen zodat limiet/plan meelopen als de merchant op
  Shopify wisselt.

### D. Conflicten opruimen
- Met Managed Pricing is de custom `RecurringApplicationCharge`-flow
  (`/api/billing/shopify/create` + `/callback`) overbodig en verwarrend voor de reviewer.
  Aanbeveling: uitschakelen/verwijderen zodat er precies één billing-mechanisme is.

**Risico/omvang:** middel-hoog. Stap A (login-koppeling voor non-embedded app) is het meest
kritisch en moet op een Shopify **development store** getest worden.

---

## Plan 2.1.1 — widget (gekozen: BEIDE)

### A. Automatische API-key bij install
`app/api/auth/shopify/callback/route.ts` (+ key-helper uit `/api/keys`)
- Genereer bij install automatisch een API-key (`Drapit_…`, hash in `api_keys`) en zet die
  in de theme-app-extension, zodat de merchant niets hoeft te plakken. Je hebt `write_themes`
  al als scope.

### B. Nette foutafhandeling als vangnet
`public/widget/drapit-widget.js` + `extensions/drapit-vton-button/blocks/vton_button.liquid`
- Bij `/api/upload` 401: duidelijke melding i.p.v. generieke fout; in de console een hint voor
  de merchant ("API-key ontbreekt/ongeldig").
- Placeholder `dk_live_…` uit de block-default halen; korte uitleg waar de key vandaan komt.

**Risico/omvang:** laag-middel. Foutafhandeling is snel; auto-injectie hangt aan de
theme-extensie.

---

## Verificatie & herindiening
1. `npm run build` + lint groen.
2. Test op een Shopify development store: install → Managed Pricing → dashboard herkent
   Shopify → "Beheer in Shopify" deeplink → widget laadt met auto-key → upload + try-on werkt.
3. Run Shopify's "Automatische controle op veelvoorkomende fouten" opnieuw (>30 dgn verlopen).
4. Dien fixes in via Partner Dashboard → Distributie → "Fixes indienen".

---

## Beslissing nodig
- **Billing-route:** Managed Pricing + login-koppeling (A–D hierboven, aanbevolen) **of** terug
  naar custom Billing API en Managed Pricing uit de TOML halen?
- **Volgorde:** wil je dat ik begin met 2.1.1 (widget, sneller/lager risico) of 1.2.1 (billing)?
