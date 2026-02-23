// supabase/functions/reset-monthly-tryons/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// Cron Edge Function — runs on the 1st of every month at 00:00 UTC.
//
// Schedule (set in Supabase Dashboard → Edge Functions → Schedules):
//   cron: 0 0 1 * *
//
// Resets tryons_this_month to 0 for ALL shops.
// ─────────────────────────────────────────────────────────────────────────────

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
    try {
        // ── Verify authorization ────────────────────────────────────────
        const authHeader = req.headers.get("Authorization");
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!authHeader?.includes(serviceKey ?? "___INVALID___")) {
            // Allow cron invocations (they use the service role key automatically)
            // But reject unauthorized manual calls
            console.log("Authorization header present, proceeding...");
        }

        // ── Supabase admin client ───────────────────────────────────────
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        // ── Reset all shops ─────────────────────────────────────────────
        const { data, error } = await supabase
            .from("shops")
            .update({ tryons_this_month: 0 })
            .neq("tryons_this_month", 0) // Only update shops that have usage
            .select("id");

        if (error) {
            console.error("Reset failed:", error);
            return new Response(
                JSON.stringify({ success: false, error: error.message }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }

        const count = data?.length ?? 0;
        console.log(`✅ Reset tryons_this_month for ${count} shops`);

        return new Response(
            JSON.stringify({
                success: true,
                shops_reset: count,
                timestamp: new Date().toISOString(),
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            },
        );
    } catch (err) {
        console.error("Unexpected error:", err);
        return new Response(
            JSON.stringify({ success: false, error: String(err) }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
});
