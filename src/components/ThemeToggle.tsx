'use client';
import { useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function ThemeToggle() {
  const { theme, setTheme } = useAppStore();

  // Apply class to <html> on mount and change
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      style={{
        width: 36, height: 36,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-strong)',
        cursor: 'pointer',
        transition: 'background 0.2s, border-color 0.2s',
        flexShrink: 0,
        color: 'var(--text-secondary)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-border)';
        (e.currentTarget as HTMLElement).style.color = 'var(--primary)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)';
        (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
      }}
    >
      {theme === 'dark'
        ? <Sun size={16} />
        : <Moon size={16} />
      }
    </button>
  );
}
