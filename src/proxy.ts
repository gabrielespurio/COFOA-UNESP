import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development-only';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken = request.cookies.get('session_token')?.value;
  let decodedToken = null;

  if (sessionToken) {
    try {
      const { payload } = await jwtVerify(sessionToken, encodedSecret, {
        algorithms: ['HS256'],
      });
      decodedToken = payload;
    } catch (error) {
      // Token is invalid or expired
    }
  }

  // Protect participant routes
  if (pathname.startsWith('/area-participante')) {
    if (!decodedToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!decodedToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(loginUrl);
    }

    if (decodedToken.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/area-participante/:path*', '/admin/:path*'],
};
