import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client with admin privileges (service role key).
 * Use this for server-side operations that bypass RLS policies.
 *
 * SECURITY: Only use in API routes, never expose to client.
 */
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
}
