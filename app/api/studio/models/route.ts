import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const UploadSchema = z.object({
    name: z.string().min(1).max(50),
    image: z.string(), // base64
});

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });
        }

        const { data: models, error } = await supabase
            .from('custom_models')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ models });
    } catch (err) {
        console.error('[api/studio/models] GET error:', err);
        return NextResponse.json({ error: 'Fout bij ophalen modellen.' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });
        }

        const body = await req.json();
        const parsed = UploadSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Ongeldige data.' }, { status: 400 });
        }

        const { name, image } = parsed.data;

        // Get shop_id
        const { data: shop } = await supabase
            .from('shops')
            .select('id')
            .eq('owner_id', user.id)
            .single();

        if (!shop) {
            return NextResponse.json({ error: 'Shop niet gevonden.' }, { status: 404 });
        }

        // 1. Convert base64 to buffer
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // 2. Upload to Supabase Storage
        const fileName = `${user.id}/${Date.now()}-${name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
        const { data: storageData, error: storageError } = await supabase.storage
            .from('custom_models')
            .upload(fileName, buffer, {
                contentType: 'image/jpeg',
                upsert: true,
            });

        if (storageError) {
            return NextResponse.json({ error: `Storage fout: ${storageError.message}` }, { status: 500 });
        }

        // 3. Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('custom_models')
            .getPublicUrl(fileName);

        // 4. Record in database
        const { data: model, error: dbError } = await supabase
            .from('custom_models')
            .insert({
                name,
                image_url: publicUrl,
                shop_id: shop.id,
                owner_id: user.id,
            })
            .select()
            .single();

        if (dbError) {
            return NextResponse.json({ error: `Database fout: ${dbError.message}` }, { status: 500 });
        }

        return NextResponse.json({ model });
    } catch (err) {
        console.error('[api/studio/models] POST error:', err);
        return NextResponse.json({ error: 'Fout bij uploaden model.' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID ontbreekt.' }, { status: 400 });
        }

        // Get model to find storage path
        const { data: model } = await supabase
            .from('custom_models')
            .select('image_url')
            .eq('id', id)
            .eq('owner_id', user.id)
            .single();

        if (!model) {
            return NextResponse.json({ error: 'Model niet gevonden.' }, { status: 404 });
        }

        // Delete from DB (RLS will handle auth)
        const { error: dbError } = await supabase
            .from('custom_models')
            .delete()
            .eq('id', id);

        if (dbError) {
            return NextResponse.json({ error: dbError.message }, { status: 500 });
        }

        // Optionally delete from storage too (parse path from image_url)
        // For now we just delete the DB record to quickly free up the UI

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[api/studio/models] DELETE error:', err);
        return NextResponse.json({ error: 'Fout bij verwijderen model.' }, { status: 500 });
    }
}
