import { createClient } from '@/lib/supabase/server';
import { PLANS, STUDIO_PLANS, STUDIO_CREDIT_PACKS } from '@/lib/stripe';
import { colors, typography, componentStyles } from '@/lib/design-tokens';
import type { Plan, StudioPlan } from '@/lib/supabase/types';
import BillingActions from '@/components/dashboard/BillingActions';
import StudioBillingActions from '@/components/dashboard/StudioBillingActions';

const planOrder: Plan[] = ['trial', 'starter', 'growth', 'scale', 'enterprise'];
const studioPlanOrder: StudioPlan[] = ['studio_trial', 'studio_starter', 'studio_pro', 'studio_scale'];

export default async function BillingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: shop } = await supabase
        .from('shops')
        .select('id, plan, tryons_this_month, monthly_tryon_limit, stripe_customer_id, has_studio, studio_plan, studio_credits_used, studio_credits_limit, studio_extra_credits, studio_subscription_id')
        .eq('owner_id', user.id)
        .single();

    // ── VTON data ────────────────────────────────────────────────────────
    const currentPlan = ((shop?.plan as string) || 'starter') as Plan;
    const hasStripe = !!(shop?.stripe_customer_id);
    const tryonsUsed = (shop?.tryons_this_month as number) ?? 0;
    const tryonsLimit = (shop?.monthly_tryon_limit as number) ?? 500;
    const usagePct = tryonsLimit > 0 ? Math.min((tryonsUsed / tryonsLimit) * 100, 100) : 0;

    // ── Studio data ──────────────────────────────────────────────────────
    const studioPlan = ((shop?.studio_plan as string) || 'studio_trial') as StudioPlan;
    const studioCreditsUsed = (shop?.studio_credits_used as number) ?? 0;
    const studioCreditsLimit = (shop?.studio_credits_limit as number) ?? 20;
    const studioExtraCredits = (shop?.studio_extra_credits as number) ?? 0;
    const studioTotalAvailable = (studioCreditsLimit - studioCreditsUsed) + studioExtraCredits;
    const studioUsagePct = studioCreditsLimit > 0
        ? Math.min((studioCreditsUsed / studioCreditsLimit) * 100, 100)
        : 0;
    const hasStudioSub = studioPlan !== 'studio_trial' && !!shop?.studio_subscription_id;

    const vtonUsageColor =
        usagePct > 90 ? colors.red :
            usagePct > 75 ? colors.amber :
                colors.blue;

    const studioUsageColor =
        studioUsagePct > 90 ? colors.red :
            studioUsagePct > 75 ? colors.amber :
                '#7C3AED';

    return (
        <div className="space-y-8 max-w-[1000px]">

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* VTON section */}
            {/* ═══════════════════════════════════════════════════════════════ */}

            <div>
                <div className="flex items-center gap-3 mb-1">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${colors.blue}18` }}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 2L10.5 5.5H13.5L11 8L12 12L8 10L4 12L5 8L2.5 5.5H5.5L8 2Z" stroke={colors.blue} strokeWidth="1.2" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div>
                        <h1 className={typography.h1} style={{ color: colors.gray900 }}>VTON — Virtual Try-On</h1>
                        <p className="text-xs mt-0.5" style={{ color: colors.gray500 }}>
                            Abonnement voor de try-on widget op je Shopify store
                        </p>
                    </div>
                </div>
            </div>

            {/* Current VTON plan card */}
            <div className={componentStyles.dashboardCard}>
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className={typography.h3} style={{ color: colors.gray900 }}>Huidig plan</h2>
                            <span
                                className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                                style={{ backgroundColor: colors.blueLight, color: colors.blue }}
                            >
                                {PLANS[currentPlan].name}
                            </span>
                        </div>
                        <p className="text-xs" style={{ color: colors.gray500 }}>
                            {tryonsUsed.toLocaleString('nl-NL')} van {tryonsLimit.toLocaleString('nl-NL')} try-ons gebruikt deze maand
                        </p>
                    </div>
                    {hasStripe && (
                        <BillingActions action="portal" />
                    )}
                </div>

                <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1.5" style={{ color: colors.gray500 }}>
                        <span>{tryonsUsed.toLocaleString('nl-NL')} try-ons</span>
                        <span>{tryonsLimit.toLocaleString('nl-NL')} limit</span>
                    </div>
                    <div
                        className="w-full h-3 rounded-full overflow-hidden"
                        style={{ backgroundColor: colors.blueLight }}
                    >
                        <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${usagePct}%`, backgroundColor: vtonUsageColor }}
                        />
                    </div>
                </div>
            </div>

            {/* VTON Plans grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {planOrder.map((planKey) => {
                    const config = PLANS[planKey];
                    const isCurrent = planKey === currentPlan;
                    const currentIdx = planOrder.indexOf(currentPlan);
                    const thisIdx = planOrder.indexOf(planKey);
                    const isUpgrade = thisIdx > currentIdx;
                    const isDowngrade = thisIdx < currentIdx;

                    return (
                        <div
                            key={planKey}
                            className="relative rounded-2xl border-2 p-6 transition-all duration-200"
                            style={{
                                backgroundColor: colors.white,
                                borderColor: isCurrent
                                    ? colors.blue
                                    : config.popular
                                        ? `${colors.blue}33`
                                        : colors.gray100,
                                boxShadow: isCurrent
                                    ? `0 0 0 1px ${colors.blue}`
                                    : undefined,
                            }}
                        >
                            {config.popular && !isCurrent && (
                                <span
                                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-0.5 rounded-full"
                                    style={{ backgroundColor: colors.blue, color: colors.white }}
                                >
                                    Populair
                                </span>
                            )}
                            {isCurrent && (
                                <span
                                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-0.5 rounded-full"
                                    style={{ backgroundColor: colors.green, color: colors.white }}
                                >
                                    Huidig
                                </span>
                            )}

                            <div className="text-center mb-6 pt-2">
                                <h3 className="text-lg font-bold" style={{ color: colors.gray900 }}>
                                    {config.name}
                                </h3>
                                <div className="mt-2">
                                    <span className="text-3xl font-bold" style={{ color: colors.gray900 }}>
                                        {config.price === 0 ? 'Gratis' : `€${config.price}`}
                                    </span>
                                    {config.price > 0 && (
                                        <span className="text-sm" style={{ color: colors.gray500 }}>/maand</span>
                                    )}
                                </div>
                                <p className="text-xs mt-1" style={{ color: colors.gray500 }}>
                                    {config.limit.toLocaleString('nl-NL')} try-ons/maand
                                </p>
                            </div>

                            <ul className="space-y-2.5 mb-6">
                                {config.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-2 text-sm" style={{ color: colors.gray500 }}>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
                                            <path d="M3 8l4 4 6-6" stroke={colors.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {isCurrent ? (
                                <button
                                    disabled
                                    className="w-full py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed"
                                    style={{ backgroundColor: colors.gray100, color: colors.sidebarText }}
                                >
                                    Huidig plan
                                </button>
                            ) : (
                                <BillingActions
                                    action="checkout"
                                    plan={planKey}
                                    isUpgrade={isUpgrade}
                                    isDowngrade={isDowngrade}
                                    popular={config.popular}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* Divider */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="border-t" style={{ borderColor: colors.gray100 }} />

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* Studio section */}
            {/* ═══════════════════════════════════════════════════════════════ */}

            <div>
                <div className="flex items-center gap-3 mb-1">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: '#7C3AED18' }}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="#7C3AED" strokeWidth="1.2" />
                            <circle cx="5.5" cy="6.5" r="1" fill="#7C3AED" />
                            <path d="M2 10l3.5-3 2.5 2.5 2-2 4 4" stroke="#7C3AED" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div>
                        <h1 className={typography.h1} style={{ color: colors.gray900 }}>Drapit Studio</h1>
                        <p className="text-xs mt-0.5" style={{ color: colors.gray500 }}>
                            AI-fotostudio voor productfoto's met modellen, product shots en 360° rotaties
                        </p>
                    </div>
                </div>
            </div>

            {/* Current Studio plan card */}
            <div className={componentStyles.dashboardCard}>
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className={typography.h3} style={{ color: colors.gray900 }}>Huidig Studio plan</h2>
                            <span
                                className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                                style={{ backgroundColor: '#7C3AED18', color: '#7C3AED' }}
                            >
                                {STUDIO_PLANS[studioPlan]?.name ?? 'Gratis proefperiode'}
                            </span>
                            {studioPlan === 'studio_trial' && (
                                <span
                                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: colors.amber + '22', color: colors.amber }}
                                >
                                    Proefperiode
                                </span>
                            )}
                        </div>
                        <p className="text-xs" style={{ color: colors.gray500 }}>
                            {studioCreditsUsed.toLocaleString('nl-NL')} van {studioCreditsLimit.toLocaleString('nl-NL')} maandelijkse credits gebruikt
                            {studioExtraCredits > 0 && (
                                <> · <span style={{ color: '#7C3AED' }}>+ {studioExtraCredits} extra credits</span></>
                            )}
                        </p>
                        <p className="text-xs mt-0.5 font-medium" style={{ color: colors.gray900 }}>
                            {studioTotalAvailable} credits beschikbaar
                        </p>
                    </div>
                    {hasStudioSub && hasStripe && (
                        <BillingActions action="portal" />
                    )}
                </div>

                {/* Studio credits bar */}
                <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1.5" style={{ color: colors.gray500 }}>
                        <span>{studioCreditsUsed.toLocaleString('nl-NL')} credits gebruikt</span>
                        <span>{studioCreditsLimit.toLocaleString('nl-NL')} maandelijks limiet</span>
                    </div>
                    <div
                        className="w-full h-3 rounded-full overflow-hidden"
                        style={{ backgroundColor: '#7C3AED18' }}
                    >
                        <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${studioUsagePct}%`, backgroundColor: studioUsageColor }}
                        />
                    </div>
                </div>

                {/* Credit costs legend */}
                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t" style={{ borderColor: colors.gray100 }}>
                    <p className="text-xs w-full" style={{ color: colors.gray500 }}>Creditkosten per generatie:</p>
                    {[
                        { label: 'Virtual Model', cost: 2 },
                        { label: 'Product Only', cost: 1 },
                        { label: '360° Rotatie', cost: 4 },
                    ].map(item => (
                        <div
                            key={item.label}
                            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: '#7C3AED10', color: '#7C3AED' }}
                        >
                            <span className="font-bold">{item.cost}</span>
                            <span style={{ color: colors.gray500 }}>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Studio Plans grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {studioPlanOrder.map((planKey) => {
                    const config = STUDIO_PLANS[planKey];
                    const isCurrent = planKey === studioPlan;
                    const currentIdx = studioPlanOrder.indexOf(studioPlan);
                    const thisIdx = studioPlanOrder.indexOf(planKey);
                    const isUpgrade = thisIdx > currentIdx;
                    const isDowngrade = thisIdx < currentIdx;
                    const isTrial = planKey === 'studio_trial';

                    return (
                        <div
                            key={planKey}
                            className="relative rounded-2xl border-2 p-5 transition-all duration-200"
                            style={{
                                backgroundColor: colors.white,
                                borderColor: isCurrent
                                    ? '#7C3AED'
                                    : config.popular
                                        ? '#7C3AED33'
                                        : colors.gray100,
                                boxShadow: isCurrent
                                    ? '0 0 0 1px #7C3AED'
                                    : undefined,
                            }}
                        >
                            {config.popular && !isCurrent && (
                                <span
                                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-0.5 rounded-full"
                                    style={{ backgroundColor: '#7C3AED', color: colors.white }}
                                >
                                    Populair
                                </span>
                            )}
                            {isCurrent && (
                                <span
                                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-0.5 rounded-full"
                                    style={{ backgroundColor: colors.green, color: colors.white }}
                                >
                                    Huidig
                                </span>
                            )}

                            <div className="text-center mb-5 pt-2">
                                <h3 className="text-base font-bold" style={{ color: colors.gray900 }}>
                                    {config.name}
                                </h3>
                                <div className="mt-2">
                                    <span className="text-2xl font-bold" style={{ color: colors.gray900 }}>
                                        {config.price === 0 ? 'Gratis' : `€${config.price}`}
                                    </span>
                                    {config.price > 0 && (
                                        <span className="text-sm" style={{ color: colors.gray500 }}>/maand</span>
                                    )}
                                </div>
                                <p className="text-xs mt-1" style={{ color: colors.gray500 }}>
                                    {config.credits_limit.toLocaleString('nl-NL')} credits/maand
                                </p>
                            </div>

                            <ul className="space-y-2 mb-5">
                                {config.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-2 text-xs" style={{ color: colors.gray500 }}>
                                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
                                            <path d="M3 8l4 4 6-6" stroke={colors.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {isCurrent ? (
                                <button
                                    disabled
                                    className="w-full py-2 rounded-xl text-sm font-semibold cursor-not-allowed"
                                    style={{ backgroundColor: colors.gray100, color: colors.sidebarText }}
                                >
                                    Huidig plan
                                </button>
                            ) : isTrial ? (
                                <button
                                    disabled
                                    className="w-full py-2 rounded-xl text-xs font-medium cursor-not-allowed"
                                    style={{ backgroundColor: colors.gray100, color: colors.gray500 }}
                                >
                                    Basisplan
                                </button>
                            ) : (
                                <StudioBillingActions
                                    action="studio-checkout"
                                    plan={planKey}
                                    isUpgrade={isUpgrade}
                                    isDowngrade={isDowngrade}
                                    popular={config.popular}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Credit packs section */}
            <div className={componentStyles.dashboardCard}>
                <div className="mb-5">
                    <h2 className={typography.h3} style={{ color: colors.gray900 }}>Extra credits kopen</h2>
                    <p className="text-xs mt-1" style={{ color: colors.gray500 }}>
                        Eenmalige aankoop — credits worden direct toegevoegd aan je account en vervallen niet.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {STUDIO_CREDIT_PACKS.map((pack, idx) => (
                        <div
                            key={pack.credits}
                            className="relative rounded-xl border-2 p-5 text-center"
                            style={{
                                borderColor: pack.popular ? '#7C3AED33' : colors.gray100,
                                backgroundColor: pack.popular ? '#7C3AED06' : colors.white,
                            }}
                        >
                            {pack.popular && (
                                <span
                                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-0.5 rounded-full"
                                    style={{ backgroundColor: '#7C3AED', color: colors.white }}
                                >
                                    Beste waarde
                                </span>
                            )}
                            <div className="text-2xl font-bold mb-1" style={{ color: '#7C3AED' }}>
                                {pack.credits}
                            </div>
                            <div className="text-xs mb-3" style={{ color: colors.gray500 }}>
                                credits · €{(pack.price / pack.credits * 100).toFixed(1)}ct per credit
                            </div>
                            <div className="text-xl font-bold mb-4" style={{ color: colors.gray900 }}>
                                €{pack.price}
                            </div>
                            <StudioBillingActions
                                action="studio-credits"
                                packIndex={idx}
                                popular={pack.popular}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* FAQ */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className={componentStyles.dashboardCard}>
                <h2 className={`${typography.h3} mb-4`} style={{ color: colors.gray900 }}>
                    Veelgestelde vragen
                </h2>
                <div className="space-y-4">
                    {[
                        {
                            q: 'Wat is een credit?',
                            a: 'Eén credit staat voor één AI-generatie in Drapit Studio. Virtual Model kost 2 credits, Product Only 1 credit, en 360° Rotatie 4 credits (4 hoeken × 1 credit).',
                        },
                        {
                            q: 'Vervallen ongebruikte VTON try-ons?',
                            a: 'Nee — ongebruikte try-ons rollen automatisch door naar de volgende maand (max. 1× je maandlimiet).',
                        },
                        {
                            q: 'Vervallen ongebruikte Studio credits?',
                            a: 'Maandelijkse plan-credits worden maandelijks gereset. Extra credits die je los hebt gekocht vervallen nooit.',
                        },
                        {
                            q: 'Kan ik op elk moment annuleren?',
                            a: 'Ja, je kunt beide abonnementen onafhankelijk annuleren via de Stripe Portal. Je houdt toegang tot het einde van je huidige factureringsperiode.',
                        },
                        {
                            q: 'Zijn VTON en Studio losse abonnementen?',
                            a: 'Ja — je kunt VTON en Drapit Studio volledig onafhankelijk van elkaar afnemen. Je betaalt alleen voor wat je gebruikt.',
                        },
                    ].map((faq) => (
                        <div key={faq.q}>
                            <p className="text-sm font-medium" style={{ color: colors.gray900 }}>
                                {faq.q}
                            </p>
                            <p className="text-xs mt-1" style={{ color: colors.gray500 }}>
                                {faq.a}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
