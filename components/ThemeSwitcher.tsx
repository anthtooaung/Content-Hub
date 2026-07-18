'use client';

import { useRef, useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { clsx } from 'clsx';
import { useTheme } from '@/components/ThemeProvider';

const themes = [
  { id: 'light' as const, label: 'Light', icon: Sun, desc: 'Default' },
  { id: 'dark' as const, label: 'Dark', icon: Moon, desc: 'Easy on eyes' },
  { id: 'system' as const, label: 'System', icon: Monitor, desc: 'Match OS' },
];

export default function ThemeSwitcher() {
  const { theme: activeTheme, setTheme: setActiveTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });

  // Update pill position when active theme changes
  useEffect(() => {
    const idx = themes.findIndex((t) => t.id === activeTheme);
    const btn = buttonRefs.current[idx];
    const container = containerRef.current;
    if (btn && container) {
      const containerRect = container.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      setPillStyle({
        left: btnRect.left - containerRect.left,
        width: btnRect.width,
      });
    }
  }, [activeTheme]);

  // Recalculate on resize
  useEffect(() => {
    const handleResize = () => {
      const idx = themes.findIndex((t) => t.id === activeTheme);
      const btn = buttonRefs.current[idx];
      const container = containerRef.current;
      if (btn && container) {
        const containerRect = container.getBoundingClientRect();
        const btnRect = btn.getBoundingClientRect();
        setPillStyle({
          left: btnRect.left - containerRect.left,
          width: btnRect.width,
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTheme]);

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className={clsx(
          'relative flex rounded-2xl p-1',
          // Glassmorphism container
          'bg-white/60 dark:bg-white/10',
          'backdrop-blur-xl',
          'border border-white/40 dark:border-white/10',
          'shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.3)]',
          // Responsive: row on desktop, stacked on mobile
          'flex-row max-sm:flex-col max-sm:gap-1'
        )}
      >
        {/* Sliding pill indicator — hidden on mobile */}
        <div
          className="hidden max-sm:hidden sm:block absolute top-1 h-[calc(100%-8px)] rounded-xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            left: pillStyle.left,
            width: pillStyle.width,
          }}
        >
          <div className="h-full w-full rounded-xl bg-gradient-to-b from-white/90 to-white/60 dark:from-white/15 dark:to-white/5 shadow-[0_1px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_8px_rgba(0,0,0,0.4)] border border-white/60 dark:border-white/10" />
        </div>

        {themes.map((theme, i) => {
          const isActive = activeTheme === theme.id;
          const Icon = theme.icon;

          return (
            <button
              key={theme.id}
              ref={(el) => { buttonRefs.current[i] = el; }}
              onClick={() => setActiveTheme(theme.id)}
              className={clsx(
                'relative z-10 flex-1 flex flex-col items-center gap-0.5 rounded-xl py-2.5 px-3',
                'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
                'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                // Mobile: active gets solid background
                'sm:cursor-pointer',
                isActive
                  ? 'sm:bg-transparent text-primary'
                  : 'sm:bg-transparent text-text-muted hover:text-text-secondary',
                // Mobile-specific styles
                'max-sm:bg-transparent max-sm:hover:bg-transparent',
                isActive && 'max-sm:bg-primary/10'
              )}
            >
              <Icon
                size={20}
                className={clsx(
                  'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
                  isActive
                    ? 'scale-110 text-primary drop-shadow-[0_0_6px_rgba(var(--color-primary-rgb),0.3)]'
                    : 'scale-100'
                )}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              <span className={clsx(
                'text-[13px] font-semibold leading-tight transition-colors duration-200',
                isActive ? 'text-primary' : 'text-text-primary'
              )}>
                {theme.label}
              </span>
              <span className={clsx(
                'text-[10px] leading-tight transition-colors duration-200',
                isActive ? 'text-primary/70' : 'text-text-muted'
              )}>
                {theme.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
