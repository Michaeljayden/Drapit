import { createClient } from '@/lib/supabase/server';
import ApiKeysManager from '@/components/dashboard/ApiKeysManager';

export default async function ApiKeysPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch shop
    const { data: shop } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id)
        .single();

    const shopId = shop?.id || '';

    // Fetch API keys
    const { data: keys } = shopId
        ? await supabase
            .from('api_keys')
            .select('id, key_prefix, name, is_active, created_at')
            .eq('shop_id', shopId)
            .order('created_at', { ascending: false })
        : { data: [] };

    const apiKeys = (keys || []).map((k: { id: string; key_prefix: string; name: string | null; is_active: boolean; created_at: string }) => ({
        id: k.id,
        keyPreview: k.key_prefix + '••••••••••••••••',
        name: k.name || 'API Key',
        isActive: k.is_active,
        createdAt: k.created_at,
    }));

    return (
        <div className="space-y-6 max-w-[900px]">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#0F172A]">API-sleutels</h1>
                <p className="text-sm text-[#64748B] mt-1">
                    Beheer je API-sleutels om de widget en API te authenticeren.
                </p>
            </div>

            <ApiKeysManager initialKeys={apiKeys} shopId={shopId} />
        </div>
    );
}
