'use client';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { usePathname } from 'next/navigation';
import {
  Home, LayoutDashboard, Globe, Calculator, Target,
  CalendarDays, Shield, Sparkles, Users, CreditCard, BarChart
} from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Career Navigator', href: '/career-navigator', icon: Globe },
  { label: 'ROI Calculator', href: '/roi-calculator', icon: Calculator },
  { label: 'Admit Predictor', href: '/admission-predictor', icon: Target },
  { label: 'Timeline', href: '/timeline', icon: CalendarDays },
  { label: 'Scholarships', href: '/scholarships', icon: Globe },
  { label: 'Marketplace', href: '/marketplace', icon: Shield },
  { label: 'Community', href: '/community', icon: Users },
  { label: 'Repayment', href: '/repayment', icon: CreditCard },
  { label: 'B2B Admin', href: '/admin/monetization', icon: BarChart },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isOnboarded, profile } = useAppStore();

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px',
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* Logo */}
      <Link href="/" style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16,
        color: 'var(--text)', textDecoration: 'none',
      }}>
        <span style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'var(--primary)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 14, color: 'white',
        }}>M</span>
        Margdarshak
      </Link>

      {/* Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {navItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 'var(--radius-md)',
              fontSize: 13, fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              background: isActive ? 'var(--primary-bg)' : 'transparent',
              textDecoration: 'none',
              transition: 'color 0.15s, background 0.15s',
            }}>
              <item.icon size={14} />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* CTA / User Profile */}
      {isOnboarded ? (
         <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
               width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-bg)', 
               border: '1px solid var(--primary-border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
               fontSize: 14, fontWeight: 700, color: 'var(--primary)'
            }}>
               {(profile?.name?.charAt(0)?.toUpperCase()) || 'U'}
            </div>
         </div>
      ) : (
         <Link href="/onboarding" className="btn-primary" style={{ padding: '7px 18px', fontSize: 13 }}>
            <Sparkles size={14} /> Get Started
         </Link>
      )}
    </nav>
  );
}
