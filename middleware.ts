import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Pega o pathname atual
  const { pathname } = request.nextUrl;

  // Verifica se está tentando acessar o dashboard
  if (pathname.startsWith('/dashboard')) {
    // Aqui você pode adicionar lógica mais complexa de verificação
    // Por enquanto, vamos apenas permitir o acesso
    // A proteção real acontece no AuthContext
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};