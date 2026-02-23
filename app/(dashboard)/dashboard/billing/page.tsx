import { createClient } from '@/lib/supabase/server';
import { PLANS } from '@/lib/stripe';
import { colors, typography, componentStyles } from '@/lib/design-tokens';
import type { Plan } from '@/lib/supabase/types';
import BillingActions from '@/components/dashboard/BillingActions';

const planOrder: Plan[] = ['starter', 'growth', 'scale', 'enterprise'];

export default async function BillingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: shop } = await supabase
        .from('shops')
        .select('id, plan, tryons_this_month, monthly_tryon_limit, stripe_customer_id')
        .eq('owner_id', user.id)
        .single();

    const currentPlan = ((shop?.plan as string) || 'starter') as Plan;
    const hasStripe = !!(shop?.stripe_customer_id);
    const tryonsUsed = (shop?.tryons_this_month as number) ?? 0;
    const tryonsLimit = (shop?.monthly_tryon_limit as number) ?? 500;
    const usagePct = tryonsLimit > 0 ? Math.min((tryonsUsed / tryonsLimit) * 100, 100) : 0;

    const usageColor =
        usagePct > 90 ? colors.red :
            usagePct > 75 ? colors.amber :
                colors.blue;

    return (
        <div className="space-y-6 max-w-[1000px]">
            {/* Header */}
            <div>
                <h1 className={typography.h1} style={{ color: colors.gray900 }}>Abonnement</h1>
                <p className={`${typography.body} mt-1`} style={{ color: colors.gray500 }}>
                    Beheer je abonnement en bekijk je verbruik.
                </p>
            </div>

            {/* Current plan card */}
            <div className={componentStyles.dashboardCard}>
                <div className="flex items-start justify-between mb-6">
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

                {/* Usage bar */}
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
                            style={{ width: `${usagePct}%`, backgroundColor: usageColor }}
                        />
                    </div>
                </div>
            </div>

            {/* Plans grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                        €{config.price}
                                    </span>
                                    <span className="text-sm" style={{ color: colors.gray500 }}>
                                        /maand
                                    </span>
                                </div>
                                <p className="text-xs mt-1" style={{ color: colors.gray500 }}>
                                    {config.limit.toLocaleString('nl-NL')} try-ons/maand
                                </p>
                            </div>

                            <ul className="space-y-2.5 mb-6">
                                {config.features.map((feature) => (
                                    <li
                                        key={feature}
                                        className="flex items-start gap-2 text-sm"
                                        style={{ color: colors.gray500 }}
                                    >
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

            {/* FAQ */}
            <div className={componentStyles.dashboardCard}>
                <h2 className={`${typography.h3} mb-4`} style={{ color: colors.gray900 }}>
                    Veelgestelde vragen
                </h2>
                <div className="space-y-4">
                    {[
                        {
                            q: 'Wat gebeurt er als ik mijn limiet bereik?',
                            a: 'Als je het maximum aantal try-ons bereikt, weigert de API nieuwe verzoeken tot de volgende maand. Je kunt altijd upgraden om direct meer try-ons te krijgen.',
                        },
                        {
                            q: 'Kan ik op elk moment annuleren?',
                            a: 'Ja, je kunt je abonnement op elk moment annuleren via de Stripe Portal. Je houdt toegang tot het einde van je huidige factureringsperiode.',
                        },
                        {
                            q: 'Hoe worden try-ons geteld?',
                            a: 'Elke succesvolle API-aanroep naar het try-on endpoint telt als één try-on, ongeacht of het resultaat succesvol is of niet.',
                        },
                        {
                            q: 'Kan ik upgraden of downgraden?',
                            a: 'Jazeker. Bij een upgrade krijg je direct toegang tot de nieuwe limiet. Bij een downgrade wordt het nieuwe plan actief aan het einde van je huidige factureringsperiode.',
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
