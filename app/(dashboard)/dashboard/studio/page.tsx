// =============================================================================
// Drapit Studio — Server page wrapper
// =============================================================================
// Fetches shop data server-side, passes to client component.
// =============================================================================

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import StudioPage from '@/components/studio/StudioPage';

export const metadata = {
  title: 'Drapit Studio',
  description: 'AI-productfotografie voor jouw Shopify store',
};

export default async function StudioPageRoute() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/dashboard/login');
  }

  // Fetch shop data incl. Studio subscription & credits
  const { data: shop } = await supabase
    .from('shops')
    .select('id, has_studio, studio_credits_used, studio_credits_limit')
    .eq('owner_id', user.id)
    .single();

  const shopId = shop?.id ?? '';
  // Admin always has full Studio access with unlimited credits
  const isAdmin = user.email === process.env.ADMIN_EMAIL;
  const hasStudio = isAdmin ? true : !!(shop?.has_studio);
  const creditsUsed = isAdmin ? 0 : ((shop?.studio_credits_used as number) ?? 0);
  const creditsLimit = isAdmin ? 99999 : ((shop?.studio_credits_limit as number) ?? 20);

  return (
    <StudioPage
      shopId={shopId}
      hasStudio={hasStudio}
      creditsUsed={creditsUsed}
      creditsLimit={creditsLimit}
    />
  );
}
