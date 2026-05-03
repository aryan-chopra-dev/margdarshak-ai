'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';

/**
 * AuthGuard handles ONE specific client-side case:
 * An already-authenticated user visits /login → skip to onboarding or dashboard.
 * 
 * All other auth routing (protecting /dashboard, /onboarding, etc.) is handled
 * by the server-side middleware at src/middleware.ts which checks the session cookie.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const isOnboarded = useAppStore((s) => s.isOnboarded);
  const isHydrated = useAppStore((s) => s.isHydrated);

  const LoadingScreen = () => (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid rgba(99, 102, 241, 0.2)',
        borderTop: '3px solid #6366F1',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  useEffect(() => {
    // Only care about the /login page: if already authed, skip ahead
    if (isHydrated && pathname === '/login' && isAuthenticated) {
      router.replace(isOnboarded ? '/dashboard' : '/onboarding');
    }
  }, [pathname, isAuthenticated, isOnboarded, router, isHydrated]);

  if (!isHydrated) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
