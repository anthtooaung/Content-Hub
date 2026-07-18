'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

export default function SiteHeader() {
  const pathname = usePathname();
  const isLanding = pathname === '/';

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-8 py-4 max-md:px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-text-primary">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <Sparkles size={16} />
          </div>
          Content Hub
        </Link>

        <div className="flex items-center gap-6">
          {isLanding && (
            <nav className="flex gap-6 max-md:hidden">
              <a href="#how" className="text-sm font-medium text-text-secondary transition-colors hover:text-primary">
                How it works
              </a>
              <a href="#proof" className="text-sm font-medium text-text-secondary transition-colors hover:text-primary">
                What people say
              </a>
            </nav>
          )}
          <Link
            href="/auth/signin"
            className="rounded-control bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
