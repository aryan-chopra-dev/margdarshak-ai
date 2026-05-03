import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never intercept static/internal paths
  if (pathname.startsWith('/_next') || pathname.startsWith('/api/') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Check for session cookie — set by verify-otp API after successful auth
  const hasSession = request.cookies.has('user-info') || request.cookies.has('auth-token');

  // Routes that are always public (no auth required)
  const isPublicPath = pathname === '/' || pathname === '/login';

  // Routes that require auth but not completed onboarding
  const isAuthOnlyPath = pathname === '/onboarding';

  // Unauthenticated user trying to access a protected route → send to login
  if (!isPublicPath && !isAuthOnlyPath && !hasSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Unauthenticated user trying to access /onboarding → send to login
  if (isAuthOnlyPath && !hasSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // NOTE: We do NOT redirect authenticated /login users here —
  // the client-side AuthGuard.tsx handles that because it has access
  // to Zustand state (isOnboarded) which the server cannot read.

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
