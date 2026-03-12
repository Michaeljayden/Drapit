import { NextResponse } from 'next/server';
import { sendNewMerchantNotification } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            merchantEmail,
            merchantName,
            shopName,
            domain,
            phone,
            plan,
        } = body;

        if (!merchantEmail || !shopName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Send admin notification to info@drapit.io
        await sendNewMerchantNotification({
            merchantEmail,
            merchantName: merchantName || merchantEmail,
            shopName,
            domain: domain || '',
            phone: phone || 'Niet opgegeven',
            plan: plan || 'trial',
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in signup-notify API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
