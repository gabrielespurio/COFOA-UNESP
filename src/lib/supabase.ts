import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// We use the anon key for public operations, but for secure server-side operations 
// like uploading bypassing RLS, we can optionally use the service role key.
// But for now, we'll initialize the basic client.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getSupabaseAdmin = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined");
  }
  return createClient(supabaseUrl, serviceRoleKey);
}
