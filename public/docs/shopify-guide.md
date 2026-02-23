# Drapit installeren op Shopify

## Stap 1 — Drapit account aanmaken

1. Ga naar [app.drapit.io/dashboard/login](https://app.drapit.io/dashboard/login)
2. Maak een account aan en kies een abonnement
3. Ga naar **API-sleutels** en maak een nieuwe sleutel aan
4. Kopieer de API-sleutel (begint met `dk_live_`)

## Stap 2 — Script toevoegen aan je Shopify theme

1. Ga in je Shopify admin naar **Online Store → Themes**
2. Klik op **Customize** bij je actieve theme
3. Klik op het **⋮** menu → **Edit code**
4. Open het bestand `theme.liquid` (of `layout/theme.liquid`)
5. Plak dit net vóór de `</head>` tag:

```html
<!-- Drapit Virtual Try-On -->
<script
  src="https://app.drapit.io/widget/drapit-widget.js"
  data-drapit-key="JOUW_API_SLEUTEL"
  data-drapit-color="#1D6FD8"
  data-drapit-cta="Virtueel passen"
  defer
></script>
```

6. Vervang `JOUW_API_SLEUTEL` met de sleutel uit stap 1
7. Klik **Save**

## Stap 3 — Product-elementen markeren

Drapit zoekt automatisch naar HTML-elementen met `data-drapit-product` attributen.

### Optie A: Shopify Liquid (aanbevolen)

Open je product template (bijv. `sections/product-template.liquid` of `templates/product.liquid`) en voeg `data-drapit-*` attributen toe aan je product container:

```liquid
<div class="product-info"
  data-drapit-product="{{ product.featured_image | img_url: 'grande' }}"
  data-drapit-product-id="{{ product.variants.first.sku | default: product.id }}"
  data-drapit-product-name="{{ product.title }}"
  data-drapit-buy-url="{{ product.url }}"
>
  <!-- Je bestaande product HTML -->
</div>
```

### Optie B: Shopify Online Store 2.0 (Custom Liquid blok)

1. Ga naar **Customize** bij je theme
2. Voeg een **Custom Liquid** blok toe aan je productpagina
3. Plak de code uit Optie A

## Stap 4 — Testen

1. Open een productpagina in je Shopify winkel
2. Je zou een **"Virtueel passen"** knop moeten zien onder elk product
3. Klik op de knop → upload een foto → wacht op het resultaat

## Veelgestelde vragen

**Werkt het met alle Shopify themes?**
Ja, het script werkt met elk Shopify theme dat HTML gebruikt. Het gebruikt Shadow DOM zodat er geen stijlconflicten zijn.

**Kan ik de knopkleur aanpassen?**
Ja, pas `data-drapit-color` aan in het script. Gebruik elke HEX-kleur.

**Kan ik de knoptekst aanpassen?**
Ja, pas `data-drapit-cta` aan. Bijvoorbeeld: `data-drapit-cta="Probeer het aan"`.

**Telt elke klik als een try-on?**
Nee, alleen wanneer een klant daadwerkelijk een foto uploadt en het resultaat wordt verwerkt.

**Kan ik de widget op specifieke producten uitzetten?**
Ja, verwijder simpelweg het `data-drapit-product` attribuut van producten waar je geen try-on wilt.
