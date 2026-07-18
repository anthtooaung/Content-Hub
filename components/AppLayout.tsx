'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Sparkles,
  LayoutGrid,
  FileText,
  Settings,
  Plus,
  Menu,
  X,
  BarChart3,
  Ticket,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';
import Logo from '@/components/Logo';

const navSections = [
  {
    label: 'Create',
    items: [
      { href: '/generate', label: 'Generate', icon: Sparkles },
    ],
  },
  {
    label: 'Library',
    items: [
      { href: '/templates', label: 'Templates', icon: LayoutGrid },
      { href: '/dashboard', label: 'Dashboard', icon: FileText },
      { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [ticketBalance, setTicketBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!session) return;
    fetch('/api/tickets')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setTicketBalance(data.balance);
      })
      .catch(() => {});
  }, [session]);

  const isActive = (href: string) => {
    if (href === '#') return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen bg-page">
      {/* Top Header Strip */}
      <header className="sticky top-0 z-[9999] border-b border-border bg-surface px-6 h-14 flex items-center justify-between max-md:px-4">
        {/* Mobile hamburger */}
        <button
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-control text-text-secondary transition-colors hover:bg-surface-subtle"
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu size={20} />
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Logo size={24} showWordmark={true} />
        </Link>

        {/* Right side: ticket badge + avatar */}
        <div className="flex items-center gap-3">
          {session && ticketBalance !== null && (
            <div
              className={clsx(
                'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
                ticketBalance <= 0
                  ? 'border-border bg-surface-subtle text-text-muted'
                  : ticketBalance < 6
                  ? 'border-error/30 bg-error-soft text-error'
                  : ticketBalance < 9
                  ? 'border-warning-border bg-warning-soft text-warning'
                  : 'border-primary-200 bg-primary-50 text-primary'
              )}
              title="Tickets reset daily at midnight"
            >
              <Ticket size={14} />
              {ticketBalance} ticket{ticketBalance !== 1 ? 's' : ''}
            </div>
          )}

          {/* Avatar */}
          <Link
            href="/profile"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary cursor-pointer hover:bg-primary-100 transition-colors"
          >
            {session?.user?.name
              ? session.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
              : 'U'}
          </Link>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-56px)]">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-surface p-6 sticky top-14 h-[calc(100vh-56px)]">
          {navSections.map((section) => (
            <div key={section.label} className="mb-2">
              <div className="px-4 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                {section.label}
              </div>
              {section.items.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-2.5 rounded-control text-sm font-medium transition-all',
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary'
                      : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
                  )}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
            </div>
          ))}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Settings */}
          <Link
            href="/settings"
            className={clsx(
              'flex items-center gap-3 px-4 py-2.5 rounded-control text-sm font-medium transition-all',
              isActive('/settings')
                ? 'bg-primary-50 text-primary'
                : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
            )}
          >
            <Settings size={18} />
            Settings
          </Link>
        </aside>

        {/* Mobile Nav Overlay */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-[200] md:hidden">
            <div
              className="absolute inset-0 bg-black/30 transition-opacity"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-surface shadow-modal p-6 flex flex-col animate-[modalIn_0.225s_ease]">
              <div className="flex justify-between items-center mb-6">
                <Link
                  href="/"
                  className="flex items-center"
                  onClick={() => setMobileNavOpen(false)}
                >
                  <Logo size={20} showWordmark={true} />
                </Link>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-control text-text-muted hover:bg-surface-subtle transition-colors"
                  onClick={() => setMobileNavOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              {navSections.map((section) => (
                <div key={section.label} className="mb-2">
                  <div className="px-4 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                    {section.label}
                  </div>
                  {section.items.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={clsx(
                        'flex items-center gap-3 px-4 py-2.5 rounded-control text-sm font-medium transition-all',
                        isActive(item.href)
                          ? 'bg-primary-50 text-primary'
                          : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
                      )}
                      onClick={() => setMobileNavOpen(false)}
                    >
                      <item.icon size={18} />
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}

              <div className="flex-1" />
              <Link
                href="/settings"
                className={clsx(
                  'flex items-center gap-3 px-4 py-2.5 rounded-control text-sm font-medium transition-all',
                  isActive('/settings')
                    ? 'bg-primary-50 text-primary'
                    : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
                )}
                onClick={() => setMobileNavOpen(false)}
              >
                <Settings size={18} />
                Settings
              </Link>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface flex justify-around py-2 pb-5">
        <Link
          href="/generate"
          className={clsx(
            'flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors',
            isActive('/generate') ? 'text-primary' : 'text-text-muted'
          )}
        >
          <Sparkles size={20} />
          Generate
        </Link>
        <Link
          href="/templates"
          className={clsx(
            'flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors',
            isActive('/templates') ? 'text-primary' : 'text-text-muted'
          )}
        >
          <LayoutGrid size={20} />
          Templates
        </Link>
        <Link
          href="/dashboard"
          className={clsx(
            'flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors',
            isActive('/dashboard') ? 'text-primary' : 'text-text-muted'
          )}
        >
          <FileText size={20} />
          Dashboard
        </Link>
      </nav>
    </div>
  );
}
