import { createClient } from '@/lib/supabase/server';
import SettingsClient from '@/components/dashboard/SettingsClient';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch shop data
    const { data: shop } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', user.id)
        .single();

    if (!shop) {
        // Handle case where user has no shop - maybe redirect to onboarding?
        // But dashboard layout usually handles basic checks.
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-gray-500 italic">Geen shopgegevens gevonden.</p>
            </div>
        );
    }

    // Fetch API keys
    const { data: keys } = await supabase
        .from('api_keys')
        .select('id, key_prefix, name, is_active, created_at')
        .eq('shop_id', shop.id)
        .order('created_at', { ascending: false });

    const apiKeys = (keys || []).map(k => ({
        id: k.id,
        keyPreview: k.key_prefix + '••••••••••••••••',
        name: k.name || 'API Key',
        isActive: k.is_active,
        createdAt: k.created_at,
    }));

    return (
        <SettingsClient
            shop={shop}
            initialApiKeys={apiKeys}
        />
    );
}
