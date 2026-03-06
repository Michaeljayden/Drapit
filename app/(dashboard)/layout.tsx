import Sidebar from '@/components/dashboard/Sidebar';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch shop data for sidebar
    let shopName = 'Mijn Shop';
    let tryonsUsed = 0;
    let tryonsLimit = 500;
    let studioCreditsUsed = 0;
    let studioCreditsLimit = 20;
    let studioExtraCredits = 0;

    if (user) {
        const { data: shop } = await supabase
            .from('shops')
            .select('name, tryons_this_month, monthly_tryon_limit, studio_credits_used, studio_credits_limit, studio_extra_credits')
            .eq('owner_id', user.id)
            .single();

        if (shop) {
            shopName = shop.name || 'Mijn Shop';
            tryonsUsed = shop.tryons_this_month ?? 0;
            tryonsLimit = shop.monthly_tryon_limit ?? 500;
            studioCreditsUsed = shop.studio_credits_used ?? 0;
            studioCreditsLimit = shop.studio_credits_limit ?? 20;
            studioExtraCredits = shop.studio_extra_credits ?? 0;
        }
    }

    return (
        <div className="min-h-screen">
            <Sidebar
                shopName={shopName}
                tryonsUsed={tryonsUsed}
                tryonsLimit={tryonsLimit}
                studioCreditsUsed={studioCreditsUsed}
                studioCreditsLimit={studioCreditsLimit}
                studioExtraCredits={studioExtraCredits}
            />
            {/* Main content: offset for desktop sidebar + mobile top bar */}
            <main className="md:ml-64 bg-[#F8FAFC] min-h-screen pt-[72px] md:pt-0 p-4 md:p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
