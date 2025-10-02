import { createClient } from "@supabase/supabase-js";

export const supabaseService =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE, {
        auth: { persistSession: false },
      })
    : null;
