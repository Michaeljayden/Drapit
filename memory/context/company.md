# Drapit — Bedrijfscontext

## Wat Is Drapit
AI virtual try-on app voor Shopify stores. Shoppers kunnen kleding virtueel passen via een widget op de productpagina. Het model draait op Replicate (viktorfa/idm-vton) en wordt asynchroon via webhooks verwerkt.

**Website:** drapit.io
**App naam:** drapit-app

## Oprichter
Michael Maessen — solo founder. Doet alles zelf (dev, marketing, sales, support).

## Tech Stack
| Tool | Gebruik | Intern |
|------|---------|--------|
| Next.js | Frontend & API routes | - |
| Supabase | Database, auth, storage | - |
| Replicate | AI model (VTON) | "het model" |
| Shopify | App platform & distributie | - |
| GitHub | Code & issues (taakbeheer) | - |
| Gmail / SMTP | Email communicatie | - |
| WhatsApp / Telegram | Informele communicatie | - |

## Actieve Projecten
| Project | Wat | Focus |
|---------|-----|-------|
| VTON core | AI try-on kwaliteit en betrouwbaarheid | Technisch |
| Shopify distributie | App store groei en merchant onboarding | Distributie |
| Marketing | Merchant acquisitie en growth | Groei |

## Dataflow
```
Merchant installeert Drapit widget op Shopify store
  ↓
Shopper kiest kledingstuk op productpagina
  ↓
Widget stuurt foto's naar drapit.io/api/tryon
  ↓
Replicate verwerkt VTON AI-model
  ↓
Webhook callback naar drapit.io/api/webhook/replicate
  ↓
Resultaat verschijnt in de widget
```

## Processen
| Proces | Wat het betekent |
|--------|-----------------|
| GitHub Issues | Primair taakbeheer voor alle development taken |
| Deploy | Push naar drapit.io (productie) |
| Prediction | Een VTON-verzoek verwerken via Replicate |
| Webhook | Replicate callback na verwerking |
| Merchant onboarding | Nieuwe klant installeert en configureert Drapit |

## Toekomstplannen
- Freelancers / developers aantrekken voor hulp
- Shopify merchants als klanten werven
- API providers (Replicate, Supabase) optimaliseren
- Geen externe investeerders (bootstrapping)
