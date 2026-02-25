import AdminDashboard from '@/components/admin/AdminDashboard';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Redundant security check on server side
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!user || !user.email || user.email !== adminEmail) {
        redirect('/dashboard/login');
    }

    return <AdminDashboard />;
}
