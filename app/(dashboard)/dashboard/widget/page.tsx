import { createClient } from '@/lib/supabase/server';
import WidgetConfigurator from '@/components/dashboard/WidgetConfigurator';

export default async function WidgetPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Get the shop's API key for the snippet
    const { data: shop } = await supabase
        .from('shops')
        .select('id, name, domain')
        .eq('owner_id', user.id)
        .single();

    const shopId = shop?.id;

    // Get active API key
    let apiKeyPreview = '';
    if (shopId) {
        const { data: keys } = await supabase
            .from('api_keys')
            .select('key_prefix')
            .eq('shop_id', shopId)
            .eq('is_active', true)
            .limit(1);

        if (keys && keys.length > 0) {
            apiKeyPreview = keys[0].key_prefix + '••••••••';
        }
    }

    const domain = shop?.domain || 'jouw-webshop.nl';

    return (
        <div className="space-y-6 max-w-[900px]">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#0F172A]">Widget configuratie</h1>
                <p className="text-sm text-[#64748B] mt-1">
                    Installeer de Drapit try-on widget op je webshop en pas het uiterlijk aan.
                </p>
            </div>

            {/* Installation snippet */}
            <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-[0_1px_2px_rgba(15,39,68,0.06)] p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 bg-[#EBF3FF] rounded-lg flex items-center justify-center">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M6 3l-4 4 4 4" stroke="#1D6FD8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 3l4 4-4 4" stroke="#1D6FD8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <line x1="10" y1="1" x2="8" y2="17" stroke="#1D6FD8" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-[#0F172A]">Installatie</h2>
                        <p className="text-xs text-[#64748B]">Plak dit script in de {'<head>'} van je webshop</p>
                    </div>
                </div>
                <WidgetConfigurator
                    apiKeyPreview={apiKeyPreview}
                    domain={domain}
                />
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-[0_1px_2px_rgba(15,39,68,0.06)] p-6">
                <h2 className="text-base font-bold text-[#0F172A] mb-4">Hoe het werkt</h2>
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#EBF3FF] flex items-center justify-center text-sm font-bold text-[#1D6FD8] shrink-0">1</div>
                        <div>
                            <p className="text-sm font-medium text-[#0F172A]">Script toevoegen</p>
                            <p className="text-xs text-[#64748B] mt-0.5">
                                Plak het script in de {'<head>'} sectie van je website. Het laadt automatisch de widget.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#EBF3FF] flex items-center justify-center text-sm font-bold text-[#1D6FD8] shrink-0">2</div>
                        <div>
                            <p className="text-sm font-medium text-[#0F172A]">Product-attributen toevoegen</p>
                            <p className="text-xs text-[#64748B] mt-0.5">
                                Voeg <code className="px-1.5 py-0.5 bg-[#F1F5F9] rounded text-[11px] font-mono">data-drapit-product</code> attributen
                                toe aan je product-elementen met de product afbeelding URL.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#EBF3FF] flex items-center justify-center text-sm font-bold text-[#1D6FD8] shrink-0">3</div>
                        <div>
                            <p className="text-sm font-medium text-[#0F172A]">Klaar!</p>
                            <p className="text-xs text-[#64748B] mt-0.5">
                                De &ldquo;Virtueel passen&rdquo; knop verschijnt automatisch bij elk product.
                                Klanten kunnen direct hun foto uploaden en het kledingstuk virtueel passen.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* HTML Example */}
            <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-[0_1px_2px_rgba(15,39,68,0.06)] p-6">
                <h2 className="text-base font-bold text-[#0F172A] mb-3">Voorbeeld HTML</h2>
                <p className="text-xs text-[#64748B] mb-3">
                    Zo gebruik je de data-attributen op een productpagina:
                </p>
                <pre className="bg-[#0F172A] text-[#E2E8F0] text-xs p-4 rounded-xl overflow-x-auto leading-relaxed">
                    {`<div
  data-drapit-product="https://jouw-shop.nl/images/jurk.jpg"
  data-drapit-product-id="SKU-001"
  data-drapit-buy-url="https://jouw-shop.nl/jurk"
  data-drapit-product-name="Zomerjurk Bloemenprint"
>
  <!-- Je bestaande product HTML -->
</div>`}
                </pre>
            </div>
        </div>
    );
}
