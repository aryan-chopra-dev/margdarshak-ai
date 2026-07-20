import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ──────────────────────────────────────────────────────────────────
// API Rate Limiter — In-Memory Store
// ──────────────────────────────────────────────────────────────────
interface RateEntry {
  count: number;
  windowStart: number;
}

const ipStore = new Map<string, RateEntry>();

const WINDOW_MS   = 60_000; // 60-second sliding window
const LIMIT_API   = 120;    // Standard API: 120 req/min
const LIMIT_AI    = 20;     // AI endpoints: 20 req/min

// Clean up old entries to prevent memory growth
let lastCleanup = Date.now();
function cleanupStore() {
  if (Date.now() - lastCleanup < 300_000) return;
  const cutoff = Date.now() - WINDOW_MS;
  for (const [key, entry] of ipStore.entries()) {
    if (entry.windowStart < cutoff) ipStore.delete(key);
  }
  lastCleanup = Date.now();
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Rate Limiting for API Routes ────────────────────────────────
  if (pathname.startsWith('/api/')) {
    const isAiEndpoint = pathname.startsWith('/api/chat') ||
                         pathname.startsWith('/api/scholarships') ||
                         pathname.startsWith('/api/analyze');
    const limit = isAiEndpoint ? LIMIT_AI : LIMIT_API;

    // Resolve client IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

    // Dev bypass: localhost is never rate-limited to prevent test throttling
    const isLocalhost = ip === '127.0.0.1' || ip === '::1' || ip === 'unknown';
    if (isLocalhost && process.env.NODE_ENV === 'development') {
      return NextResponse.next();
    }

    cleanupStore();

    const now = Date.now();
    const key = `${ip}:${isAiEndpoint ? 'ai' : 'api'}`;
    const entry = ipStore.get(key);
    const inWindow = entry && (now - entry.windowStart) < WINDOW_MS;

    if (inWindow && entry) {
      if (entry.count >= limit) {
        const resetIn = Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 1000);
        return new NextResponse(
          JSON.stringify({
            error: 'Too Many Requests',
            message: `Rate limit exceeded. Retry after ${resetIn}s.`,
            retryAfter: resetIn,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(resetIn),
              'X-RateLimit-Limit': String(limit),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(Math.ceil((entry.windowStart + WINDOW_MS) / 1000)),
            },
          }
        );
      }
      entry.count++;
      ipStore.set(key, entry);
    } else {
      ipStore.set(key, { count: 1, windowStart: now });
    }

    const remaining = Math.max(0, limit - (ipStore.get(key)?.count || 0));
    const res = NextResponse.next();
    res.headers.set('X-RateLimit-Limit', String(limit));
    res.headers.set('X-RateLimit-Remaining', String(remaining));
    return res;
  }

  // Never intercept static/internal paths
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

