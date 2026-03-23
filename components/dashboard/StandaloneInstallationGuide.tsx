'use client';

import { useState } from 'react';

type Platform = 'wordpress' | 'magento' | 'html';

interface Step {
  title: string;
  description: string;
  code?: string;
  codeLabel?: string;
  tip?: string;
  warning?: string;
}

const PLATFORMS: { id: Platform; label: string; icon: string }[] = [
  { id: 'wordpress', label: 'WordPress / WooCommerce', icon: '🌐' },
  { id: 'magento', label: 'Magento / Adobe Commerce', icon: '🛒' },
  { id: 'html', label: 'Aangepaste HTML', icon: '💻' },
];

const STEPS: Record<Platform, Step[]> = {
  wordpress: [
    {
      title: 'Ga naar je WordPress-dashboard',
      description:
        'Log in op je WordPress-website via jouwwebsite.nl/wp-admin. Navigeer daarna naar Weergave → Thema-editor (of gebruik een plugin zoals "Insert Headers and Footers" voor een veiligere methode).',
      tip: 'Tip: We raden de plugin "Insert Headers and Footers" aan. Dan hoef je niet in de themacode te werken en is het veiliger.',
    },
    {
      title: 'Kopieer het installatiescript',
      description:
        'Kopieer het script hierboven (in de "Installatie" sectie). Dit is een kleine coderegel die de Drapit widget laadt op je webshop.',
      tip: 'Gebruik de "Kopiëren" knop bovenaan deze pagina om het script gegarandeerd foutloos te kopiëren.',
    },
    {
      title: 'Plak het script in de <head>',
      description:
        'Als je de "Insert Headers and Footers" plugin gebruikt: ga naar Instellingen → Insert Headers and Footers en plak het script in het vak "Scripts in Header". Klik op Opslaan.\n\nAls je de thema-editor gebruikt: open het bestand header.php en plak het script net boven de afsluitende </head> tag.',
      warning: 'Let op: plak het script altijd in de <head> sectie, NOOIT in de <body> of <footer>.',
    },
    {
      title: 'Voeg product-attributen toe aan je producten',
      description:
        'Dit is de stap die de Drapit widget vertelt welk product er op de pagina staat. Ga naar je productpagina-template (bijv. woocommerce/single-product.php) en voeg de volgende data-attributen toe aan het element dat je product omhult:',
      code: `<div
  data-drapit-product="https://jouw-shop.nl/images/product.jpg"
  data-drapit-product-id="SKU-001"
  data-drapit-buy-url="https://jouw-shop.nl/product"
  data-drapit-product-name="Naam van het product"
>
  <!-- Je bestaande product HTML hier -->
</div>`,
      codeLabel: 'Productpagina template (PHP/HTML)',
      tip: 'De waarden zoals de afbeeldings-URL en SKU kun je dynamisch invullen met WooCommerce PHP-functies. Vraag je webdeveloper hier hulp bij als je er niet uitkomt.',
    },
    {
      title: 'Test je integratie',
      description:
        'Ga naar een productpagina op je webshop en kijk of de blauwe "Virtueel passen" knop verschijnt. Als de knop zichtbaar is, werkt de integratie correct!',
      tip: 'Gebruik de "Test integratie" knop bovenaan deze pagina om automatisch te controleren of je API-sleutel en widget correct zijn geladen.',
    },
  ],
  magento: [
    {
      title: 'Open je Magento-beheerder',
      description:
        'Log in op je Magento-beheerpaneel via jouwwebsite.nl/admin. Navigeer daarna naar Inhoud → Ontwerp → Configuratie.',
    },
    {
      title: 'Voeg het script toe aan de <head>',
      description:
        'Klik op "Bewerken" naast je winkelweergave. Scroll naar de sectie "HTML-head" en plak het Drapit-installatiescript in het veld "Scripts en stijlsheets". Klik op Configuratie opslaan.',
      warning: 'Let op: klik daarna op Cache beheren → Alles vernieuwen, anders is de wijziging niet zichtbaar.',
    },
    {
      title: 'Voeg product-attributen toe via een template',
      description:
        'Bewerk het product-detail-template bestand (doorgaans app/design/frontend/[thema]/[locale]/Magento_Catalog/templates/product/view.phtml) en voeg de data-attributen toe rondom je productcontainer:',
      code: `<div
  data-drapit-product="<?= $block->getImage($product, 'product_page_image_large')->getImageUrl() ?>"
  data-drapit-product-id="<?= $product->getSku() ?>"
  data-drapit-buy-url="<?= $product->getProductUrl() ?>"
  data-drapit-product-name="<?= $product->getName() ?>"
>
  <!-- Bestaande product HTML -->
</div>`,
      codeLabel: 'Magento producttemplate (PHTML)',
      tip: 'Als je een page builder gebruikt zoals PageFly of een custom thema, vraag dan je Magento-developer om de attributen toe te voegen.',
    },
    {
      title: 'Cache leegmaken en testen',
      description:
        'Ga naar Systeem → Cache beheren en leeg alle caches. Bezoek daarna een productpagina en controleer of de "Virtueel passen" knop verschijnt.',
    },
  ],
  html: [
    {
      title: 'Open de HTML-broncode van je website',
      description:
        'Open het hoofd-HTML-bestand van je website in een teksteditor (bijv. Notepad++, VS Code, of de ingebouwde editor van je hostingpaneel). Dit is meestal het bestand index.html of een template-bestand zoals header.html.',
      tip: 'Weet je niet hoe je bij je bestanden kunt? Log in op je hostingpaneel (bijv. cPanel, Plesk, of DirectAdmin) en zoek naar "Bestandsbeheer".',
    },
    {
      title: 'Zoek de </head> tag',
      description:
        'Gebruik de zoekfunctie in je editor (Ctrl+F of Cmd+F) en zoek op </head>. Dit is de afsluitende tag van de <head> sectie van je pagina. Elke HTML-pagina heeft dit.',
      warning: 'Let op: let goed op het verschil tussen <head> (opening) en </head> (afsluiting). Het script moet BOVEN </head> worden geplaatst.',
    },
    {
      title: 'Plak het installatiescript',
      description:
        'Plak het gekopieerde Drapit-script direct boven de </head> tag. Het ziet er dan zo uit:',
      code: `<head>
  <!-- ... andere head-inhoud ... -->

  <!-- Drapit Virtual Try-On Widget -->
  <script
    src="https://drapit.io/widget/drapit-widget.js"
    data-drapit-key="Drapit_JOUW_API_SLEUTEL"
    defer
  ></script>

</head>`,
      codeLabel: 'Voorbeeld: je HTML-bestand',
    },
    {
      title: 'Voeg data-attributen toe aan je productcontainer',
      description:
        'Zoek op elke productpagina het HTML-element dat je product omhult (dit is de div of section rondom de productafbeelding en -naam). Voeg hieraan de volgende attributen toe:',
      code: `<div
  data-drapit-product="https://jouw-shop.nl/images/product.jpg"
  data-drapit-product-id="ARTIKEL-001"
  data-drapit-buy-url="https://jouw-shop.nl/product"
  data-drapit-product-name="Naam van het product"
>
  <!-- Je bestaande product HTML hier -->
</div>`,
      codeLabel: 'Productpagina HTML',
      tip: 'Vervang de waarden tussen de aanhalingstekens door de échte URL van je productafbeelding, de artikelnummer, de link naar het product en de productnaam.',
    },
    {
      title: 'Sla op en test',
      description:
        'Sla je bestanden op en open een productpagina in je browser. Je zou nu de blauwe "Virtueel passen" knop moeten zien bij elk product dat je hebt voorzien van de data-attributen!',
      tip: 'Zie je de knop niet? Druk op Ctrl+Shift+I (Windows) of Cmd+Option+I (Mac) om de browser-ontwikkelaarstools te openen. Kijk of er foutmeldingen zijn in het Consoletabblad.',
    },
  ],
};

const FAQ = [
  {
    question: 'De "Virtueel passen"-knop verschijnt niet. Wat nu?',
    answer:
      'Controleer het volgende: (1) Is het script correct geplaatst in de <head> en niet in de <body>? (2) Zijn de data-drapit-product attributen aanwezig op het juiste HTML-element? (3) Kijk in de browserconsole (F12 → Console) of er foutmeldingen zijn. (4) Controleer of je API-sleutel correct is.',
  },
  {
    question: 'Ik weet niet waar de <head> tag is in mijn website.',
    answer:
      'Ga naar een pagina op je website. Klik met de rechtermuisknop → Paginabron weergeven. Zoek dan via Ctrl+F naar </head>. Het script moet net daarboven. Bij WordPress gebruik je het best de plugin "Insert Headers and Footers" om dit eenvoudig te doen.',
  },
  {
    question: 'Moet ik de attributen op elke productpagina apart toevoegen?',
    answer:
      'Nee! In de meeste platformen (WordPress, Magento, etc.) heb je één producttemplate-bestand. Als je de attributen daar toevoegt, worden ze automatisch op alle productpagina\'s toegepast. Vraag je webdeveloper als je niet zeker weet welk bestand dit is.',
  },
  {
    question: 'Welke waarden moet ik invullen bij de data-attributen?',
    answer:
      'data-drapit-product: de directe URL naar de productafbeelding (eindigt op .jpg, .png, etc.)\ndata-drapit-product-id: de unieke artikelnummer of SKU van het product\ndata-drapit-buy-url: de URL van de productpagina\ndata-drapit-product-name: de naam van het product',
  },
  {
    question: 'Werkt dit ook met een pagina-builder zoals Elementor of Divi?',
    answer:
      'Ja, maar het toevoegen van data-attributen via een page builder kan lastig zijn. De meeste builders hebben een "Custom Attributes" optie in de elementinstellingen. Zoek naar "HTML-attributen" of "Aangepaste attributen" bij het product-element. Lukt het niet, vraag dan je webdeveloper.',
  },
];

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-[#1E3A5F]">
      {label && (
        <div className="flex items-center justify-between bg-[#1E293B] px-4 py-2">
          <span className="text-[11px] text-[#94A3B8] font-mono">{label}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[11px] text-[#94A3B8] hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-emerald-400">Gekopieerd!</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Kopiëren
              </>
            )}
          </button>
        </div>
      )}
      <pre className="bg-[#0F172A] text-[#E2E8F0] text-xs p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-[#F8FAFC] transition-colors"
      >
        <span className="text-sm font-semibold text-[#0F172A] pr-4">{question}</span>
        <svg
          className={`w-5 h-5 text-[#64748B] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-[#E2E8F0]">
          <p className="text-sm text-[#475569] mt-3 leading-relaxed whitespace-pre-line">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function StandaloneInstallationGuide() {
  const [activePlatform, setActivePlatform] = useState<Platform>('wordpress');
  const steps = STEPS[activePlatform];

  return (
    <div className="space-y-6">
      {/* Platform Selector */}
      <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-[0_1px_2px_rgba(15,39,68,0.06)] p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-[#EBF3FF] rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 1L17 9L9 17L1 9L9 1Z" stroke="#1D6FD8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="9" r="2.5" stroke="#1D6FD8" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Stapsgewijze installatiegids</h2>
            <p className="text-xs text-[#64748B]">Selecteer je platform voor gerichte instructies</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePlatform(p.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-200 ${
                activePlatform === p.id
                  ? 'bg-[#1D6FD8] text-white border-[#1D6FD8] shadow-md scale-[1.02]'
                  : 'bg-white text-[#475569] border-[#E2E8F0] hover:border-[#1D6FD8] hover:text-[#1D6FD8]'
              }`}
            >
              <span>{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-4">
              {/* Step Number */}
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1D6FD8] to-[#3B9AF0] flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-md">
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className="w-0.5 bg-[#E2E8F0] mt-2 flex-1 min-h-[24px]" />
                )}
              </div>

              {/* Step Content */}
              <div className="pb-4 flex-1 min-w-0">
                <p className="text-sm font-bold text-[#0F172A] mb-1.5">{step.title}</p>
                <p className="text-sm text-[#475569] leading-relaxed whitespace-pre-line">{step.description}</p>

                {step.code && (
                  <CodeBlock code={step.code} label={step.codeLabel} />
                )}

                {step.tip && (
                  <div className="mt-3 flex gap-2.5 bg-[#EBF3FF] border border-[#C3D9F5] rounded-lg p-3">
                    <span className="text-base shrink-0">💡</span>
                    <p className="text-xs text-[#1D4E89] leading-relaxed">{step.tip}</p>
                  </div>
                )}

                {step.warning && (
                  <div className="mt-3 flex gap-2.5 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <span className="text-base shrink-0">⚠️</span>
                    <p className="text-xs text-amber-800 leading-relaxed">{step.warning}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Success indicator */}
        <div className="mt-4 flex gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <span className="text-base shrink-0">✅</span>
          <div>
            <p className="text-sm font-semibold text-emerald-800">Klaar voor gebruik!</p>
            <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
              Zodra alle stappen zijn voltooid, verschijnt de "Virtueel passen" knop automatisch bij elk product op je webshop.
              Gebruik de <strong>"Test integratie"</strong> knop bovenaan de pagina om te verifiëren dat alles werkt.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-[0_1px_2px_rgba(15,39,68,0.06)] p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-[#EBF3FF] rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="8" stroke="#1D6FD8" strokeWidth="1.5" />
              <path d="M9 13v-1" stroke="#1D6FD8" strokeWidth="2" strokeLinecap="round" />
              <path d="M9 10c0-1.5 2-2 2-3.5a2 2 0 10-4 0" stroke="#1D6FD8" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Veelgestelde vragen</h2>
            <p className="text-xs text-[#64748B]">Komen er problemen voor? Hier zijn de meest voorkomende oplossingen</p>
          </div>
        </div>
        <div className="space-y-3">
          {FAQ.map((faq, index) => (
            <FaqItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>

      {/* Support CTA */}
      <div className="bg-gradient-to-r from-[#1D6FD8] to-[#3B9AF0] rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold mb-1">Kom je er niet uit?</h2>
            <p className="text-sm text-white/80 leading-relaxed">
              Ons ondersteuningsteam helpt je graag verder. Stuur een e-mail of start een chat en we lossen het samen op.
            </p>
          </div>
          <a
            href="/contact"
            className="shrink-0 inline-flex items-center gap-2 bg-white text-[#1D6FD8] font-semibold text-sm px-5 py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact support
          </a>
        </div>
      </div>
    </div>
  );
}
