'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Plus, LayoutGrid, User } from 'lucide-react';
import Logo from '@/components/Logo';
import { clsx } from 'clsx';

export default function SiteHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isLanding = pathname === '/';
  const isGenerate = pathname === '/generate';
  const isDashboard = pathname === '/dashboard';
  const isTemplates = pathname === '/templates';
  const isProfile = pathname === '/profile';

  return (
    <header className="sticky top-0 z-[9999] border-b border-border bg-surface">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-8 py-4 max-md:px-4">
        <Link href="/" className="flex items-center">
          <Logo size={28} />
        </Link>

        <div className="flex items-center gap-6">
          {/* Landing page nav */}
          {isLanding && (
            <nav className="flex gap-6 max-md:hidden">
              <a href="#how" className="text-sm font-medium text-text-secondary transition-colors hover:text-primary">
                How it works
              </a>
            </nav>
          )}

          {/* App nav - Templates + page-specific links */}
          {!isLanding && (
            <nav className="flex items-center gap-4 max-md:hidden">
              <Link
                href="/templates"
                className={clsx(
                  'flex items-center gap-1.5 text-sm font-medium transition-colors',
                  isTemplates ? 'text-primary' : 'text-text-secondary hover:text-primary'
                )}
              >
                <LayoutGrid size={14} />
                Templates
              </Link>
              {isGenerate && (
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-text-secondary transition-colors hover:text-primary"
                >
                  Dashboard
                </Link>
              )}
              {isDashboard && (
                <Link
                  href="/generate"
                  className="flex items-center gap-1.5 rounded-control bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-primary-600 hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
                >
                  <Plus size={16} />
                  Generate
                </Link>
              )}
            </nav>
          )}

          {/* Profile link - when logged in */}
          {session && (
            <Link
              href="/profile"
              className={clsx(
                'flex items-center gap-1.5 rounded-control px-3 py-2 text-sm font-medium transition-colors',
                isProfile
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:text-primary hover:bg-surface-subtle'
              )}
            >
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'Profile'}
                  className="h-6 w-6 rounded-full"
                />
              ) : (
                <User size={16} />
              )}
              <span className="max-md:hidden">Profile</span>
            </Link>
          )}

          {/* Auth button - only on landing when not logged in */}
          {isLanding && !session && (
            <Link
              href="/auth/signin"
              className="rounded-control bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-primary-600 hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
