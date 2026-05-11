'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import {
  LayoutDashboard, Globe, Calculator, Target,
  CalendarDays, Shield, Sparkles, Users, GraduationCap,
  FileCheck, CreditCard, Stamp,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard',    href: '/dashboard',           icon: LayoutDashboard },
  { label: 'Universities', href: '/career-navigator',    icon: Globe },
  { label: 'ROI',          href: '/roi-calculator',      icon: Calculator },
  { label: 'Predictor',    href: '/admission-predictor', icon: Target },
  { label: 'Scholarships', href: '/scholarships',        icon: GraduationCap },
  { label: 'Apply',        href: '/apply',               icon: FileCheck },
  { label: 'Timeline',     href: '/timeline',            icon: CalendarDays },
  { label: 'LRS Score',    href: '/loan-score',          icon: Shield },
  { label: 'Community',    href: '/community',           icon: Users },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isOnboarded, profile, isAuthenticated, lrs, loanApplication } = useAppStore();
  const isPublic = pathname === '/' || pathname === '/login';

  const navItems = [
    { label: 'Dashboard',    href: '/dashboard',           icon: LayoutDashboard },
    { label: 'Universities', href: '/career-navigator',    icon: Globe },
    { label: 'ROI',          href: '/roi-calculator',      icon: Calculator },
    { label: 'Predictor',    href: '/admission-predictor', icon: Target },
    { label: 'Scholarships', href: '/scholarships',        icon: GraduationCap },
    { label: 'Apply',        href: '/apply',               icon: FileCheck },
    { label: 'Visa',         href: '/visa',                icon: Stamp },
    { label: 'Timeline',     href: '/timeline',            icon: CalendarDays },
    { label: 'LRS Score',    href: '/loan-score',          icon: Shield },
    { label: 'Community',    href: '/community',           icon: Users },
    // Only surface Repayment once the user has an active loan
    ...(loanApplication?.submitted
      ? [{ label: 'Repayment', href: '/repayment', icon: CreditCard }]
      : []),
  ];

  useEffect(() => {
    if (isAuthenticated && profile?.email && lrs?.score) {
      // Silently sync LRS score to Supabase whenever it changes (e.g. from engagement gamification)
      fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile.email, lrsScore: lrs.score })
      }).catch(console.error);
    }
  }, [lrs?.score, isAuthenticated, profile?.email]);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* Logo */}
      <Link href="/" style={{
        display: 'flex', alignItems: 'center', gap: 9,
        textDecoration: 'none', flexShrink: 0,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9,
          background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(99,102,241,0.40)',
          fontSize: 15, fontWeight: 800, color: 'white',
          fontFamily: "'Space Grotesk', sans-serif",
        }}>M</div>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700, fontSize: 15,
          color: 'var(--heading)', letterSpacing: '-0.01em',
        }}>
          Margdarshak<span style={{ color: 'var(--primary)' }}> AI</span>
        </span>
      </Link>

      {/* Desktop Links */}
      <div style={{ display: 'flex', gap: 20 }}>
        {navItems.map(item => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.label} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, fontWeight: active ? 600 : 500,
              color: active ? 'var(--primary)' : 'var(--text-secondary)',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}>
              <Icon size={14} style={{ opacity: active ? 1 : 0.6 }} />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Right Side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <ThemeToggle />

        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 12px 4px 8px',
              background: 'var(--primary-bg)',
              border: '1px solid var(--primary-border)',
              borderRadius: 'var(--radius-full)',
              fontSize: 12, fontWeight: 700, color: 'var(--primary-light)',
            }}>
              <Shield size={12} />
              LRS {lrs?.score ?? '—'}
            </div>
            {/* Avatar */}
            <Link href="/profile" style={{ textDecoration: 'none' }}>
              <button style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: 'white',
                cursor: 'pointer',
                border: 'none',
                boxShadow: '0 0 0 2px rgba(99,102,241,0.3)',
              }}>
                {(profile?.name?.charAt(0)?.toUpperCase()) || 'U'}
              </button>
            </Link>
            {/* Logout Button */}
            <button 
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                useAppStore.getState().logout();
                window.location.href = '/login';
              }}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)',
                padding: '4px 8px'
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <Link href="/login" style={{
              fontSize: 13, fontWeight: 500,
              color: 'var(--text-secondary)',
              textDecoration: 'none', padding: '6px 12px',
            }}>
              Sign in
            </Link>
            <Link href="/login" className="btn-primary" style={{ padding: '7px 16px', fontSize: 13 }}>
              <Sparkles size={13} />
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
