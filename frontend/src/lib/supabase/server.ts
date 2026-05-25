import { createClient } from "@supabase/supabase-js";

// Utiliza a chave de serviço (Service Role Key) ou Anon Key de forma segura no backend
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// O supabaseAdmin deve ser usado SOMENTE em rotas de API (Server-side).
// Ele possui permissão para ignorar o RLS caso a chave SUPABASE_SERVICE_ROLE_KEY esteja configurada.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
