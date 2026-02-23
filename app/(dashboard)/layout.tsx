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

    if (user) {
        const { data: shop } = await supabase
            .from('shops')
            .select('name, tryons_this_month, monthly_tryon_limit')
            .eq('owner_id', user.id)
            .single();

        if (shop) {
            shopName = shop.name || 'Mijn Shop';
            tryonsUsed = shop.tryons_this_month ?? 0;
            tryonsLimit = shop.monthly_tryon_limit ?? 500;
        }
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar
                shopName={shopName}
                tryonsUsed={tryonsUsed}
                tryonsLimit={tryonsLimit}
            />
            <main className="flex-1 bg-[#F8FAFC] p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
