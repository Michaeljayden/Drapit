// =============================================================================
// Drapit Studio Gallery — Server page wrapper
// =============================================================================

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import GalleryPage from '@/components/studio/GalleryPage';

export const metadata = {
  title: 'Galerij — Drapit Studio',
  description: 'Bekijk en beheer je opgeslagen Studio foto\'s',
};

export default async function GalleryPageRoute() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/dashboard/login');
  }

  const { data: shop } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  const shopId = shop?.id ?? '';

  return <GalleryPage shopId={shopId} />;
}
