'use client';

import { useEffect, useState } from 'react';
import { colors } from '@/lib/design-tokens';

interface CancellationWarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function CancellationWarningModal({
    isOpen,
    onClose,
    onConfirm
}: CancellationWarningModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{
                background: 'rgba(6,9,15,0.75)',
                backdropFilter: 'blur(4px)',
            }}
            onClick={onClose}
        >
            {/* Modal Container */}
            <div
                className="relative w-full max-w-lg rounded-2xl p-6"
                style={{
                    backgroundColor: colors.white,
                    border: `1px solid ${colors.gray200}`,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                    animation: 'drapit-slideup 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-150"
                    style={{
                        backgroundColor: colors.gray100,
                        color: colors.gray600,
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = colors.gray200;
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = colors.gray100;
                    }}
                    aria-label="Sluit modal"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                {/* Header */}
                <div className="mb-5">
                    <h3 className="text-xl font-bold" style={{ color: colors.gray900 }}>
                        Abonnement beheren via Stripe Portal
                    </h3>
                </div>

                {/* Info Section */}
                <div className="mb-5">
                    <p className="text-sm font-semibold mb-2" style={{ color: colors.gray900 }}>
                        Via de Stripe Portal kun je:
                    </p>
                    <ul className="space-y-1.5 ml-4">
                        <li className="text-sm flex items-start gap-2" style={{ color: colors.gray700 }}>
                            <span style={{ color: colors.blue }}>•</span>
                            <span>Betaalmethode wijzigen</span>
                        </li>
                        <li className="text-sm flex items-start gap-2" style={{ color: colors.gray700 }}>
                            <span style={{ color: colors.blue }}>•</span>
                            <span>Facturen bekijken en downloaden</span>
                        </li>
                        <li className="text-sm flex items-start gap-2" style={{ color: colors.gray700 }}>
                            <span style={{ color: colors.blue }}>•</span>
                            <span>Abonnement opzeggen</span>
                        </li>
                    </ul>
                </div>

                {/* Warning Section */}
                <div
                    className="mb-6 p-4 rounded-xl"
                    style={{
                        backgroundColor: colors.amber + '15',
                        borderLeft: `4px solid ${colors.amber}`,
                    }}
                >
                    <p className="text-sm font-semibold mb-3" style={{ color: colors.gray900 }}>
                        Let op bij opzeggen:
                    </p>
                    <div className="space-y-2">
                        <p className="text-sm flex items-start gap-2" style={{ color: colors.gray700 }}>
                            <span style={{ color: colors.green }}>✅</span>
                            <span>Je houdt toegang tot einde factureringsperiode</span>
                        </p>
                        <p className="text-sm flex items-start gap-2" style={{ color: colors.gray700 }}>
                            <span style={{ color: colors.green }}>✅</span>
                            <span>Extra gekochte try-ons/credits blijven behouden</span>
                        </p>
                        <p className="text-sm flex items-start gap-2" style={{ color: colors.gray700 }}>
                            <span style={{ color: colors.red }}>❌</span>
                            <span>Rollover try-ons gaan verloren</span>
                        </p>
                        <p className="text-sm flex items-start gap-2" style={{ color: colors.gray700 }}>
                            <span style={{ color: colors.red }}>❌</span>
                            <span>Auto top-up wordt uitgeschakeld</span>
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150"
                        style={{
                            backgroundColor: colors.gray100,
                            color: colors.gray900,
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = colors.gray200;
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = colors.gray100;
                        }}
                    >
                        Annuleren
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150"
                        style={{
                            backgroundColor: colors.blue,
                            color: colors.white,
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.opacity = '0.9';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.opacity = '1';
                        }}
                    >
                        Doorgaan naar Stripe Portal
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes drapit-slideup {
                    from { opacity: 0; transform: translateY(30px) scale(0.96); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}
