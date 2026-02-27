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
            object-fit: cover;
            max-height: 300px;
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

        /* ── Submit Button ─────────────────────────────── */
        .drapit-submit {
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            color: #fff;
            background: ${PRIMARY_COLOR};
            cursor: pointer;
            transition: opacity 0.15s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        .drapit-submit:hover { opacity: 0.9; }
        .drapit-submit:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

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
    const ICON_TRYON = `<svg viewBox="0 0 16 16"><path d="M8 1C5.5 1 4 2.5 4 4.5S5.5 7 8 7s4-1 4-2.5S10.5 1 8 1z" stroke-linecap="round"/><path d="M2 14c0-3 2.5-5 6-5s6 2 6 5" stroke-linecap="round"/></svg>`;
    const ICON_UPLOAD = `<svg viewBox="0 0 24 24"><path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" stroke-linecap="round"/></svg>`;
    const ICON_CLOSE = `<svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
    const ICON_CART = `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="6" cy="14" r="1" fill="currentColor"/><circle cx="12" cy="14" r="1" fill="currentColor"/><path d="M1 1h2l1.5 8h8L14 4H5" stroke="currentColor" fill="none" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const ICON_ERROR = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v4m0 4h.01" stroke-linecap="round"/></svg>`;

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
                    <span class="drapit-modal-title">Virtueel passen</span>
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
                            <div class="drapit-upload-title">Upload je foto</div>
                            <div class="drapit-upload-hint">Sleep een foto hierheen of klik om te uploaden</div>
                            <input type="file" accept="image/*" id="drapit-file-input" />
                        </div>
                    </div>
                    <div class="drapit-preview-section" style="display:none"></div>
                    <button class="drapit-submit" disabled style="margin-top:16px">
                        ${ICON_TRYON} Pas dit item
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
            submitBtn.disabled = false;

            previewSection.querySelector('.drapit-preview-remove').addEventListener('click', () => {
                userPhotoDataUrl = null;
                userPhotoFile = null;
                uploadSection.style.display = 'block';
                previewSection.style.display = 'none';
                submitBtn.disabled = true;
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
                <div class="drapit-loading-text">Bezig met virtueel passen…</div>
                <div class="drapit-loading-sub">Dit duurt meestal 15–30 seconden</div>
            </div>
        `;

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
                throw new Error(err.error || `HTTP ${res.status}`);
            }

            const data = await res.json();
            const tryonId = data.tryon_id;

            await pollForResult(overlay, body, tryonId, product);
        } catch (err) {
            console.error('[Drapit] Try-on error:', err);
            showError(body, err.message, product, overlay);
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
            throw new Error('Foto upload mislukt. Probeer het opnieuw.');
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
        body.innerHTML = `
            <div class="drapit-result">
                <img src="${resultUrl}" alt="Try-on resultaat" class="drapit-result-img" />
                <div class="drapit-result-actions">
                    ${product.buyUrl
                ? `<a href="${product.buyUrl}" class="drapit-result-buy" target="_blank" rel="noopener">
                            ${ICON_CART} Koop dit item
                           </a>`
                : `<button class="drapit-result-buy" onclick="this.closest('.drapit-overlay')?.remove()">
                            Sluiten
                           </button>`
            }
                    <button class="drapit-result-retry">Opnieuw</button>
                </div>
            </div>
        `;

        body.querySelector('.drapit-result-retry')?.addEventListener('click', () => {
            openModal(overlay.getRootNode().host?.shadowRoot || overlay.parentNode, product);
        });
    }

    // ── Show Error ────────────────────────────────────────────────────────
    function showError(body, message, product, overlay) {
        body.innerHTML = `
            <div class="drapit-error">
                <div class="drapit-error-icon">${ICON_ERROR}</div>
                <div class="drapit-error-text">Er ging iets mis</div>
                <div class="drapit-error-sub">${escapeHtml(message)}</div>
            </div>
            <button class="drapit-submit" style="margin-top:16px">Opnieuw proberen</button>
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
