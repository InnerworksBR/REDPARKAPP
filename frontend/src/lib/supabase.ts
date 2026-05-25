import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Sincronização automática da sessão com Cookies no lado do cliente
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      const maxAge = 60 * 60 * 24 * 7; // 1 semana
      document.cookie = `sb-access-token=${session?.access_token}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
    } else if (event === 'SIGNED_OUT') {
      // Remove o cookie ao fazer logout
      document.cookie = 'sb-access-token=; path=/; max-age=0; SameSite=Lax; Secure';
    }
  });
}

