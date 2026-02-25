import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import OnboardingForm from '@/components/dashboard/OnboardingForm';

export default async function OnboardingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/dashboard/login');
    }

    // If user already has a shop, send them to the dashboard
    const { data: shop } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id)
        .single();

    if (shop) {
        redirect('/dashboard');
    }

    return <OnboardingForm
        email={user.email || ''}
        initialData={{
            shopName: user.user_metadata?.full_name
        }}
    />;
}
