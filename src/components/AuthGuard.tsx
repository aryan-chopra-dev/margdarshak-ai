'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Protect all core routes; only allow landing page and login page without auth
    const isPublicRoute = pathname === '/' || pathname === '/login';
    
    if (!isAuthenticated && !isPublicRoute) {
      router.push('/login');
    }
  }, [isAuthenticated, pathname, mounted, router]);

  // Prevent hydration mismatch flashes by not rendering children until mounted
  if (!mounted) {
    return <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }} />;
  }

  // If they are on a protected route and not authenticated, we render nothing while it redirects
  const isPublicRoute = pathname === '/' || pathname === '/login';
  if (!isAuthenticated && !isPublicRoute) {
    return <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }} />;
  }

  return <>{children}</>;
}
