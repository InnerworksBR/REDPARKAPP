import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('sb-access-token')?.value;
  const { pathname } = request.nextUrl;

  // Definição das rotas protegidas
  const isMensalistaRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/pagamento') || 
    pathname.startsWith('/checkin');
  
  const isAdminRoute = pathname.startsWith('/admin');

  if (isMensalistaRoute || isAdminRoute) {
    // 1. Se não houver token, redireciona diretamente para o login
    if (!token) {
      return NextResponse.redirect(new URL('/clientes/login', request.url));
    }

    // 2. Inicializar cliente do Supabase na Edge para verificar validade do token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    });

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      // Token inválido ou expirado -> Limpa o cookie e redireciona
      const response = NextResponse.redirect(new URL('/clientes/login', request.url));
      response.cookies.delete('sb-access-token');
      return response;
    }

    // 3. Buscar perfil na tabela pública para validação de privilégios (role)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) {
      const response = NextResponse.redirect(new URL('/clientes/login', request.url));
      response.cookies.delete('sb-access-token');
      return response;
    }

    // 4. Controle de Acesso Baseado em Perfis (RBAC)
    
    // Mensalista tentando acessar a área de Admin
    if (isAdminRoute && profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Admin tentando acessar a área de Mensalista
    if (isMensalistaRoute && profile.role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/pagamento/:path*',
    '/checkin/:path*',
    '/admin/:path*',
  ],
};
