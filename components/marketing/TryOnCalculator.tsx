'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { PLAN_TIERS, recommendPlan } from '@/lib/plans-config';
import type { PlanInfo } from '@/lib/plans-config';

// ── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_CONVERSION = 8;
const MIN_VISITORS = 500;
const MAX_VISITORS = 200_000;
const VISITOR_STEP = 500;
const MIN_PRODUCTS = 1;
const MAX_PRODUCTS = 500;
const MIN_CONVERSION = 1;
const MAX_CONVERSION = 25;

// Average try-ons per session: scales with product catalog size
function avgTryonsPerSession(products: number): number {
    if (products <= 10) return 1.2;
    if (products <= 50) return 1.5;
    if (products <= 150) return 1.8;
    return 2.0;
}

// ── Plan name labels (match marketing display names) ────────────────────────

const PLAN_NAMES: Record<string, string> = {
    trial: 'Trial',
    starter: 'Starter',
    growth: 'Pro',
    scale: 'Scale',
    enterprise: 'Business',
};

// ── Slider sub-component ────────────────────────────────────────────────────

function SliderInput({ label, value, min, max, step, suffix, onChange }: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    suffix?: string;
    onChange: (v: number) => void;
}) {
    const pct = ((value - min) / (max - min)) * 100;

    return (
        <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(241,245,249,0.55)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.02em' }}>
                    {label}
                </span>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#F1F5F9', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.02em' }}>
                    {value.toLocaleString()}{suffix || ''}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="d-calc-slider"
                style={{
                    width: '100%',
                    height: 6,
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    borderRadius: 3,
                    outline: 'none',
                    cursor: 'pointer',
                    background: `linear-gradient(to right, #1D6FD8 0%, #1D6FD8 ${pct}%, rgba(255,255,255,0.08) ${pct}%, rgba(255,255,255,0.08) 100%)`,
                }}
                aria-label={label}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 11, color: 'rgba(241,245,249,0.25)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{min.toLocaleString()}{suffix || ''}</span>
                <span style={{ fontSize: 11, color: 'rgba(241,245,249,0.25)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{max.toLocaleString()}{suffix || ''}</span>
            </div>
        </div>
    );
}

// ── Mini plan card ──────────────────────────────────────────────────────────

function MiniPlanCard({ plan, isRecommended, t }: {
    plan: PlanInfo;
    isRecommended: boolean;
    t: ReturnType<typeof useTranslations>;
}) {
    const costPerTryon = plan.price > 0 ? (plan.price / plan.limit).toFixed(2) : '—';

    return (
        <div style={{
            background: isRecommended
                ? 'linear-gradient(180deg, rgba(29,111,216,0.18) 0%, rgba(13,24,41,0.96) 100%)'
                : 'rgba(13,24,41,0.55)',
            border: isRecommended
                ? '1.5px solid rgba(29,111,216,0.55)'
                : '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14,
            padding: '16px 14px',
            textAlign: 'center',
            position: 'relative',
            transition: 'all 0.3s ease',
            transform: isRecommended ? 'translateY(-4px)' : 'none',
            boxShadow: isRecommended ? '0 12px 32px rgba(29,111,216,0.18)' : '0 2px 8px rgba(0,0,0,0.15)',
        }}>
            {isRecommended && (
                <div style={{
                    position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #1D6FD8, #2563EB)', borderRadius: 100,
                    padding: '3px 12px', fontSize: 9, fontWeight: 800, color: 'white',
                    fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.08em',
                    whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(29,111,216,0.5)',
                }}>
                    {t('calculator.recommended')}
                </div>
            )}
            <div style={{
                fontSize: 10, fontWeight: 700, color: isRecommended ? '#60A5FA' : 'rgba(241,245,249,0.35)',
                fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.08em', marginBottom: 6,
            }}>
                {PLAN_NAMES[plan.key]?.toUpperCase()}
            </div>
            <div style={{
                fontSize: 22, fontWeight: 800, color: '#F1F5F9',
                fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.02em', lineHeight: 1,
            }}>
                {plan.price === 0 ? t('calculator.free') : `€${plan.price}`}
            </div>
            <div style={{
                fontSize: 11, color: 'rgba(241,245,249,0.35)', fontFamily: 'Plus Jakarta Sans, sans-serif', marginTop: 4,
            }}>
                {plan.limit.toLocaleString()} {t('calculator.tryOns')}
            </div>
            {plan.price > 0 && (
                <div style={{
                    fontSize: 10, color: 'rgba(241,245,249,0.25)', fontFamily: 'Plus Jakarta Sans, sans-serif', marginTop: 4,
                }}>
                    €{costPerTryon}/{t('calculator.tryOn')}
                </div>
            )}
        </div>
    );
}

// ── Main component ──────────────────────────────────────────────────────────

export default function TryOnCalculator() {
    const t = useTranslations();
    const locale = useLocale();

    const [visitors, setVisitors] = useState(10_000);
    const [products, setProducts] = useState(30);
    const [conversionRate, setConversionRate] = useState(DEFAULT_CONVERSION);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const estimated = useMemo(() => {
        const rate = conversionRate / 100;
        const avg = avgTryonsPerSession(products);
        return Math.round(visitors * rate * avg);
    }, [visitors, conversionRate, products]);

    const recommended = useMemo(() => recommendPlan(estimated), [estimated]);
    const overLimit = estimated > 10_000;

    const fmt = (n: number) => new Intl.NumberFormat(locale === 'nl' ? 'nl-NL' : 'en-US').format(n);

    return (
        <div>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#1D6FD8', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 18 }}>
                    {t('calculator.eyebrow')}
                </div>
                <h2 className="d-gradient" style={{ fontSize: 'clamp(26px, 3.5vw, 44px)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.08, marginBottom: 16 }}>
                    {t('calculator.title')}
                </h2>
                <p style={{ fontSize: 16, color: 'rgba(241,245,249,0.45)', fontFamily: 'Plus Jakarta Sans, sans-serif', maxWidth: 460, margin: '0 auto' }}>
                    {t('calculator.subtitle')}
                </p>
            </div>

            {/* Calculator body */}
            <div className="d-calc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>

                {/* Left: Inputs */}
                <div style={{
                    background: 'rgba(13,24,41,0.55)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 20, padding: '32px 28px', backdropFilter: 'blur(12px)',
                }}>
                    <SliderInput
                        label={t('calculator.visitors')}
                        value={visitors}
                        min={MIN_VISITORS}
                        max={MAX_VISITORS}
                        step={VISITOR_STEP}
                        onChange={setVisitors}
                    />

                    <SliderInput
                        label={t('calculator.products')}
                        value={products}
                        min={MIN_PRODUCTS}
                        max={MAX_PRODUCTS}
                        step={1}
                        onChange={setProducts}
                    />

                    {/* Advanced toggle */}
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: 12, fontWeight: 600, color: '#1D6FD8',
                            fontFamily: 'Plus Jakarta Sans, sans-serif', padding: 0,
                            marginBottom: showAdvanced ? 16 : 0,
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}
                    >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: showAdvanced ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
                            <path d="M4 2l4 4-4 4" stroke="#1D6FD8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {showAdvanced ? t('calculator.hideAdvanced') : t('calculator.showAdvanced')}
                    </button>

                    {showAdvanced && (
                        <SliderInput
                            label={t('calculator.conversionRate')}
                            value={conversionRate}
                            min={MIN_CONVERSION}
                            max={MAX_CONVERSION}
                            step={1}
                            suffix="%"
                            onChange={setConversionRate}
                        />
                    )}
                </div>

                {/* Right: Result */}
                <div style={{
                    background: 'linear-gradient(180deg, rgba(29,111,216,0.1) 0%, rgba(13,24,41,0.7) 100%)',
                    border: '1px solid rgba(29,111,216,0.2)',
                    borderRadius: 20, padding: '36px 28px', backdropFilter: 'blur(12px)',
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(241,245,249,0.4)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.06em', marginBottom: 12 }}>
                        {t('calculator.estimated')}
                    </div>

                    <div style={{
                        fontSize: 'clamp(40px, 5vw, 56px)', fontWeight: 800, color: '#F1F5F9',
                        fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.03em',
                        lineHeight: 1, marginBottom: 6,
                    }}>
                        ~{fmt(estimated)}
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(241,245,249,0.35)', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 32 }}>
                        {t('calculator.tryOns')}/{t('calculator.perMonth')}
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 28 }} />

                    {overLimit ? (
                        <>
                            <div style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 8 }}>
                                {t('calculator.overLimit')}
                            </div>
                            <Link href="/contact" className="d-btn-primary" style={{
                                display: 'inline-block', padding: '14px 32px', borderRadius: 12,
                                fontSize: 14, fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif',
                                letterSpacing: '0.04em', textDecoration: 'none', marginTop: 16,
                                boxShadow: '0 8px 28px rgba(29,111,216,0.45)',
                            }}>
                                {t('calculator.overLimitCta')}
                            </Link>
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(241,245,249,0.4)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.06em', marginBottom: 10 }}>
                                {t('calculator.bestFit')}
                            </div>

                            {/* Plan badge */}
                            <div style={{
                                display: 'inline-block', background: 'linear-gradient(135deg, #1D6FD8, #2563EB)',
                                borderRadius: 100, padding: '6px 20px', marginBottom: 14,
                                boxShadow: '0 4px 20px rgba(29,111,216,0.45)',
                            }}>
                                <span style={{ fontSize: 14, fontWeight: 800, color: 'white', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.06em' }}>
                                    {PLAN_NAMES[recommended.key]}
                                </span>
                            </div>

                            <div style={{ fontSize: 28, fontWeight: 800, color: '#F1F5F9', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.02em', marginBottom: 4 }}>
                                {recommended.price === 0 ? t('calculator.free') : `€${recommended.price}`}
                                {recommended.price > 0 && (
                                    <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(241,245,249,0.4)' }}>
                                        /{t('calculator.month')}
                                    </span>
                                )}
                            </div>

                            {recommended.price > 0 && (
                                <div style={{ fontSize: 13, color: 'rgba(241,245,249,0.35)', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 20 }}>
                                    €{(recommended.price / recommended.limit).toFixed(2)} {t('calculator.costPerTryon')}
                                </div>
                            )}

                            <Link href="/dashboard/login" className="d-btn-primary" style={{
                                display: 'inline-block', padding: '14px 32px', borderRadius: 12,
                                fontSize: 14, fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif',
                                letterSpacing: '0.04em', textDecoration: 'none', marginTop: 8,
                                boxShadow: '0 8px 28px rgba(29,111,216,0.45)',
                            }}>
                                {t('calculator.cta', { plan: PLAN_NAMES[recommended.key] })}
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Plan comparison bar */}
            <div className="d-calc-plans" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginTop: 40 }}>
                {PLAN_TIERS.map((plan) => (
                    <MiniPlanCard
                        key={plan.key}
                        plan={plan}
                        isRecommended={plan.key === recommended.key && !overLimit}
                        t={t}
                    />
                ))}
            </div>

            {/* Disclaimer */}
            <p style={{ textAlign: 'center', marginTop: 28, fontSize: 12, color: 'rgba(241,245,249,0.2)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {t('calculator.disclaimer')}
            </p>
        </div>
    );
}
