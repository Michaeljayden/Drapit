# Shopify-fixes — wat is gewijzigd + jouw stappen

Geïmplementeerd op 30 juni 2026. Stripe-flow voor directe drapit.io-klanten is volledig
intact; alle nieuwe logica geldt alleen voor Shopify-merchants (`billing_source = 'shopify'`).
Type-check (`npx tsc --noEmit`) is groen.

## 1.2.1 — Billing volledig on-platform (Shopify Managed Pricing)

- **Install koppelt nu aan een dashboard-account.** `app/api/auth/shopify/callback/route.ts`
  maakt bij install een eigen login (owner_id) voor de store en logt de merchant automatisch
  in via een magic link. Daardoor wordt hij in het dashboard als Shopify-merchant herkend.
  (Nieuwe helper: `lib/shopify-onboarding.ts`.)
- **Dashboard toont géén Stripe meer aan Shopify-merchants.** Op de billing-pagina zien zij
  alleen een knop **"Plan kiezen of wijzigen in Shopify"** die deeplinkt naar de Managed
  Pricing-pagina. Geen Stripe-checkout, geen Stripe-portal, geen auto-topup.
  (`app/(dashboard)/dashboard/billing/page.tsx`, helper `lib/shopify-managed-pricing.ts`.)
- **Studio is verborgen voor Shopify-merchants** (zat volledig op Stripe) — in de billing-pagina
  én de sidebar (`components/dashboard/Sidebar.tsx`, `app/(dashboard)/layout.tsx`).
- **Plan-sync.** Nieuwe webhook `app_subscriptions/update` houdt plan + try-on-limiet in sync
  als de merchant op Shopify wisselt (`app/api/webhook/shopify/app_subscriptions/update/route.ts`,
  geregistreerd in `shopify.app.toml`).

## 2.1.1 — Widget werkt nu zonder handmatige key

- **Zero-config key.** Bij install wordt automatisch een widget-key gegenereerd en gecached
  (`shops.widget_public_key`). De theme-block geeft het shop-domein mee
  (`data-drapit-shop`), en de widget haalt zijn key op via het nieuwe endpoint
  `/api/widget/config`. De merchant hoeft niets meer te plakken.
- **Placeholder weg.** De misleidende default `dk_live_...` is uit de theme-block gehaald.
- **Nette foutmeldingen.** De widget toont nu een duidelijke melding bij een ontbrekende/
  ongeldige key i.p.v. een kale fout (`public/widget/drapit-widget.js`).

---

## Wat JIJ nog moet doen voordat je herindient

1. **Supabase redirect-URL toevoegen** (nodig voor de auto-login):
   Supabase → Authentication → URL Configuration → Redirect URLs →
   voeg toe: `https://drapit.io/auth/callback`
2. **Env var zetten** (Netlify): `SHOPIFY_APP_HANDLE` = de exacte app-handle uit je
   Partner Dashboard (de fallback is nu `drapit-virtual-try-on`). Controleer de echte handle
   door in te loggen op een teststore en de URL van je pricing-pagina te bekijken:
   `admin.shopify.com/store/<store>/charges/<APP-HANDLE>/pricing_plans`.
3. **Deployen** (Netlify) en de **theme app extension opnieuw deployen**
   (`shopify app deploy`) zodat de bijgewerkte block + webhook live gaan.
4. **Testen op je development store** (volledige flow):
   - App installeren → Shopify toont Managed Pricing → kies een plan
   - Je landt automatisch ingelogd in het dashboard (herkend als Shopify)
   - Billing-pagina toont alleen "Beheren in Shopify" (geen Stripe, geen Studio)
   - Widget-block toevoegen aan productpagina → foto uploaden → try-on slaagt
     zonder dat je een key hebt geplakt
5. **Shopify's "Automatische controle op veelvoorkomende fouten" opnieuw draaien**
   (verlopen na 30 dgn) en dan **Fixes indienen** via Distributie.

## Kleine aandachtspunten (geen blocker)
- De FAQ onderaan de billing-pagina bevat nog Studio-vragen; cosmetisch, mag blijven.
- `/dashboard/studio` is alleen uit de navigatie verborgen voor Shopify-merchants, niet
  geblokkeerd op URL-niveau (aankopen worden serverseitig al met 403 geweigerd).
- De DB-kolom `shops.widget_public_key` is al toegevoegd (migratie uitgevoerd).
