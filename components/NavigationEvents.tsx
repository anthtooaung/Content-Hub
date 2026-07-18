'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

export default function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Done when route changes
  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  // Start on link clicks
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');

      if (!anchor) return;

      // Skip external, hash, mailto, tel links
      if (
        anchor.target === '_blank' ||
        anchor.href.startsWith('mailto:') ||
        anchor.href.startsWith('tel:') ||
        anchor.hash ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.button !== 0
      ) {
        return;
      }

      const url = new URL(anchor.href);

      // Skip same-page navigation
      if (url.pathname === window.location.pathname) {
        return;
      }

      NProgress.start();
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  return null;
}
