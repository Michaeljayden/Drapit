import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function PATCH(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Destructure only the fields we want to allow updating
        const {
            name,
            domain,
            phone,
            contact_person,
            company_name,
            kvk_number,
            vat_number,
            address,
            postal_code,
            city,
            country,
        } = body;

        // Basic validation
        if (!name || name.trim().length === 0) {
            return NextResponse.json({ error: 'Shopnaam is verplicht' }, { status: 400 });
        }

        // Use service role to bypass RLS for UPDATE if needed, 
        // but typically the owner should have permission to update their own shop.
        // Let's try regular client first, if it fails due to RLS we'll use service client.

        const { error: updateError } = await supabase
            .from('shops')
            .update({
                name: name.trim(),
                domain: domain?.trim() || null,
                phone: phone?.trim() || null,
                contact_person: contact_person?.trim() || null,
                company_name: company_name?.trim() || null,
                kvk_number: kvk_number?.trim() || null,
                vat_number: vat_number?.trim() || null,
                address: address?.trim() || null,
                postal_code: postal_code?.trim() || null,
                city: city?.trim() || null,
                country: country?.trim() || 'Nederland',
            })
            .eq('owner_id', user.id);

        if (updateError) {
            console.error('[api/shops/update] Update error:', updateError);

            // If it's a permission error, try service client
            if (updateError.code === '42501' || updateError.message.includes('permission')) {
                const serviceClient = createServiceClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY!
                );

                const { error: serviceUpdateError } = await serviceClient
                    .from('shops')
                    .update({
                        name: name.trim(),
                        domain: domain?.trim() || null,
                        phone: phone?.trim() || null,
                        contact_person: contact_person?.trim() || null,
                        company_name: company_name?.trim() || null,
                        kvk_number: kvk_number?.trim() || null,
                        vat_number: vat_number?.trim() || null,
                        address: address?.trim() || null,
                        postal_code: postal_code?.trim() || null,
                        city: city?.trim() || null,
                        country: country?.trim() || 'Nederland',
                    })
                    .eq('owner_id', user.id);

                if (serviceUpdateError) {
                    throw new Error('Kon shopgegevens niet bijwerken via service role');
                }
            } else {
                throw new Error('Kon shopgegevens niet bijwerken');
            }
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('[api/shops/update] Catch error:', err);
        return NextResponse.json({ error: err.message || 'Interne serverfout' }, { status: 500 });
    }
}
