// =============================================================================
// Drapit Widget v1.0.0 — Embeddable Virtual Try-On
// =============================================================================
// Usage:
//   <script
//     src="https://drapit.io/widget/drapit-widget.js"
//     data-drapit-key="dk_live_xxx"
//     data-drapit-color="#1D6FD8"
//     data-drapit-cta="Virtueel passen"
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
    const API_KEY = SCRIPT_EL?.getAttribute('data-drapit-key') || '';
    const PRIMARY_COLOR = SCRIPT_EL?.getAttribute('data-drapit-color') || '#1D6FD8';
    const CTA_TEXT = SCRIPT_EL?.getAttribute('data-drapit-cta') || 'Virtueel passen';
    const API_BASE = SCRIPT_EL?.src
        ? new URL(SCRIPT_EL.src).origin
        : window.location.origin;
    const POLL_INTERVAL = 3000;
    const MAX_POLLS = 60; // 3 min max

    if (!API_KEY) {
        console.error('[Drapit] Missing data-drapit-key attribute on script tag.');
        return;
    }

    console.log('[Drapit Widget] v1.0.0 loaded — key: ' + API_KEY.substring(0, 12) + '…');

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
            margin-top: 4px;
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
            gap: 8px;
        }
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

    // ── Create Widget ─────────────────────────────────────────────────────
    function createTryOnButton(productEl) {
        const productImg = productEl.getAttribute('data-drapit-product');
        const productId = productEl.getAttribute('data-drapit-product-id') || 'unknown';
        const buyUrl = productEl.getAttribute('data-drapit-buy-url') || '';
        const productName = productEl.getAttribute('data-drapit-product-name') || productId;

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
        btn.innerHTML = `${ICON_TRYON} ${CTA_TEXT}`;
        btn.addEventListener('click', () => {
            openModal(shadow, { productImg, productId, buyUrl, productName });
        });
        shadow.appendChild(btn);

        // Insert inside the product element
        productEl.appendChild(host);
    }

    // ── Modal ─────────────────────────────────────────────────────────────
    function openModal(shadow, product) {
        if (currentModal) currentModal.remove();

        userPhotoDataUrl = null;
        userPhotoFile = null;

        const overlay = document.createElement('div');
        overlay.className = 'drapit-overlay';
        currentModal = overlay;

        overlay.innerHTML = `
            <div class="drapit-modal">
                <div class="drapit-modal-header">
                    <span class="drapit-modal-title">Virtueel passen | Virtual Fitting</span>
                    <button class="drapit-close">${ICON_CLOSE}</button>
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
                            <div class="drapit-upload-title">Upload je foto | Upload your photo</div>
                            <div class="drapit-upload-hint">Sleep een foto hierheen of klik om te uploaden | Drag a photo here or click to upload</div>
                            <input type="file" accept="image/*" id="drapit-file-input" />
                        </div>
                        <div class="drapit-tips-bar">
                            <span class="drapit-tips-bar-text">
                                ${ICON_BULB} Volledige lichaamsfoto geeft het beste resultaat
                            </span>
                            <button class="drapit-tips-toggle" id="drapit-tips-toggle">
                                Tips ${ICON_CHEVRON}
                            </button>
                        </div>
                        <div class="drapit-tips-panel" id="drapit-tips-panel">
                            <div class="drapit-tips-grid">
                                <div class="drapit-tip-item"><span class="drapit-tip-check">✓</span> Volledig lichaam zichtbaar</div>
                                <div class="drapit-tip-item"><span class="drapit-tip-cross">✗</span> Alleen hoofd of bovenlichaam</div>
                                <div class="drapit-tip-item"><span class="drapit-tip-check">✓</span> Neutrale, egale achtergrond</div>
                                <div class="drapit-tip-item"><span class="drapit-tip-cross">✗</span> Drukke of donkere achtergrond</div>
                                <div class="drapit-tip-item"><span class="drapit-tip-check">✓</span> Goede, zachte belichting</div>
                                <div class="drapit-tip-item"><span class="drapit-tip-cross">✗</span> Tegenlicht of harde schaduwen</div>
                                <div class="drapit-tip-item"><span class="drapit-tip-check">✓</span> Rechtopstaand, naar voren</div>
                                <div class="drapit-tip-item"><span class="drapit-tip-cross">✗</span> Zijwaartse of scheve pose</div>
                            </div>
                        </div>
                    </div>
                    <div class="drapit-preview-section" style="display:none"></div>
                    <button class="drapit-submit" style="display:none;margin-top:16px">
                        ${ICON_TRYON} Pas dit item | Try on this item
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
            userPhotoFile = file;
            userPhotoDataUrl = await fileToDataUrl(file);
            uploadSection.style.display = 'none';
            previewSection.style.display = 'block';
            previewSection.innerHTML = `
                <div class="drapit-preview-wrap">
                    <img src="${userPhotoDataUrl}" class="drapit-preview-img" alt="Jouw foto" />
                    <button class="drapit-preview-remove">✕</button>
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
        setTimeout(() => overlay.remove(), 250);
        currentModal = null;
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ── Try-On Flow ───────────────────────────────────────────────────────
    async function startTryOn(overlay, product) {
        const body = overlay.querySelector('.drapit-modal-body');

        // Show loading state
        body.innerHTML = `
            <div class="drapit-product-info">
                <img src="${product.productImg}" alt="" class="drapit-product-thumb" />
                <div>
                    <div class="drapit-product-name">${escapeHtml(product.productName)}</div>
                    <div class="drapit-product-id">${escapeHtml(product.productId)}</div>
                </div>
            </div>
            <div class="drapit-loading">
                <div class="drapit-spinner"></div>
                <div class="drapit-loading-text" id="drapit-loading-msg">Bezig met virtueel passen…</div>
                <div class="drapit-loading-sub" id="drapit-loading-sub">Dit duurt meestal 15–30 seconden</div>
            </div>
        `;

        const loadingMsg = body.querySelector('#drapit-loading-msg');
        const loadingSub = body.querySelector('#drapit-loading-sub');
        const messages = [
            { main: 'Bezig met virtueel passen…', sub: 'Dit duurt meestal 15–30 seconden' },
            { main: 'Virtually trying on…', sub: 'This usually takes 15–30 seconds' }
        ];
        let msgIndex = 0;
        const msgInterval = setInterval(() => {
            msgIndex = (msgIndex + 1) % messages.length;
            if (loadingMsg) loadingMsg.textContent = messages[msgIndex].main;
            if (loadingSub) loadingSub.textContent = messages[msgIndex].sub;
        }, 3500);

        try {
            const uploadUrl = await uploadUserPhoto(userPhotoFile);

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
                throw new Error(err.detail || err.error || `HTTP ${res.status}`);
            }

            const data = await res.json();
            const tryonId = data.tryon_id;

            await pollForResult(overlay, body, tryonId, product);
        } catch (err) {
            console.error('[Drapit] Try-on error:', err);
            showError(body, err.message, product, overlay);
        } finally {
            clearInterval(msgInterval);
        }
    }

    // ── Upload user photo ─────────────────────────────────────────────────
    async function uploadUserPhoto(file) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${API_BASE}/api/upload`, {
            method: 'POST',
            headers: { 'X-Drapit-Key': API_KEY },
            body: formData,
        });

        if (!res.ok) {
            throw new Error('Foto upload mislukt | Photo upload failed. Probeer het opnieuw | Please try again.');
        }

        const data = await res.json();
        return data.url;
    }

    // ── Poll for result ───────────────────────────────────────────────────
    async function pollForResult(overlay, body, tryonId, product) {
        let attempts = 0;

        return new Promise((resolve, reject) => {
            const timer = setInterval(async () => {
                attempts++;
                if (attempts > MAX_POLLS) {
                    clearInterval(timer);
                    reject(new Error('Timeout — probeer het opnieuw'));
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
                        showResult(body, data.result_image_url, product, overlay);
                        resolve();
                    } else if (data.status === 'failed') {
                        clearInterval(timer);
                        showError(body, 'De AI-verwerking is mislukt. Probeer het opnieuw met een andere foto.', product, overlay);
                        resolve();
                    }
                } catch {
                    // Network error — keep trying
                }
            }, POLL_INTERVAL);
        });
    }

    // ── Show Result ───────────────────────────────────────────────────────
    function showResult(body, resultUrl, product, overlay) {
        const hasNativeShare = !!navigator.share;
        const shareLabel = hasNativeShare ? 'Delen | Share' : 'WhatsApp';
        const shareIcon = hasNativeShare ? ICON_SHARE : ICON_WHATSAPP;
        const shareBtnClass = hasNativeShare ? '' : 'whatsapp';

        body.innerHTML = `
            <div class="drapit-result">
                <img src="${resultUrl}" alt="Try-on resultaat" class="drapit-result-img" />
                <div class="drapit-result-actions">
                    ${product.buyUrl
                ? `<a href="${product.buyUrl}" class="drapit-result-buy" target="_blank" rel="noopener">
                            ${ICON_CART} Koop dit item | Buy this item
                           </a>`
                : `<button class="drapit-result-buy" onclick="this.closest('.drapit-overlay')?.remove()">
                            Sluiten | Close
                           </button>`
            }
                    <button class="drapit-result-retry">Opnieuw | Retry</button>
                </div>
                <div class="drapit-share-actions">
                    <button class="drapit-share-btn save" id="drapit-save-btn">
                        ${ICON_DOWNLOAD} Opslaan | Save
                    </button>
                    <button class="drapit-share-btn ${shareBtnClass}" id="drapit-share-btn">
                        ${shareIcon} ${shareLabel}
                    </button>
                </div>
            </div>
        `;

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
            const shareText = `Kijk hoe ik er uitzie in ${product.productName}! 👕`;
            const shareUrl = product.buyUrl || window.location.href;

            if (navigator.share) {
                try {
                    // Try to share the actual image file if fetch works
                    let shareData = { title: 'Mijn virtual try-on', text: shareText, url: shareUrl };
                    try {
                        const imgRes = await fetch(resultUrl);
                        const imgBlob = await imgRes.blob();
                        const imgFile = new File([imgBlob], 'drapit-tryon.jpg', { type: 'image/jpeg' });
                        if (navigator.canShare && navigator.canShare({ files: [imgFile] })) {
                            shareData = { title: 'Mijn virtual try-on', text: shareText, files: [imgFile] };
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
                <div class="drapit-error-text">Er ging iets mis | Something went wrong</div>
                <div class="drapit-error-sub">${escapeHtml(message)}</div>
            </div>
            <button class="drapit-submit" style="margin-top:16px">Opnieuw proberen | Try again</button>
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
