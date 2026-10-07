// =============================================================================
// Drapit Widget v1.3.0 — Embeddable Virtual Try-On
// =============================================================================
// Usage:
//   <script
//     src="https://drapit.io/widget/drapit-widget.js"
//     data-drapit-key="dk_live_xxx"
//     data-drapit-color="#1D6FD8"
//     data-drapit-cta="Virtual try-on"
//     data-drapit-lang="en"            (en | nl | auto — default en)
//     defer
//   ></script>
//
// Product elements:
//   <div
//     data-drapit-product="https://shop.nl/images/jurk.jpg"
//     data-drapit-product-id="SKU-001"
//     data-drapit-buy-url="https://shop.nl/jurk"
//     data-drapit-product-name="Zomerjurk"
//   >
// =============================================================================

(function () {
    'use strict';

    // ── Configuration ─────────────────────────────────────────────────────
    const SCRIPT_EL = document.currentScript;
    // Treat empty or placeholder values as "no key" so the widget can
    // auto-resolve a key via /api/widget/config using the shop domain.
    const RAW_KEY = (SCRIPT_EL?.getAttribute('data-drapit-key') || '').trim();
    const IS_PLACEHOLDER_KEY = !RAW_KEY || /^dk_live_\.\.\.?$/i.test(RAW_KEY) || RAW_KEY === 'dk_live_';
    let API_KEY = IS_PLACEHOLDER_KEY ? '' : RAW_KEY;
    // Shop domain: explicit attribute first, else Shopify's storefront global
    // (window.Shopify.shop is present on every Shopify storefront), so the
    // widget works zero-config even with the older theme block.
    const SHOP_DOMAIN = (
        SCRIPT_EL?.getAttribute('data-drapit-shop')
        || (typeof window !== 'undefined' && window.Shopify && window.Shopify.shop)
        || ''
    ).trim();
    const PRIMARY_COLOR = SCRIPT_EL?.getAttribute('data-drapit-color') || '#1D6FD8';

    // ── Language ──────────────────────────────────────────────────────────
    // One language per shop. English is the default; Dutch only when the
    // merchant picks it in the theme block, or picks "auto" on a Dutch store.
    const STRINGS = {
        en: {
            cta: 'Virtual try-on',
            title: 'Virtual fitting',
            uploadTitle: 'Upload your photo',
            uploadHint: 'Drag a photo here or tap to upload',
            tipsBar: 'A full-body photo gives the best result',
            tips: 'Tips',
            tipDo1: 'Full body visible', tipDont1: 'Only head or upper body',
            tipDo2: 'Plain, neutral background', tipDont2: 'Busy or dark background',
            tipDo3: 'Good, soft lighting', tipDont3: 'Backlight or harsh shadows',
            tipDo4: 'Standing straight, facing forward', tipDont4: 'Side-on or tilted pose',
            yourPhoto: 'Your photo',
            removePhoto: 'Remove photo',
            submit: 'Try on this item',
            close: 'Close',
            loadingTitle: 'Creating your look…',
            loadingSub: 'This usually takes 15–30 seconds',
            stepUpload: 'Uploading your photo',
            stepAnalyse: 'Analysing the garment',
            stepFit: 'Fitting it to your photo',
            stepFinish: 'Adding the finishing touches',
            stepSlow: 'Almost there — this one is taking a little longer',
            outfitBuilding: 'Building your outfit…',
            completeOutfit: 'Complete outfit',
            combineTitle: 'Combine with…',
            combineSub: 'Pick bottoms to see the full outfit',
            outfitLimit: 'The outfit could not be created (limit reached). Your first result is below.',
            outfitFailed: 'The outfit did not work out, try other bottoms. Your first result is below.',
            buy: 'Buy this item',
            retry: 'New photo',
            save: 'Save',
            share: 'Share',
            before: 'Before',
            after: 'After',
            compareHint: 'Drag to compare',
            resultAlt: 'Try-on result',
            shareTitle: 'My virtual try-on',
            shareText: 'See how I look in {name}!',
            errTitle: 'Something went wrong',
            tryAgain: 'Try again',
            errNotActive: 'This try-on widget is not fully activated for this store yet.',
            errUpload: 'Photo upload failed. Please try again.',
            errTooLarge: 'This photo is too large (max. 4 MB). Please choose a smaller one.',
            errNetwork: 'Could not reach the try-on server. Check your connection and try again.',
            errLimit: 'Virtual try-on is temporarily unavailable in this store. Please try again later.',
            errGeneric: 'Something went wrong. Please try again.',
            errAiFailed: 'We could not create a result from this photo. Please try again with a different photo.',
            errTimeout: 'This is taking too long. Please try again.',
        },
        nl: {
            cta: 'Virtueel passen',
            title: 'Virtueel passen',
            uploadTitle: 'Upload je foto',
            uploadHint: 'Sleep een foto hierheen of tik om te uploaden',
            tipsBar: 'Een foto van je hele lichaam geeft het beste resultaat',
            tips: 'Tips',
            tipDo1: 'Volledig lichaam zichtbaar', tipDont1: 'Alleen hoofd of bovenlichaam',
            tipDo2: 'Neutrale, egale achtergrond', tipDont2: 'Drukke of donkere achtergrond',
            tipDo3: 'Goede, zachte belichting', tipDont3: 'Tegenlicht of harde schaduwen',
            tipDo4: 'Rechtop, naar voren gericht', tipDont4: 'Zijwaartse of scheve pose',
            yourPhoto: 'Jouw foto',
            removePhoto: 'Foto verwijderen',
            submit: 'Pas dit item',
            close: 'Sluiten',
            loadingTitle: 'Je look wordt gemaakt…',
            loadingSub: 'Dit duurt meestal 15–30 seconden',
            stepUpload: 'Je foto uploaden',
            stepAnalyse: 'Kledingstuk analyseren',
            stepFit: 'Passen op jouw foto',
            stepFinish: 'Laatste details afwerken',
            stepSlow: 'Bijna klaar — deze duurt iets langer',
            outfitBuilding: 'Outfit wordt samengesteld…',
            completeOutfit: 'Complete outfit',
            combineTitle: 'Combineer met…',
            combineSub: 'Kies een broek en zie de complete outfit',
            outfitLimit: 'De outfit kon niet worden gemaakt (limiet bereikt). Je eerste resultaat staat hieronder.',
            outfitFailed: 'De outfit is niet gelukt, probeer een andere broek. Je eerste resultaat staat hieronder.',
            buy: 'Koop dit item',
            retry: 'Nieuwe foto',
            save: 'Opslaan',
            share: 'Delen',
            before: 'Voor',
            after: 'Na',
            compareHint: 'Sleep om te vergelijken',
            resultAlt: 'Try-on resultaat',
            shareTitle: 'Mijn virtual try-on',
            shareText: 'Kijk hoe ik eruitzie in {name}!',
            errTitle: 'Er ging iets mis',
            tryAgain: 'Opnieuw proberen',
            errNotActive: 'De try-on widget is nog niet volledig geactiveerd voor deze winkel.',
            errUpload: 'Foto uploaden mislukt. Probeer het opnieuw.',
            errTooLarge: 'Deze foto is te groot (max. 4 MB). Kies een kleinere foto.',
            errNetwork: 'Verbinding met de try-on server mislukt. Controleer je internet en probeer het opnieuw.',
            errLimit: 'Virtueel passen is tijdelijk niet beschikbaar in deze winkel. Probeer het later opnieuw.',
            errGeneric: 'Er ging iets mis. Probeer het opnieuw.',
            errAiFailed: 'Het is niet gelukt een resultaat te maken van deze foto. Probeer het opnieuw met een andere foto.',
            errTimeout: 'Dit duurt te lang. Probeer het opnieuw.',
        },
    };

    function resolveLang() {
        const setting = (SCRIPT_EL?.getAttribute('data-drapit-lang') || 'en').trim().toLowerCase();
        if (setting === 'nl' || setting === 'en') return setting;
        if (setting === 'auto') {
            const loc = String(
                (window.Shopify && window.Shopify.locale) || document.documentElement.lang || ''
            ).toLowerCase();
            return loc.startsWith('nl') ? 'nl' : 'en';
        }
        return 'en';
    }
    // The shopper can switch EN/NL in the widget header; that choice is
    // remembered in this browser and wins over the merchant's default.
    const LANG_KEY = 'drapit_lang';
    let LANG = (() => {
        try {
            const saved = window.localStorage.getItem(LANG_KEY);
            if (saved === 'en' || saved === 'nl') return saved;
        } catch { /* storage blocked — use the merchant setting */ }
        return resolveLang();
    })();

    function t(key, vars) {
        let s = (STRINGS[LANG] && STRINGS[LANG][key]) || STRINGS.en[key] || key;
        if (vars) Object.keys(vars).forEach((k) => { s = s.replace(`{${k}}`, vars[k]); });
        return s;
    }

    // Button text: the merchant's own text wins, unless it is still one of the
    // old built-in defaults — then use the default in the widget language.
    const RAW_CTA = (SCRIPT_EL?.getAttribute('data-drapit-cta') || '').trim();
    const DEFAULT_CTAS = ['virtueel passen', 'virtual try-on', 'virtueel passen | virtual try-on'];
    const CTA_IS_DEFAULT = !RAW_CTA || DEFAULT_CTAS.includes(RAW_CTA.toLowerCase());
    const CTA_TEXT = CTA_IS_DEFAULT ? t('cta') : RAW_CTA;

    // Translatable text: <span data-i18n="key">…</span>, swapped live on a language switch.
    function tx(key) {
        return `<span data-i18n="${key}">${escapeHtml(t(key))}</span>`;
    }
    // Translatable attribute, e.g. ta('aria-label', 'close')
    function ta(attr, key) {
        return `${attr}="${escapeHtml(t(key))}" data-i18n-attr="${attr}:${key}"`;
    }

    const ctaLabels = [];          // default-text buttons on the product page
    const langListeners = new Set(); // live views (e.g. progress steps) that re-render

    function applyLang(root) {
        if (!root) return;
        root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.getAttribute('data-i18n')); });
        root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
            const [attr, key] = el.getAttribute('data-i18n-attr').split(':');
            el.setAttribute(attr, t(key));
        });
        root.querySelectorAll('.drapit-lang-btn').forEach((b) => {
            const on = b.getAttribute('data-lang') === LANG;
            b.classList.toggle('active', on);
            b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
    }

    function setLang(lang, root) {
        if (lang !== 'en' && lang !== 'nl') return;
        LANG = lang;
        try { window.localStorage.setItem(LANG_KEY, lang); } catch { /* ignore */ }
        applyLang(root);
        ctaLabels.forEach((el) => { el.textContent = t('cta'); });
        langListeners.forEach((fn) => { try { fn(); } catch { /* ignore */ } });
    }
    // Outfit/set flow: merchant checkbox in the theme block ("true"/"false").
    // Only offered when the server ALSO reports outfits=true for this shop.
    const OUTFITS_BLOCK = (SCRIPT_EL?.getAttribute('data-drapit-outfits') || '').trim().toLowerCase() === 'true';
    let OUTFITS_SERVER = false;
    const API_BASE = SCRIPT_EL?.src
        ? new URL(SCRIPT_EL.src).origin
        : window.location.origin;
    const POLL_INTERVAL = 3000;
    const MAX_POLLS = 60; // 3 min max

    if (!API_KEY && !SHOP_DOMAIN) {
        console.error('[Drapit] Geen API-key en geen shop-domein gevonden op de script-tag. ' +
            'Voeg data-drapit-shop toe (bijv. {{ shop.permanent_domain }}) of vul een geldige data-drapit-key in.');
        return;
    }

    // Resolve the publishable key from the shop domain when no explicit key is set.
    // Cached after the first successful lookup.
    let _keyResolution = null;
    async function ensureApiKey() {
        if (API_KEY) return API_KEY;
        if (!SHOP_DOMAIN) throw new Error('NO_KEY');
        if (!_keyResolution) {
            _keyResolution = fetch(`${API_BASE}/api/widget/config?shop=${encodeURIComponent(SHOP_DOMAIN)}`)
                .then(async (res) => {
                    if (!res.ok) throw new Error('CONFIG_' + res.status);
                    const data = await res.json();
                    if (!data.key) throw new Error('NO_KEY');
                    API_KEY = data.key;
                    OUTFITS_SERVER = data.outfits === true;
                    return API_KEY;
                })
                .catch((err) => {
                    // Don't cache a failed lookup — let the next attempt retry.
                    _keyResolution = null;
                    throw err;
                });
        }
        return _keyResolution;
    }

    console.log('[Drapit Widget] v1.3.0 (' + LANG + ', variants, progress steps, compare slider) loaded — '
        + (API_KEY ? 'key: ' + API_KEY.substring(0, 12) + '…' : 'auto-key via shop ' + SHOP_DOMAIN));

    // ── CSS ───────────────────────────────────────────────────────────────
    const STYLES = `
        :host {
            all: initial;
            display: block;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            color: #0F172A;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Try-on Button ─────────────────────────────── */
        .drapit-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: ${PRIMARY_COLOR};
            color: #fff;
            border: none;
            border-radius: 10px;
            padding: 8px 16px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.15s, transform 0.15s;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12);
            margin-top: 8px;
        }
        .drapit-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .drapit-btn:active { transform: translateY(0); }
        .drapit-btn svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.5; }

        /* ── Modal Overlay ─────────────────────────────── */
        .drapit-overlay {
            position: fixed;
            inset: 0;
            z-index: 2147483647;
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
            opacity: 0;
            transition: opacity 0.2s ease;
        }
        .drapit-overlay.active { opacity: 1; }

        .drapit-modal {
            background: #fff;
            border-radius: 20px;
            box-shadow: 0 24px 48px rgba(15, 39, 68, 0.18);
            max-width: 460px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            transform: translateY(12px);
            transition: transform 0.25s ease;
        }
        .drapit-overlay.active .drapit-modal { transform: translateY(0); }

        .drapit-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px 0;
        }
        .drapit-modal-title {
            font-size: 18px;
            font-weight: 700;
            color: #0F172A;
        }
        .drapit-close {
            width: 32px; height: 32px;
            border-radius: 8px;
            border: none;
            background: #F1F5F9;
            color: #64748B;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.15s;
        }
        .drapit-close:hover { background: #E2E8F0; }
        .drapit-header-actions { display: flex; align-items: center; gap: 8px; }
        .drapit-lang {
            display: inline-flex;
            background: #F1F5F9;
            border-radius: 8px;
            padding: 3px;
            gap: 2px;
        }
        .drapit-lang-btn {
            border: none;
            background: transparent;
            color: #64748B;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.02em;
            padding: 5px 8px;
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.15s, color 0.15s;
        }
        .drapit-lang-btn:hover { color: #0F172A; }
        .drapit-lang-btn.active { background: #fff; color: #0F172A; box-shadow: 0 1px 2px rgba(15,23,42,0.12); }

        .drapit-modal-body { padding: 20px 24px 24px; }

        /* ── Product Info ──────────────────────────────── */
        .drapit-product-info {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: #F8FAFC;
            border-radius: 12px;
            margin-bottom: 20px;
        }
        .drapit-product-thumb {
            width: 56px; height: 56px;
            border-radius: 10px;
            object-fit: cover;
            border: 1px solid #E2E8F0;
        }
        .drapit-product-name {
            font-size: 14px;
            font-weight: 600;
            color: #0F172A;
        }
        .drapit-product-id {
            font-size: 11px;
            color: #94A3B8;
            margin-top: 2px;
        }

        /* ── Upload Area ───────────────────────────────── */
        .drapit-upload {
            border: 2px dashed #CBD5E1;
            border-radius: 14px;
            padding: 32px 24px;
            text-align: center;
            cursor: pointer;
            transition: border-color 0.2s, background 0.2s;
        }
        .drapit-upload:hover, .drapit-upload.drag-over {
            border-color: ${PRIMARY_COLOR};
            background: ${PRIMARY_COLOR}08;
        }
        .drapit-upload-icon {
            width: 48px; height: 48px;
            margin: 0 auto 12px;
            background: #EBF3FF;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .drapit-upload-icon svg { width: 24px; height: 24px; stroke: ${PRIMARY_COLOR}; fill: none; stroke-width: 1.5; }
        .drapit-upload-title {
            font-size: 14px;
            font-weight: 600;
            color: #0F172A;
            margin-bottom: 4px;
        }
        .drapit-upload-hint {
            font-size: 12px;
            color: #94A3B8;
        }
        .drapit-upload input[type="file"] { display: none; }

        /* ── Preview ───────────────────────────────────── */
        .drapit-preview-wrap {
            position: relative;
            margin-bottom: 16px;
        }
        .drapit-preview-img {
            width: 100%;
            border-radius: 12px;
            object-fit: contain;
            max-height: 500px;
            background: #F8FAFC;
        }
        .drapit-preview-remove {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 28px; height: 28px;
            border-radius: 50%;
            border: none;
            background: rgba(15,23,42,0.7);
            color: #fff;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
        }

        /* ── Photo Tips ────────────────────────────────── */
        .drapit-tips-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            margin-top: 10px;
            padding: 8px 12px;
            background: #FFFBEB;
            border: 1px solid #FDE68A;
            border-radius: 10px;
        }
        .drapit-tips-bar-text {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 11.5px;
            color: #92400E;
            flex: 1;
            line-height: 1.4;
        }
        .drapit-tips-bar-text svg { width: 14px; height: 14px; flex-shrink: 0; stroke: #F59E0B; fill: none; }
        .drapit-tips-toggle {
            display: flex;
            align-items: center;
            gap: 3px;
            background: none;
            border: none;
            font-size: 11.5px;
            font-weight: 600;
            color: #D97706;
            cursor: pointer;
            padding: 0;
            white-space: nowrap;
            flex-shrink: 0;
        }
        .drapit-tips-toggle svg { width: 12px; height: 12px; stroke: currentColor; fill: none; transition: transform 0.2s; }
        .drapit-tips-toggle.open svg { transform: rotate(180deg); }

        .drapit-tips-panel {
            overflow: hidden;
            max-height: 0;
            opacity: 0;
            transition: max-height 0.28s ease, opacity 0.2s;
        }
        .drapit-tips-panel.open {
            max-height: 260px;
            opacity: 1;
        }
        .drapit-tips-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            padding: 10px 12px 12px;
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-top: none;
            border-radius: 0 0 10px 10px;
        }
        .drapit-tip-item {
            display: flex;
            align-items: flex-start;
            gap: 6px;
            font-size: 11.5px;
            color: #475569;
            line-height: 1.4;
        }
        .drapit-tip-check, .drapit-tip-cross {
            width: 16px; height: 16px;
            border-radius: 50%;
            font-size: 9px;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-top: 1px;
        }
        .drapit-tip-check { background: #DCFCE7; color: #16A34A; }
        .drapit-tip-cross { background: #FEE2E2; color: #DC2626; }

        /* ── Submit Button ─────────────────────────────── */
        .drapit-submit {
            width: 100%;
            padding: 14px;
            border: none;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            color: #fff;
            background: ${PRIMARY_COLOR};
            cursor: pointer;
            transition: opacity 0.15s, transform 0.1s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            box-shadow: 0 2px 8px ${PRIMARY_COLOR}40;
        }
        .drapit-submit svg { width: 16px; height: 16px; flex-shrink: 0; }
        .drapit-submit:hover { opacity: 0.92; transform: translateY(-1px); }
        .drapit-submit:active { transform: translateY(0); }

        /* ── Loading / Result States ───────────────────── */
        .drapit-loading {
            text-align: center;
            padding: 40px 24px;
        }
        .drapit-spinner {
            width: 40px; height: 40px;
            border: 3px solid #E2E8F0;
            border-top-color: ${PRIMARY_COLOR};
            border-radius: 50%;
            animation: drapit-spin 0.8s linear infinite;
            margin: 0 auto 16px;
        }
        @keyframes drapit-spin { to { transform: rotate(360deg); } }
        .drapit-loading-text {
            font-size: 14px;
            font-weight: 500;
            color: #0F172A;
        }
        .drapit-loading-sub {
            font-size: 12px;
            color: #94A3B8;
            margin-top: 14px;
        }
        .drapit-progress {
            height: 4px;
            max-width: 260px;
            margin: 14px auto 0;
            background: #E2E8F0;
            border-radius: 999px;
            overflow: hidden;
        }
        .drapit-progress-bar {
            height: 100%;
            width: 0;
            background: ${PRIMARY_COLOR};
            border-radius: 999px;
            transition: width 0.5s ease;
        }
        .drapit-steps {
            list-style: none;
            display: inline-flex;
            flex-direction: column;
            gap: 9px;
            margin-top: 18px;
            text-align: left;
        }
        .drapit-steps li {
            display: flex;
            align-items: center;
            gap: 9px;
            font-size: 13px;
            color: #94A3B8;
            transition: color 0.2s;
        }
        .drapit-steps li.active { color: #0F172A; font-weight: 600; }
        .drapit-steps li.done { color: #475569; }
        .drapit-step-dot {
            width: 18px; height: 18px;
            border-radius: 50%;
            border: 2px solid #CBD5E1;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 800;
        }
        .drapit-steps li.active .drapit-step-dot {
            border-color: ${PRIMARY_COLOR};
            border-top-color: transparent;
            animation: drapit-spin 0.8s linear infinite;
        }
        .drapit-steps li.done .drapit-step-dot { background: #DCFCE7; border-color: #DCFCE7; color: #16A34A; }

        /* ── Before/after compare ──────────────────────── */
        .drapit-compare {
            --pos: 50%;
            position: relative;
            width: 100%;
            aspect-ratio: 3 / 4;
            max-height: 500px;
            border-radius: 14px;
            overflow: hidden;
            background: #F8FAFC;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            cursor: ew-resize;
            touch-action: pan-y;
            user-select: none;
            -webkit-user-select: none;
        }
        .drapit-compare img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: contain;
            pointer-events: none;
            -webkit-user-drag: none;
        }
        .drapit-compare-before { clip-path: inset(0 calc(100% - var(--pos)) 0 0); }
        .drapit-compare-line {
            position: absolute;
            top: 0; bottom: 0;
            left: var(--pos);
            width: 2px;
            margin-left: -1px;
            background: #fff;
            box-shadow: 0 0 6px rgba(15,23,42,0.35);
            pointer-events: none;
        }
        .drapit-compare-handle {
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 38px; height: 38px;
            border-radius: 50%;
            border: none;
            background: #fff;
            color: #0F172A;
            box-shadow: 0 2px 10px rgba(15,23,42,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: ew-resize;
            pointer-events: auto;
        }
        .drapit-compare-handle:focus-visible { outline: 2px solid ${PRIMARY_COLOR}; outline-offset: 2px; }
        .drapit-compare-label {
            position: absolute;
            top: 10px;
            font-size: 11px;
            font-weight: 600;
            color: #fff;
            background: rgba(15,23,42,0.6);
            padding: 3px 9px;
            border-radius: 999px;
            pointer-events: none;
        }
        .drapit-compare-label.before { left: 10px; }
        .drapit-compare-label.after { right: 10px; }
        .drapit-compare-hint {
            font-size: 11px;
            color: #94A3B8;
            margin: 8px 0 14px;
        }

        .drapit-result { text-align: center; }
        .drapit-result-img {
            width: 100%;
            border-radius: 14px;
            margin-bottom: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            object-fit: contain;
            max-height: 500px;
            background: #F8FAFC;
        }
        .drapit-result-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .drapit-result-actions .drapit-result-buy { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .drapit-result-actions .drapit-result-buy.outfit { flex: 1 1 100%; }
        .drapit-result-buy {
            flex: 1;
            padding: 12px;
            border: none;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            color: #fff;
            background: ${PRIMARY_COLOR};
            cursor: pointer;
            text-decoration: none;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: opacity 0.15s;
        }
        .drapit-result-buy:hover { opacity: 0.9; }
        .drapit-result-retry {
            padding: 12px 16px;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            background: #fff;
            font-size: 14px;
            font-weight: 500;
            color: #0F172A;
            cursor: pointer;
            transition: background 0.15s;
        }
        .drapit-result-retry:hover { background: #F8FAFC; }
        .drapit-outfit { margin-top: 16px; padding-top: 14px; border-top: 1px solid #E2E8F0; text-align: left; }
        .drapit-outfit-title { font-size: 14px; font-weight: 600; color: #0F172A; }
        .drapit-outfit-sub { font-size: 12px; color: #94A3B8; margin-top: 2px; }
        .drapit-outfit-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 8px; margin-top: 10px; }
        .drapit-outfit-item { border: 1px solid #E2E8F0; border-radius: 10px; padding: 6px; background: #fff; cursor: pointer; text-align: center; transition: border-color 0.15s, box-shadow 0.15s; }
        .drapit-outfit-item:hover { border-color: ${PRIMARY_COLOR}; box-shadow: 0 0 0 2px ${PRIMARY_COLOR}22; }
        .drapit-outfit-item img { width: 100%; aspect-ratio: 3 / 4; object-fit: cover; border-radius: 6px; background: #F8FAFC; }
        .drapit-outfit-name { font-size: 11px; color: #475569; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .drapit-outfit-note { font-size: 12px; color: #92400E; background: #FEF3C7; border-radius: 8px; padding: 8px 10px; margin-bottom: 10px; text-align: left; }
        .drapit-outfit-tag { display: inline-block; font-size: 11px; font-weight: 600; color: ${PRIMARY_COLOR}; background: ${PRIMARY_COLOR}14; border-radius: 999px; padding: 3px 10px; margin-bottom: 10px; }

        .drapit-share-actions {
            display: flex;
            gap: 8px;
            margin-top: 8px;
        }
        .drapit-share-btn {
            flex: 1;
            padding: 10px 12px;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            background: #fff;
            font-size: 13px;
            font-weight: 500;
            color: #475569;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: background 0.15s, border-color 0.15s;
        }
        .drapit-share-btn svg { width: 16px; height: 16px; flex-shrink: 0; }
        .drapit-share-btn:hover { background: #F8FAFC; border-color: #CBD5E1; }
        .drapit-share-btn.whatsapp { color: #25D366; border-color: #25D36630; }
        .drapit-share-btn.whatsapp:hover { background: #F0FDF4; border-color: #25D366; }
        .drapit-share-btn.save { color: #6366F1; border-color: #6366F130; }
        .drapit-share-btn.save:hover { background: #EEF2FF; border-color: #6366F1; }

        .drapit-error {
            text-align: center;
            padding: 20px 0;
        }
        .drapit-error-icon {
            width: 48px; height: 48px;
            margin: 0 auto 12px;
            background: #FEF2F2;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .drapit-error-icon svg { stroke: #DC2626; fill: none; stroke-width: 1.5; width: 24px; height: 24px; }
        .drapit-error-text { font-size: 14px; font-weight: 500; color: #0F172A; }
        .drapit-error-sub { font-size: 12px; color: #94A3B8; margin-top: 4px; }

        /* ── Powered by ────────────────────────────────── */
        .drapit-powered {
            text-align: center;
            padding: 12px 24px 16px;
            font-size: 11px;
            color: #94A3B8;
        }
        .drapit-powered a {
            color: ${PRIMARY_COLOR};
            text-decoration: none;
            font-weight: 600;
        }
    `;

    // ── SVG Icons ─────────────────────────────────────────────────────────
    const ICON_TRYON = `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 1C5.5 1 4 2.5 4 4.5S5.5 7 8 7s4-1 4-2.5S10.5 1 8 1z" stroke-linecap="round"/><path d="M2 14c0-3 2.5-5 6-5s6 2 6 5" stroke-linecap="round"/></svg>`;
    const ICON_UPLOAD = `<svg viewBox="0 0 24 24"><path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" stroke-linecap="round"/></svg>`;
    const ICON_CLOSE = `<svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
    const ICON_CART = `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="6" cy="14" r="1" fill="currentColor"/><circle cx="12" cy="14" r="1" fill="currentColor"/><path d="M1 1h2l1.5 8h8L14 4H5" stroke="currentColor" fill="none" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const ICON_ERROR = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v4m0 4h.01" stroke-linecap="round"/></svg>`;
    const ICON_DOWNLOAD = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v12m0 0l-4-4m4 4l4-4"/><path d="M4 18h16"/></svg>`;
    const ICON_BULB = `<svg viewBox="0 0 24 24" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.4-1.4 4.5-3 5.7V17a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2.3C7.4 13.5 6 11.4 6 9a6 6 0 0 1 6-6z"/></svg>`;
    const ICON_CHEVRON = `<svg viewBox="0 0 24 24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`;
    const ICON_WHATSAPP = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.09.539 4.06 1.486 5.775L.057 23.07a.75.75 0 00.914.914l5.308-1.428A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22.5c-1.98 0-3.838-.538-5.435-1.479l-.39-.23-4.034 1.085 1.086-4.02-.24-.4A10.454 10.454 0 011.5 12C1.5 6.201 6.201 1.5 12 1.5S22.5 6.201 22.5 12 17.799 22.5 12 22.5z"/></svg>`;
    const ICON_COMPARE = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l-6 6 6 6"/><path d="M15 6l6 6-6 6"/></svg>`;
    const ICON_SHARE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`;

    // ── State ─────────────────────────────────────────────────────────────
    let currentModal = null;
    let userPhotoDataUrl = null;
    let userPhotoFile = null;

    // ── Helpers ───────────────────────────────────────────────────────────
    function fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // ── Variant handling ──────────────────────────────────────────────────
    // Read the variant the shopper has selected *right now* (at click time),
    // so it works with every theme without listening to theme-specific events.
    function currentVariantId(productEl, known) {
        const isKnown = (id) => !!id && known.some((v) => String(v.id) === String(id));
        const fromForm = (root) => {
            if (!root) return '';
            const forms = root.querySelectorAll('form[action*="/cart/add"]');
            for (const f of forms) {
                const el = f.querySelector('[name="id"]');
                if (el && isKnown(el.value)) return String(el.value);
            }
            return '';
        };
        // 1. The product form in the same section as the button, then anywhere.
        const section = productEl.closest('.shopify-section, section, main');
        let id = fromForm(section) || fromForm(document);
        // 2. ?variant= in the URL (most themes update it on change).
        if (!id) {
            try {
                const q = new URL(window.location.href).searchParams.get('variant');
                if (isKnown(q)) id = q;
            } catch { /* ignore */ }
        }
        return id;
    }

    function applySelectedVariant(base, productEl, variants, initialVariantId) {
        if (!variants.length) return base;
        const id = currentVariantId(productEl, variants) || initialVariantId;
        const v = variants.find((x) => String(x.id) === String(id));
        if (!v) return base;
        let buyUrl = base.buyUrl;
        if (buyUrl) {
            try {
                const u = new URL(buyUrl, window.location.origin);
                u.searchParams.set('variant', String(v.id));
                buyUrl = u.toString();
            } catch { /* keep original */ }
        }
        return {
            ...base,
            productImg: v.img || base.productImg,
            productId: v.sku || base.productId,
            buyUrl,
        };
    }

    // ── Create Widget ─────────────────────────────────────────────────────
    function createTryOnButton(productEl) {
        const productImg = productEl.getAttribute('data-drapit-product');
        const productId = productEl.getAttribute('data-drapit-product-id') || 'unknown';
        const buyUrl = productEl.getAttribute('data-drapit-buy-url') || '';
        const productName = productEl.getAttribute('data-drapit-product-name') || productId;
        const shopifyProductId = productEl.getAttribute('data-drapit-shopify-product-id') || '';
        const productHandle = productEl.getAttribute('data-drapit-product-handle') || '';

        // Create Shadow DOM host
        const host = document.createElement('div');
        host.className = 'drapit-widget-host';
        host.style.display = 'block'; // force visibility — :host CSS alone not reliable cross-browser
        const shadow = host.attachShadow({ mode: 'closed' });

        // Inject styles
        const style = document.createElement('style');
        style.textContent = STYLES;
        shadow.appendChild(style);

        // Create button
        const btn = document.createElement('button');
        btn.className = 'drapit-btn';
        btn.innerHTML = `${ICON_TRYON} <span class="drapit-btn-label">${escapeHtml(CTA_IS_DEFAULT ? t('cta') : CTA_TEXT)}</span>`;
        if (CTA_IS_DEFAULT) ctaLabels.push(btn.querySelector('.drapit-btn-label'));
        // Variant images (Shopify theme block): [{ id, img, sku }]
        let variants = [];
        try {
            const raw = productEl.getAttribute('data-drapit-variants');
            if (raw) variants = JSON.parse(raw).filter((v) => v && v.id && v.img);
        } catch (err) {
            console.warn('[Drapit] Could not read variant images:', err);
        }
        const initialVariantId = productEl.getAttribute('data-drapit-variant-id') || '';

        btn.addEventListener('click', () => {
            const base = { productImg, productId, buyUrl, productName, shopifyProductId, productHandle };
            openModal(shadow, applySelectedVariant(base, productEl, variants, initialVariantId));
        });
        shadow.appendChild(btn);

        // Insert inside the product element
        productEl.appendChild(host);
    }

    // ── Modal ─────────────────────────────────────────────────────────────
    function openModal(_shadowIgnored, product) {
        if (currentModal) {
            const prevHost = currentModal._drapitHost;
            currentModal.remove();
            if (prevHost) prevHost.remove();
        }

        userPhotoDataUrl = null;
        userPhotoFile = null;

        // Mount the modal in a fresh top-level host on <body> so its fixed
        // overlay is never trapped behind the product media by an ancestor
        // stacking context (transform/filter/position on the product section).
        const modalHost = document.createElement('div');
        modalHost.className = 'drapit-modal-host';
        // Force visibility: some themes hide unknown top-level divs, so an inline
        // !important display beats the theme CSS (same reason the button host does this).
        modalHost.style.setProperty('display', 'block', 'important');
        const shadow = modalHost.attachShadow({ mode: 'closed' });
        const modalStyle = document.createElement('style');
        modalStyle.textContent = STYLES;
        shadow.appendChild(modalStyle);
        document.body.appendChild(modalHost);

        const overlay = document.createElement('div');
        overlay.className = 'drapit-overlay';
        overlay._drapitHost = modalHost;
        currentModal = overlay;

        overlay.innerHTML = `
            <div class="drapit-modal">
                <div class="drapit-modal-header">
                    <span class="drapit-modal-title">${tx('title')}</span>
                    <div class="drapit-header-actions">
                        <div class="drapit-lang" role="group" aria-label="Language / Taal">
                            <button type="button" class="drapit-lang-btn${LANG === 'en' ? ' active' : ''}" data-lang="en" aria-pressed="${LANG === 'en'}">EN</button>
                            <button type="button" class="drapit-lang-btn${LANG === 'nl' ? ' active' : ''}" data-lang="nl" aria-pressed="${LANG === 'nl'}">NL</button>
                        </div>
                        <button class="drapit-close" ${ta('aria-label', 'close')}>${ICON_CLOSE}</button>
                    </div>
                </div>
                <div class="drapit-modal-body">
                    <div class="drapit-product-info">
                        <img src="${product.productImg}" alt="" class="drapit-product-thumb" />
                        <div>
                            <div class="drapit-product-name">${escapeHtml(product.productName)}</div>
                            <div class="drapit-product-id">${escapeHtml(product.productId)}</div>
                        </div>
                    </div>
                    <div class="drapit-upload-section">
                        <div class="drapit-upload" id="drapit-dropzone">
                            <div class="drapit-upload-icon">${ICON_UPLOAD}</div>
                            <div class="drapit-upload-title">${tx('uploadTitle')}</div>
                            <div class="drapit-upload-hint">${tx('uploadHint')}</div>
                            <input type="file" accept="image/*" id="drapit-file-input" />
                        </div>
                        <div class="drapit-tips-bar">
                            <span class="drapit-tips-bar-text">
                                ${ICON_BULB} ${tx('tipsBar')}
                            </span>
                            <button class="drapit-tips-toggle" id="drapit-tips-toggle">
                                ${tx('tips')} ${ICON_CHEVRON}
                            </button>
                        </div>
                        <div class="drapit-tips-panel" id="drapit-tips-panel">
                            <div class="drapit-tips-grid">
                                <div class="drapit-tip-item"><span class="drapit-tip-check">✓</span> ${tx('tipDo1')}</div>
                                <div class="drapit-tip-item"><span class="drapit-tip-cross">✗</span> ${tx('tipDont1')}</div>
                                <div class="drapit-tip-item"><span class="drapit-tip-check">✓</span> ${tx('tipDo2')}</div>
                                <div class="drapit-tip-item"><span class="drapit-tip-cross">✗</span> ${tx('tipDont2')}</div>
                                <div class="drapit-tip-item"><span class="drapit-tip-check">✓</span> ${tx('tipDo3')}</div>
                                <div class="drapit-tip-item"><span class="drapit-tip-cross">✗</span> ${tx('tipDont3')}</div>
                                <div class="drapit-tip-item"><span class="drapit-tip-check">✓</span> ${tx('tipDo4')}</div>
                                <div class="drapit-tip-item"><span class="drapit-tip-cross">✗</span> ${tx('tipDont4')}</div>
                            </div>
                        </div>
                    </div>
                    <div class="drapit-preview-section" style="display:none"></div>
                    <button class="drapit-submit" style="display:none;margin-top:16px">
                        ${ICON_TRYON} ${tx('submit')}
                    </button>
                </div>
                <div class="drapit-powered">Powered by <a href="https://drapit.io" target="_blank" rel="noopener">Drapit</a></div>
            </div>
        `;

        shadow.appendChild(overlay);

        // Animate in
        requestAnimationFrame(() => {
            requestAnimationFrame(() => overlay.classList.add('active'));
        });

        // ── Event listeners ─────────────────────────────
        overlay.querySelectorAll('.drapit-lang-btn').forEach((b) => {
            b.addEventListener('click', () => setLang(b.getAttribute('data-lang'), overlay));
        });

        const close = overlay.querySelector('.drapit-close');
        close.addEventListener('click', () => closeModal(overlay));
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal(overlay);
        });

        // File upload
        const dropzone = overlay.querySelector('#drapit-dropzone');
        const fileInput = overlay.querySelector('#drapit-file-input');
        const submitBtn = overlay.querySelector('.drapit-submit');
        const uploadSection = overlay.querySelector('.drapit-upload-section');
        const previewSection = overlay.querySelector('.drapit-preview-section');

        // Tips toggle
        const tipsToggle = overlay.querySelector('#drapit-tips-toggle');
        const tipsPanel = overlay.querySelector('#drapit-tips-panel');
        tipsToggle?.addEventListener('click', () => {
            const isOpen = tipsPanel.classList.toggle('open');
            tipsToggle.classList.toggle('open', isOpen);
        });

        dropzone.addEventListener('click', () => fileInput.click());

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('drag-over');
        });
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) handleFileSelected(file);
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files[0]) handleFileSelected(fileInput.files[0]);
        });

        async function handleFileSelected(file) {
            // Phone photos are 4–12 MB; the upload endpoint (serverless) rejects
            // bodies above ~4.5 MB before our code runs → bare "Failed to fetch".
            // Resize + compress client-side first (also makes uploads much faster).
            file = await compressImage(file);
            userPhotoFile = file;
            userPhotoDataUrl = await fileToDataUrl(file);
            uploadSection.style.display = 'none';
            previewSection.style.display = 'block';
            previewSection.innerHTML = `
                <div class="drapit-preview-wrap">
                    <img src="${userPhotoDataUrl}" class="drapit-preview-img" ${ta('alt', 'yourPhoto')} />
                    <button class="drapit-preview-remove" ${ta('aria-label', 'removePhoto')}>✕</button>
                </div>
            `;
            submitBtn.style.display = 'flex';

            previewSection.querySelector('.drapit-preview-remove').addEventListener('click', () => {
                userPhotoDataUrl = null;
                userPhotoFile = null;
                uploadSection.style.display = 'block';
                previewSection.style.display = 'none';
                submitBtn.style.display = 'none';
            });
        }

        // Submit
        submitBtn.addEventListener('click', () => {
            startTryOn(overlay, product);
        });
    }

    function closeModal(overlay) {
        overlay.classList.remove('active');
        const host = overlay._drapitHost;
        setTimeout(() => { (host || overlay).remove(); }, 250);
        currentModal = null;
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ── Progress (loading steps) ──────────────────────────────────────────
    function loadingMarkup(titleKey) {
        return `
            <div class="drapit-loading">
                <div class="drapit-loading-text">${tx(titleKey)}</div>
                <div class="drapit-progress"><div class="drapit-progress-bar"></div></div>
                <ul class="drapit-steps"></ul>
                <div class="drapit-loading-sub">${tx('loadingSub')}</div>
            </div>`;
    }

    // keys:    step label keys, in order
    // offsets: seconds after the phase starts at which each step becomes active
    // waitFirst: keep step 0 active until release() is called (e.g. real upload)
    function startProgress(root, keys, offsets, waitFirst) {
        const list = root.querySelector('.drapit-steps');
        const bar = root.querySelector('.drapit-progress-bar');
        const sub = root.querySelector('.drapit-loading-sub');
        const t0 = Date.now();
        let phaseStart = waitFirst ? null : t0;
        let active = -1;
        let slowShown = false;

        function render(idx) {
            if (!list || idx === active) return;
            active = idx;
            list.innerHTML = keys.map((k, i) => {
                const cls = i < idx ? 'done' : (i === idx ? 'active' : '');
                return `<li class="${cls}"><span class="drapit-step-dot">${i < idx ? '✓' : ''}</span>${escapeHtml(t(k))}</li>`;
            }).join('');
        }

        function tick() {
            const now = Date.now();
            const secs = (now - t0) / 1000;
            // Eases towards ~92%; only jumps to 100% when the result is in.
            if (bar) bar.style.width = (92 * (1 - Math.exp(-secs / 14))).toFixed(1) + '%';
            let idx = 0;
            if (phaseStart !== null) {
                const phase = (now - phaseStart) / 1000;
                for (let i = 0; i < keys.length; i++) if (phase >= offsets[i]) idx = i;
            }
            render(idx);
            if (!slowShown && secs > 45 && sub) { sub.setAttribute('data-i18n', 'stepSlow'); sub.textContent = t('stepSlow'); slowShown = true; }
        }

        tick();
        const timer = setInterval(tick, 500);
        const onLang = () => { const i = active; active = -1; render(i); };
        langListeners.add(onLang);
        return {
            release() { if (phaseStart === null) { phaseStart = Date.now(); tick(); } },
            finish() { if (bar) bar.style.width = '100%'; render(keys.length); },
            stop() { clearInterval(timer); langListeners.delete(onLang); },
        };
    }

    // ── Try-On Flow ───────────────────────────────────────────────────────
    async function startTryOn(overlay, product) {
        const body = overlay.querySelector('.drapit-modal-body');

        // Show loading state with visible steps + progress bar
        body.innerHTML = `
            <div class="drapit-product-info">
                <img src="${product.productImg}" alt="" class="drapit-product-thumb" />
                <div>
                    <div class="drapit-product-name">${escapeHtml(product.productName)}</div>
                    <div class="drapit-product-id">${escapeHtml(product.productId)}</div>
                </div>
            </div>
            ${loadingMarkup('loadingTitle')}
        `;

        // Step 1 (upload) waits for the real upload; the rest is time-based.
        const progress = startProgress(body, ['stepUpload', 'stepAnalyse', 'stepFit', 'stepFinish'], [0, 0, 6, 18], true);

        try {
            // Make sure we have a valid key before doing any work.
            await ensureApiKey();

            const uploadUrl = await uploadUserPhoto(userPhotoFile);
            progress.release();

            const res = await fetch(`${API_BASE}/api/tryon`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Drapit-Key': API_KEY,
                },
                body: JSON.stringify({
                    product_image_url: product.productImg?.startsWith('//') ? 'https:' + product.productImg : product.productImg,
                    user_photo_url: uploadUrl,
                    product_id: product.productId,
                    buy_url: (() => {
                        const url = product.buyUrl || window.location.href;
                        if (url.startsWith('//')) return 'https:' + url;
                        if (url.startsWith('/')) return window.location.origin + url;
                        return url;
                    })(),
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                // 429 = the store's monthly try-on bundle is used up. The merchant
                // gets an e-mail + dashboard warning; the shopper just sees a
                // friendly "temporarily unavailable" instead of a raw API error.
                if (res.status === 429) throw new Error('LIMIT_REACHED');
                throw new Error(err.detail || err.error || `HTTP ${res.status}`);
            }

            const data = await res.json();
            const tryonId = data.tryon_id;

            await pollForResult(overlay, body, tryonId, product, progress);
        } catch (err) {
            console.error('[Drapit] Try-on error:', err);
            showError(body, friendlyError(err.message), product, overlay);
        } finally {
            progress.stop();
        }
    }

    // ── Client-side image compression ─────────────────────────────────────
    // Downscale to max 1600px on the longest side and re-encode as JPEG.
    // Falls back to the original file if the browser can't decode it.
    const MAX_UPLOAD_BYTES = 3.5 * 1024 * 1024;
    async function compressImage(file) {
        try {
            const MAX_DIM = 1600;
            let bitmap;
            try {
                bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
            } catch {
                bitmap = await new Promise((resolve, reject) => {
                    const url = URL.createObjectURL(file);
                    const img = new Image();
                    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
                    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode')); };
                    img.src = url;
                });
            }
            const w = bitmap.width, h = bitmap.height;
            if (!w || !h) throw new Error('nodim');
            const scale = Math.min(1, MAX_DIM / Math.max(w, h));
            // Small enough already and no downscale needed → keep original.
            if (scale === 1 && file.size <= 1.5 * 1024 * 1024 && /^image\/(jpe?g|png|webp)$/i.test(file.type)) {
                if (bitmap.close) bitmap.close();
                return file;
            }
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(w * scale);
            canvas.height = Math.round(h * scale);
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
            if (bitmap.close) bitmap.close();
            let quality = 0.86;
            let blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', quality));
            while (blob && blob.size > MAX_UPLOAD_BYTES && quality > 0.5) {
                quality -= 0.1;
                blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', quality));
            }
            if (!blob) throw new Error('encode');
            const name = (file.name || 'photo').replace(/\.[^.]+$/, '') + '.jpg';
            console.log(`[Drapit] Foto verkleind: ${(file.size / 1048576).toFixed(1)} MB → ${(blob.size / 1048576).toFixed(2)} MB (${canvas.width}×${canvas.height})`);
            return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() });
        } catch (err) {
            console.warn('[Drapit] Compressie mislukt, origineel wordt gebruikt:', err);
            return file;
        }
    }

    // ── Upload user photo ─────────────────────────────────────────────────
    async function uploadUserPhoto(file) {
        if (file.size > 4.5 * 1024 * 1024) throw new Error('TOO_LARGE');
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${API_BASE}/api/upload`, {
            method: 'POST',
            headers: { 'X-Drapit-Key': API_KEY },
            body: formData,
        });

        if (!res.ok) {
            // 401 = invalid/missing key → distinct code so we can show a clear message.
            if (res.status === 401) throw new Error('AUTH');
            throw new Error('UPLOAD_FAILED');
        }

        const data = await res.json();
        return data.url;
    }

    // Map internal error codes to message keys (translated when shown).
    function friendlyError(message) {
        switch (message) {
            case 'NO_KEY':
            case 'AUTH':
                return 'errNotActive';
            case 'UPLOAD_FAILED':
                return 'errUpload';
            case 'TOO_LARGE':
                return 'errTooLarge';
            case 'Failed to fetch':
            case 'Load failed':
                return 'errNetwork';
            case 'LIMIT_REACHED':
                return 'errLimit';
            case 'AI_FAILED':
                return 'errAiFailed';
            case 'TIMEOUT':
                return 'errTimeout';
            default:
                if (typeof message === 'string' && message.startsWith('CONFIG_')) return 'errNotActive';
                return 'errGeneric';
        }
    }

    // ── Poll for result ───────────────────────────────────────────────────
    async function pollForResult(overlay, body, tryonId, product, progress) {
        let attempts = 0;

        return new Promise((resolve, reject) => {
            const timer = setInterval(async () => {
                attempts++;
                if (attempts > MAX_POLLS) {
                    clearInterval(timer);
                    reject(new Error('TIMEOUT'));
                    return;
                }

                try {
                    const res = await fetch(`${API_BASE}/api/tryon/${tryonId}`, {
                        headers: { 'X-Drapit-Key': API_KEY },
                    });

                    if (!res.ok) return;

                    const data = await res.json();

                    if (data.status === 'succeeded' && data.result_image_url) {
                        clearInterval(timer);
                        if (progress) progress.finish();
                        showResult(body, data.result_image_url, product, overlay, { tryonId, beforeUrl: userPhotoDataUrl });
                        resolve();
                    } else if (data.status === 'failed') {
                        clearInterval(timer);
                        showError(body, 'errAiFailed', product, overlay);
                        resolve();
                    }
                } catch {
                    // Network error — keep trying
                }
            }, POLL_INTERVAL);
        });
    }

    // ── Outfit / set flow ─────────────────────────────────────────────────
    // After a successful round 1 (top), show bottoms from the same shop via
    // Shopify's built-in recommendations endpoint and run a second layer
    // (layer: "bottom") on top of the round-1 result. Failure of round 2
    // never loses round 1: the shopper is shown result 1 again with a note.
    const BOTTOM_RE = /jeans|broek|pant|trouser|chino|jogger|short|rok\b|skirt|legging/i;

    function normalizeStorefrontProduct(p, base) {
        const img = p.featured_image
            || (Array.isArray(p.images) && p.images[0] && (p.images[0].src || p.images[0]))
            || '';
        const imgUrl = typeof img === 'string' ? img : '';
        return {
            id: String(p.id),
            title: p.title || '',
            type: p.type || p.product_type || '',
            tags: Array.isArray(p.tags) ? p.tags.join(' ') : String(p.tags || ''),
            image: imgUrl.startsWith('//') ? 'https:' + imgUrl : imgUrl,
            url: p.url
                ? (p.url.startsWith('/') ? base + p.url : p.url)
                : (p.handle ? `${base}/products/${p.handle}` : ''),
        };
    }

    async function fetchOutfitCandidates(product) {
        if (!product.shopifyProductId) return [];
        const base = window.location.origin;
        const own = String(product.shopifyProductId);

        // 1. Shopify's own recommendations (uses sales data + collections/tags).
        let items = [];
        try {
            const res = await fetch(`${base}/recommendations/products.json?product_id=${encodeURIComponent(own)}&limit=10`, { credentials: 'same-origin' });
            if (res.ok) {
                const data = await res.json();
                items = (data.products || []).map((p) => normalizeStorefrontProduct(p, base));
            }
        } catch { /* fall through to catalogue */ }
        items = items.filter((p) => p.id !== own && p.image);
        let bottoms = items.filter((p) => BOTTOM_RE.test(`${p.type} ${p.title} ${p.tags}`));

        // 2. Fallback: new/small shops often have no recommendations yet. Scan the
        //    public catalogue for bottoms instead (works on every Shopify store).
        if (!bottoms.length) {
            try {
                const res = await fetch(`${base}/collections/all/products.json?limit=250`, { credentials: 'same-origin' });
                if (res.ok) {
                    const data = await res.json();
                    bottoms = (data.products || [])
                        .map((p) => normalizeStorefrontProduct(p, base))
                        .filter((p) => p.id !== own && p.image && BOTTOM_RE.test(`${p.type} ${p.title} ${p.tags}`));
                }
            } catch { /* nothing to offer */ }
        }

        return (bottoms.length ? bottoms : items).slice(0, 4);
    }

    function renderOutfitPicker(body, resultUrl, product, overlay, parentTryonId) {
        const box = body.querySelector('#drapit-outfit');
        if (!box) return;
        fetchOutfitCandidates(product).then((items) => {
            if (!items.length) return;
            box.style.display = 'block';
            box.innerHTML = `
                <div class="drapit-outfit-title">${tx('combineTitle')}</div>
                <div class="drapit-outfit-sub">${tx('combineSub')}</div>
                <div class="drapit-outfit-grid">
                    ${items.map((p, i) => `
                        <div class="drapit-outfit-item" data-idx="${i}">
                            <img src="${p.image}" alt="" loading="lazy" />
                            <div class="drapit-outfit-name" title="${escapeHtml(p.title)}">${escapeHtml(p.title)}</div>
                        </div>`).join('')}
                </div>
            `;
            box.querySelectorAll('.drapit-outfit-item').forEach((el) => {
                el.addEventListener('click', () => {
                    const pick = items[Number(el.getAttribute('data-idx'))];
                    if (pick) startBottomLayer(overlay, body, resultUrl, product, parentTryonId, pick);
                });
            });
        }).catch((err) => {
            console.warn('[Drapit] Outfit candidates unavailable:', err);
        });
    }

    async function startBottomLayer(overlay, body, resultUrl, product, parentTryonId, pick) {
        body.innerHTML = `
            <div class="drapit-product-info">
                <img src="${pick.image}" alt="" class="drapit-product-thumb" />
                <div>
                    <div class="drapit-product-name">${escapeHtml(pick.title)}</div>
                    <div class="drapit-product-id">${tx('completeOutfit')}</div>
                </div>
            </div>
            ${loadingMarkup('outfitBuilding')}
        `;
        const progress = startProgress(body, ['stepAnalyse', 'stepFit', 'stepFinish'], [0, 6, 18], false);

        const restoreRoundOne = (note) => showResult(body, resultUrl, product, overlay, { tryonId: parentTryonId, note, beforeUrl: userPhotoDataUrl });

        try {
            const res = await fetch(`${API_BASE}/api/tryon`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Drapit-Key': API_KEY },
                body: JSON.stringify({
                    product_image_url: pick.image,
                    user_photo_url: resultUrl,
                    product_id: pick.id,
                    buy_url: pick.url || window.location.href,
                    layer: 'bottom',
                    parent_tryon_id: parentTryonId,
                }),
            });
            if (!res.ok) {
                if (res.status === 429) throw new Error('LIMIT_REACHED');
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || `HTTP ${res.status}`);
            }
            const data = await res.json();

            // Poll (same cadence as round 1)
            let attempts = 0;
            const finalUrl = await new Promise((resolve, reject) => {
                const timer = setInterval(async () => {
                    attempts++;
                    if (attempts > MAX_POLLS) { clearInterval(timer); reject(new Error('TIMEOUT')); return; }
                    try {
                        const r = await fetch(`${API_BASE}/api/tryon/${data.tryon_id}`, { headers: { 'X-Drapit-Key': API_KEY } });
                        if (!r.ok) return;
                        const st = await r.json();
                        if (st.status === 'succeeded' && st.result_image_url) { clearInterval(timer); resolve(st.result_image_url); }
                        else if (st.status === 'failed') { clearInterval(timer); reject(new Error('FAILED')); }
                    } catch { /* keep polling */ }
                }, POLL_INTERVAL);
            });

            progress.stop();
            showResult(body, finalUrl, product, overlay, {
                tryonId: data.tryon_id,
                outfitProduct: { title: pick.title, url: pick.url },
                beforeUrl: userPhotoDataUrl,
            });
        } catch (err) {
            progress.stop();
            console.error('[Drapit] Outfit layer error:', err);
            const msg = err && err.message === 'LIMIT_REACHED' ? 'outfitLimit' : 'outfitFailed';
            restoreRoundOne(msg);
        }
    }

    // ── Before/after compare slider ───────────────────────────────────────
    // Pointer events (mouse + touch) on the whole image; touch-action: pan-y
    // keeps vertical scrolling in the modal working. Arrow keys on the handle.
    function setupCompare(box, resultUrl) {
        if (!box) return;
        const handle = box.querySelector('.drapit-compare-handle');
        const afterImg = box.querySelector('.drapit-compare-after');
        let pos = 50;
        let dragging = false;

        // Match the box to the result's aspect ratio so both images line up.
        const fit = () => {
            if (afterImg && afterImg.naturalWidth && afterImg.naturalHeight) {
                box.style.aspectRatio = `${afterImg.naturalWidth} / ${afterImg.naturalHeight}`;
            }
        };
        if (afterImg) { if (afterImg.complete) fit(); else afterImg.addEventListener('load', fit); }

        const set = (p) => {
            pos = Math.max(0, Math.min(100, p));
            box.style.setProperty('--pos', pos + '%');
            handle?.setAttribute('aria-valuenow', String(Math.round(pos)));
        };
        const fromEvent = (e) => {
            const r = box.getBoundingClientRect();
            if (r.width) set(((e.clientX - r.left) / r.width) * 100);
        };

        box.addEventListener('pointerdown', (e) => {
            dragging = true;
            try { box.setPointerCapture(e.pointerId); } catch { /* ignore */ }
            fromEvent(e);
        });
        box.addEventListener('pointermove', (e) => { if (dragging) fromEvent(e); });
        const end = () => { dragging = false; };
        box.addEventListener('pointerup', end);
        box.addEventListener('pointercancel', end);

        handle?.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') { set(pos - 5); e.preventDefault(); }
            else if (e.key === 'ArrowRight') { set(pos + 5); e.preventDefault(); }
        });
    }

    // ── Show Result ───────────────────────────────────────────────────────
    function showResult(body, resultUrl, product, overlay, opts = {}) {
        const hasNativeShare = !!navigator.share;
        const isOutfit = !!opts.outfitProduct;   // this result already has a bottom layer
        const outfitNote = opts.note
            ? `<div class="drapit-outfit-note">${tx(opts.note)}</div>` : '';
        const outfitTag = isOutfit
            ? `<div class="drapit-outfit-tag">${tx('completeOutfit')}</div>` : '';
        const secondBuy = isOutfit && opts.outfitProduct.url
            ? `<a href="${opts.outfitProduct.url}" class="drapit-result-buy outfit" target="_blank" rel="noopener" style="background:#0F172A">
                    ${ICON_CART} ${escapeHtml(opts.outfitProduct.title)}
               </a>` : '';
        const shareLabel = hasNativeShare ? tx('share') : 'WhatsApp';
        const shareIcon = hasNativeShare ? ICON_SHARE : ICON_WHATSAPP;
        const shareBtnClass = hasNativeShare ? '' : 'whatsapp';

        body.innerHTML = `
            <div class="drapit-result">
                ${outfitNote}${outfitTag}
                ${opts.beforeUrl
                ? `<div class="drapit-compare" id="drapit-compare" style="--pos:50%">
                        <img src="${resultUrl}" class="drapit-compare-after" ${ta('alt', 'resultAlt')} draggable="false" />
                        <img src="${opts.beforeUrl}" class="drapit-compare-before" alt="" draggable="false" />
                        <span class="drapit-compare-label before">${tx('before')}</span>
                        <span class="drapit-compare-label after">${tx('after')}</span>
                        <div class="drapit-compare-line">
                            <button class="drapit-compare-handle" type="button" role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" ${ta('aria-label', 'compareHint')}>${ICON_COMPARE}</button>
                        </div>
                   </div>
                   <div class="drapit-compare-hint">${tx('compareHint')}</div>`
                : `<img src="${resultUrl}" ${ta('alt', 'resultAlt')} class="drapit-result-img" />`}
                <div class="drapit-result-actions">
                    ${product.buyUrl
                ? `<a href="${product.buyUrl}" class="drapit-result-buy${isOutfit ? ' outfit' : ''}" target="_blank" rel="noopener">
                            ${ICON_CART} ${isOutfit ? escapeHtml(product.productName) : tx('buy')}
                           </a>${secondBuy}`
                : `<button class="drapit-result-buy" onclick="this.closest('.drapit-overlay')?.remove()">
                            ${tx('close')}
                           </button>`
            }
                    <button class="drapit-result-retry">${tx('retry')}</button>
                </div>
                <div class="drapit-share-actions">
                    <button class="drapit-share-btn save" id="drapit-save-btn">
                        ${ICON_DOWNLOAD} ${tx('save')}
                    </button>
                    <button class="drapit-share-btn ${shareBtnClass}" id="drapit-share-btn">
                        ${shareIcon} ${shareLabel}
                    </button>
                </div>
                <div class="drapit-outfit" id="drapit-outfit" style="display:none"></div>
            </div>
        `;

        // Outfit/set flow: offer a bottom to combine with (round 1 results only).
        if (!isOutfit && opts.tryonId && OUTFITS_BLOCK && OUTFITS_SERVER) {
            renderOutfitPicker(body, resultUrl, product, overlay, opts.tryonId);
        }

        setupCompare(body.querySelector('#drapit-compare'), resultUrl);

        body.querySelector('.drapit-result-retry')?.addEventListener('click', () => {
            openModal(overlay.getRootNode().host?.shadowRoot || overlay.parentNode, product);
        });

        // ── Save / Download ──────────────────────────────
        body.querySelector('#drapit-save-btn')?.addEventListener('click', async () => {
            try {
                const res = await fetch(resultUrl);
                const blob = await res.blob();
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = 'drapit-tryon.jpg';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
            } catch {
                // CORS fallback: open in new tab
                window.open(resultUrl, '_blank');
            }
        });

        // ── Share ────────────────────────────────────────
        body.querySelector('#drapit-share-btn')?.addEventListener('click', async () => {
            const shareText = t('shareText', { name: product.productName }) + ' 👕';
            const shareUrl = product.buyUrl || window.location.href;

            if (navigator.share) {
                try {
                    // Try to share the actual image file if fetch works
                    let shareData = { title: t('shareTitle'), text: shareText, url: shareUrl };
                    try {
                        const imgRes = await fetch(resultUrl);
                        const imgBlob = await imgRes.blob();
                        const imgFile = new File([imgBlob], 'drapit-tryon.jpg', { type: 'image/jpeg' });
                        if (navigator.canShare && navigator.canShare({ files: [imgFile] })) {
                            shareData = { title: t('shareTitle'), text: shareText, files: [imgFile] };
                        }
                    } catch { /* image fetch failed, share URL only */ }
                    await navigator.share(shareData);
                } catch (err) {
                    if (err.name !== 'AbortError') console.warn('[Drapit] Share failed:', err);
                }
            } else {
                // Fallback: WhatsApp web
                const waText = `${shareText}\n${shareUrl}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(waText)}`, '_blank');
            }
        });
    }

    // ── Show Error ────────────────────────────────────────────────────────
    function showError(body, message, product, overlay) {
        body.innerHTML = `
            <div class="drapit-error">
                <div class="drapit-error-icon">${ICON_ERROR}</div>
                <div class="drapit-error-text">${tx('errTitle')}</div>
                <div class="drapit-error-sub">${tx(message)}</div>
            </div>
            <button class="drapit-submit" style="margin-top:16px">${tx('tryAgain')}</button>
        `;

        body.querySelector('.drapit-submit')?.addEventListener('click', () => {
            openModal(overlay.getRootNode().host?.shadowRoot || overlay.parentNode, product);
        });
    }

    // ── Init: Scan & Inject ───────────────────────────────────────────────
    function init() {
        const products = document.querySelectorAll('[data-drapit-product]');
        if (products.length === 0) {
            console.warn('[Drapit] No elements found with data-drapit-product attribute.');
            return;
        }

        products.forEach(createTryOnButton);
        console.log(`[Drapit Widget] Injected ${products.length} try-on button(s).`);
    }

    // ── MutationObserver for SPA support ──────────────────────────────────
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType !== 1) continue;
                if (node.hasAttribute?.('data-drapit-product') && !node.querySelector('.drapit-widget-host')) {
                    createTryOnButton(node);
                }
                const children = node.querySelectorAll?.('[data-drapit-product]') || [];
                children.forEach((child) => {
                    if (!child.querySelector('.drapit-widget-host')) {
                        createTryOnButton(child);
                    }
                });
            }
        }
    });

    // ── Boot ──────────────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init();
            observer.observe(document.body, { childList: true, subtree: true });
        });
    } else {
        init();
        observer.observe(document.body, { childList: true, subtree: true });
    }
})();
