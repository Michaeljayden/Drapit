import Logo from '@/components/ui/Logo';
import { colors, componentStyles, typography } from '@/lib/design-tokens';

export default function MarketingPage() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen px-4">
            {/* Hero */}
            <div className="max-w-2xl text-center space-y-6">
                <div className="flex justify-center mb-4">
                    <Logo size="lg" />
                </div>

                <h1 className={`${typography.h1} text-[${colors.gray900}]`}>
                    Virtual try-on voor jouw webshop
                </h1>

                <p className={`${typography.body} text-[${colors.gray500}] max-w-lg mx-auto`}>
                    Laat klanten kleding passen vóórdat ze bestellen. Minder retouren,
                    meer conversie — in één regel code.
                </p>

                <div className="flex gap-3 justify-center pt-4">
                    <button className={componentStyles.buttonPrimary}>
                        Start gratis trial
                    </button>
                    <button className={componentStyles.buttonSecondary}>
                        Bekijk demo
                    </button>
                </div>
            </div>
        </main>
    );
}
