import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Check for session token in cookies
  const token = request.cookies.get('next-auth.session-token') || 
                 request.cookies.get('__Secure-next-auth.session-token');


  // Get session from NextAuth
  const sessionUrl = new URL('/api/auth/session', request.url);
  const sessionRes = await fetch(sessionUrl, {
    headers: {
      cookie: `next-auth.session-token=${token?.value || ''}`,
    },
  });
  const session = sessionRes.ok ? await sessionRes.json() : null;

  // Protected routes
  const protectedRoutes = ['/generate', '/products', '/credits'];
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if(isProtectedRoute && !session?.user?.phoneVerified) {
    const verifyPhoneUrl = new URL('/verify-phone', request.url);
    verifyPhoneUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(verifyPhoneUrl);
  }

  // Redirect authenticated users away from auth pages
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/generate', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/generate/:path*',
    '/products/:path*',
    '/credits/:path*',
    '/login',
    '/register',
  ],
};
