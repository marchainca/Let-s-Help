import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Verifica si existe un token en las cookies
  const token = req.cookies.get('accessToken')?.value;

  // Si NO hay token, redirige a /login
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // De lo contrario, permite el acceso
  return NextResponse.next();
}

// Limita el middleware solo a ciertas rutas
export const config = {
  matcher: ['/dashboard/:path*'],
};
