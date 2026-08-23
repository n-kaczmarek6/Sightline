import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// NUR serverseitig verwenden (Route Handler etc.) — der Service-Role-Key
// hebelt RLS komplett aus und darf nie ins Browser-Bundle gelangen.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
