'use client';

import { useState } from 'react';

interface WidgetConfiguratorProps {
    apiKeyPreview: string;
    domain: string;
}

export default function WidgetConfigurator({ apiKeyPreview, domain }: WidgetConfiguratorProps) {
    const [primaryColor, setPrimaryColor] = useState('#1D6FD8');
    const [ctaText, setCtaText] = useState('Virtueel passen');
    const [copied, setCopied] = useState(false);
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

    const snippet = `<!-- Drapit Virtual Try-On Widget -->
<script
  src="${window.location.origin}/widget/drapit-widget.js"
  data-drapit-key="${apiKeyPreview || 'dk_live_xxx'}"${primaryColor !== '#1D6FD8' ? `\n  data-drapit-color="${primaryColor}"` : ''}${ctaText !== 'Virtueel passen' ? `\n  data-drapit-cta="${ctaText}"` : ''}
  defer
></script>`;

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(snippet);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = snippet;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    async function handleTestIntegration() {
        setTestStatus('testing');
        try {
            const res = await fetch(`https://${domain}`, { mode: 'no-cors' });
            setTestStatus('success');
        } catch {
            setTestStatus('error');
        }
        setTimeout(() => setTestStatus('idle'), 3000);
    }

    return (
        <div className="space-y-6">
            {/* Code snippet */}
            <div className="relative">
                <pre className="bg-[#0F172A] text-[#E2E8F0] text-xs p-4 rounded-xl overflow-x-auto leading-relaxed pr-20">
                    {snippet}
                </pre>
                <button
                    onClick={handleCopy}
                    className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors duration-150"
                >
                    {copied ? (
                        <>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M3 7l3 3 5-5" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Gekopieerd!
                        </>
                    ) : (
                        <>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <rect x="4.5" y="4.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                                <path d="M9.5 4.5V2.5C9.5 1.95 9.05 1.5 8.5 1.5H2.5C1.95 1.5 1.5 1.95 1.5 2.5V8.5C1.5 9.05 1.95 9.5 2.5 9.5H4.5" stroke="currentColor" strokeWidth="1.2" />
                            </svg>
                            Kopiëren
                        </>
                    )}
                </button>
            </div>

            {/* Customization */}
            <div className="border-t border-[#F1F5F9] pt-6">
                <h3 className="text-sm font-bold text-[#0F172A] mb-4">Aanpassen</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Primary color */}
                    <div>
                        <label className="block text-xs font-medium text-[#0F172A] mb-1.5">
                            Primaire kleur
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="w-9 h-9 rounded-lg border border-[#CBD5E1] cursor-pointer p-0.5"
                            />
                            <input
                                type="text"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="flex-1 border border-[#CBD5E1] rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1D6FD8] focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* CTA text */}
                    <div>
                        <label className="block text-xs font-medium text-[#0F172A] mb-1.5">
                            CTA-knoptekst
                        </label>
                        <input
                            type="text"
                            value={ctaText}
                            onChange={(e) => setCtaText(e.target.value)}
                            className="w-full border border-[#CBD5E1] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6FD8] focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Preview button */}
            <div className="border-t border-[#F1F5F9] pt-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-xs text-[#64748B]">Preview:</span>
                    <button
                        style={{ backgroundColor: primaryColor }}
                        className="text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm hover:opacity-90 transition-opacity duration-150"
                    >
                        {ctaText}
                    </button>
                </div>

                <button
                    onClick={handleTestIntegration}
                    disabled={testStatus === 'testing'}
                    className="flex items-center gap-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] text-sm font-medium px-4 py-2.5 rounded-xl transition-colors duration-150 disabled:opacity-50"
                >
                    {testStatus === 'testing' ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-[#64748B]" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Testen...
                        </>
                    ) : testStatus === 'success' ? (
                        <>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M3 8l4 4 6-6" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Verbonden!
                        </>
                    ) : testStatus === 'error' ? (
                        <>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <circle cx="8" cy="8" r="6" stroke="#DC2626" strokeWidth="1.5" />
                                <path d="M6 6l4 4M10 6l-4 4" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            Niet bereikbaar
                        </>
                    ) : (
                        <>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M2 8h12M10 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Test integratie
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
