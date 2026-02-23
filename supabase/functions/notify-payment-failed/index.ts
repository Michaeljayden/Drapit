// supabase/functions/notify-payment-failed/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// Called by the Stripe webhook when invoice.payment_failed fires.
// Looks up the shop owner and logs / sends a notification.
// ─────────────────────────────────────────────────────────────────────────────

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface PaymentFailedPayload {
    stripe_customer_id: string;
    invoice_id: string;
    amount_due: number;
    currency: string;
    attempt_count: number;
}

Deno.serve(async (req: Request) => {
    try {
        // ── Parse body ──────────────────────────────────────────────────
        const body: PaymentFailedPayload = await req.json();
        const { stripe_customer_id, invoice_id, amount_due, currency, attempt_count } = body;

        if (!stripe_customer_id) {
            return new Response(
                JSON.stringify({ error: "stripe_customer_id is required" }),
                { status: 400, headers: { "Content-Type": "application/json" } },
            );
        }

        // ── Supabase admin client ───────────────────────────────────────
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        // ── Find shop + owner ───────────────────────────────────────────
        const { data: shop, error: shopErr } = await supabase
            .from("shops")
            .select("id, name, email, owner_id")
            .eq("stripe_customer_id", stripe_customer_id)
            .single();

        if (shopErr || !shop) {
            console.warn(`Shop not found for customer ${stripe_customer_id}`);
            return new Response(
                JSON.stringify({ error: "Shop not found" }),
                { status: 404, headers: { "Content-Type": "application/json" } },
            );
        }

        // ── Log the event ───────────────────────────────────────────────
        const amountFormatted = new Intl.NumberFormat("nl-NL", {
            style: "currency",
            currency: currency || "EUR",
        }).format((amount_due || 0) / 100);

        console.log(
            `⚠️ Payment failed for shop "${shop.name}" (${shop.email})\n` +
            `   Invoice: ${invoice_id}\n` +
            `   Amount: ${amountFormatted}\n` +
            `   Attempt: ${attempt_count}`,
        );

        // ──────────────────────────────────────────────────────────────────
        // TODO: Add actual notification delivery here, e.g.:
        //   - Send email via Resend/Postmark/SendGrid
        //   - Push to Slack channel
        //   - Insert into a `notifications` table for in-app display
        //
        // Example with Resend:
        //   await fetch("https://api.resend.com/emails", {
        //       method: "POST",
        //       headers: {
        //           "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        //           "Content-Type": "application/json",
        //       },
        //       body: JSON.stringify({
        //           from: "Drapit <billing@drapit.io>",
        //           to: [shop.email],
        //           subject: "Betaling mislukt — Drapit",
        //           html: `<p>Hi ${shop.name}, je betaling van ${amountFormatted} is mislukt. ...</p>`,
        //       }),
        //   });
        // ──────────────────────────────────────────────────────────────────

        return new Response(
            JSON.stringify({
                success: true,
                shop_id: shop.id,
                message: `Notification logged for ${shop.email}`,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
        );
    } catch (err) {
        console.error("Unexpected error:", err);
        return new Response(
            JSON.stringify({ success: false, error: String(err) }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        );
    }
});
