import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

/**
 * DELETE /api/auth/delete-account
 * Verwijdert het account van de ingelogde gebruiker + alle gerelateerde data.
 *
 * Flow:
 * 1. User is ingelogd (auth.getUser())
 * 2. Verwijder de shop(s) van de user (cascade zorgt voor rest)
 * 3. Verwijder de auth.user (via admin API)
 * 4. Return success
 */
export async function DELETE(request: Request) {
    try {
        const supabase = await createClient();
        const supabaseAdmin = createAdminClient();

        // Check of user is ingelogd
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Niet geautoriseerd' },
                { status: 401 }
            );
        }

        // Extra beveiliging: vraag om email bevestiging in request body
        const body = await request.json();
        const { confirmEmail } = body;

        if (!confirmEmail || confirmEmail !== user.email) {
            return NextResponse.json(
                { error: 'Email bevestiging komt niet overeen' },
                { status: 400 }
            );
        }

        // Verwijder alle shops van deze user
        // (cascade zorgt dat alle gerelateerde data automatisch wordt verwijderd)
        const { error: shopDeleteError } = await supabaseAdmin
            .from('shops')
            .delete()
            .eq('owner_id', user.id);

        if (shopDeleteError) {
            console.error('Error deleting shops:', shopDeleteError);
            return NextResponse.json(
                { error: 'Fout bij verwijderen van shop data' },
                { status: 500 }
            );
        }

        // Verwijder de auth user (via admin API)
        const { error: userDeleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

        if (userDeleteError) {
            console.error('Error deleting user:', userDeleteError);
            return NextResponse.json(
                { error: 'Fout bij verwijderen van gebruiker' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Account succesvol verwijderd'
        });

    } catch (error: any) {
        console.error('Delete account error:', error);
        return NextResponse.json(
            { error: error.message || 'Er ging iets mis' },
            { status: 500 }
        );
    }
}
