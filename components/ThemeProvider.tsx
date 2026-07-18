'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  /** Resolved theme after applying system preference */
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  setTheme: () => {},
  resolvedTheme: 'light',
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const resolved = theme === 'system' ? getSystemTheme() : theme;

  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  return resolved as 'light' | 'dark';
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('content-hub-theme') as Theme | null;
    const initial = saved || 'system';
    setThemeState(initial);
    const resolved = applyTheme(initial);
    setResolvedTheme(resolved);
    setMounted(true);
  }, []);

  // Listen for OS theme changes when in system mode
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === 'system') {
        const resolved = applyTheme('system');
        setResolvedTheme(resolved);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    const root = document.documentElement;
    // Enable smooth transitions during theme switch
    root.classList.add('theme-transition');
    setThemeState(newTheme);
    localStorage.setItem('content-hub-theme', newTheme);
    const resolved = applyTheme(newTheme);
    setResolvedTheme(resolved);
    // Remove transition class after animation completes
    setTimeout(() => root.classList.remove('theme-transition'), 250);
  }, []);

  // Prevent flash of wrong theme
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
