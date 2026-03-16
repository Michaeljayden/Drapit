import { NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { PLANS } from '@/lib/stripe';
import { sendWelcomeEmail, sendNewMerchantNotification } from '@/lib/email';
import type { Plan } from '@/lib/supabase/types';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            email,
            password,
            shopName,
            domain,
            phone,
            contactPerson,
            companyName,
            kvkNumber,
            vatNumber,
            address,
            postalCode,
            city,
            country,
        } = body;

        // Validatie
        if (!email || !password || !shopName || !phone || !domain) {
            return NextResponse.json(
                { error: 'Vul alle verplichte velden in' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Wachtwoord moet minimaal 6 tekens zijn' },
                { status: 400 }
            );
        }

        const serviceClient = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Maak user aan via Admin API (bypass Supabase SMTP)
        const { data: userData, error: createError } = await serviceClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: contactPerson || shopName,
            },
        });

        if (createError) {
            // Duplicate email
            if (createError.message.includes('already been registered') || createError.message.includes('already exists')) {
                return NextResponse.json(
                    { error: 'Dit e-mailadres is al geregistreerd' },
                    { status: 409 }
                );
            }
            console.error('[signup] Create user error:', createError.message);
            return NextResponse.json(
                { error: 'Kon account niet aanmaken. Probeer het opnieuw.' },
                { status: 500 }
            );
        }

        const user = userData.user;

        // 2. Maak shop aan
        const selectedPlan: Plan = 'trial';
        const planConfig = PLANS[selectedPlan];

        const { data: shop, error: shopError } = await serviceClient
            .from('shops')
            .insert({
                name: shopName.trim(),
                email: user.email!,
                owner_id: user.id,
                domain: domain?.trim() || null,
                plan: selectedPlan,
                monthly_tryon_limit: planConfig.limit,
                phone: phone?.trim() || null,
                contact_person: contactPerson?.trim() || null,
                company_name: companyName?.trim() || null,
                kvk_number: kvkNumber?.trim() || null,
                vat_number: vatNumber?.trim() || null,
                address: address?.trim() || null,
                postal_code: postalCode?.trim() || null,
                city: city?.trim() || null,
                country: country?.trim() || 'Nederland',
            })
            .select('id')
            .single();

        if (shopError) {
            console.error('[signup] Create shop error:', shopError.message);
            // Verwijder user als shop niet aangemaakt kan worden
            await serviceClient.auth.admin.deleteUser(user.id);
            return NextResponse.json(
                { error: 'Kon shop niet aanmaken. Probeer het opnieuw.' },
                { status: 500 }
            );
        }

        // 3. Stuur welkomstmail naar merchant via EmailJS (fire-and-forget)
        sendWelcomeEmail(user.email!, shopName.trim()).catch((err) =>
            console.error('[signup] Welcome email failed:', err)
        );

        // 4. Stuur admin notificatie via EmailJS (fire-and-forget)
        sendNewMerchantNotification({
            merchantEmail: email,
            merchantName: contactPerson || shopName,
            shopName,
            domain,
            phone,
            plan: selectedPlan,
        }).catch((err) =>
            console.error('[signup] Admin notification failed:', err)
        );

        return NextResponse.json({
            success: true,
            shopId: shop.id,
        });
    } catch (error) {
        console.error('[signup] Unexpected error:', error);
        return NextResponse.json(
            { error: 'Er ging iets mis. Probeer het opnieuw.' },
            { status: 500 }
        );
    }
}
