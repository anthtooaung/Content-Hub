# Phase 1: Landing & Design Foundation - Pattern Map

**Mapped:** 2026-07-18
**Files analyzed:** 8
**Analogs found:** 8 / 8

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `middleware.ts` (CREATE) | middleware | request-response | No existing file | N/A (see No Analog Found) |
| `app/auth/signin/page.tsx` | page/component | request-response | `app/auth/signin/page.tsx` (self) | exact (existing code to redesign) |
| `app/auth/signup/page.tsx` | page/component | request-response | `app/auth/signup/page.tsx` (self) | exact (existing code to redesign) |
| `components/SiteHeader.tsx` | component | request-response | `components/SiteHeader.tsx` (self) | exact (existing code to extend) |
| `app/page.tsx` | page | request-response | `app/page.tsx` (self) | exact (already implemented, minor refinements) |
| `app/layout.tsx` | config/layout | request-response | `app/layout.tsx` (self) | exact (already implemented, minor updates) |
| `app/globals.css` | config | request-response | `.claude/skills/sketch-findings-content-hub/sources/themes/default.css` | exact (sketch theme matches current tokens) |
| `tailwind.config.ts` | config | request-response | `tailwind.config.ts` (self) | exact (already configured) |

## Pattern Assignments

### `middleware.ts` (middleware, request-response) -- NEW FILE

**Analog:** No existing file. Use pattern from RESEARCH.md and Next.js docs.

**Core pattern** (from RESEARCH.md lines 312-326):
```typescript
import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: ["/generate/:path*", "/dashboard/:path*"],
};
```

**Key constraint:** Middleware runs on Edge Runtime. Do NOT import Prisma, bcryptjs, or any Node.js API. Use `withAuth` which only checks JWT token existence.

**Redirect behavior (D-13, D-14):**
- Unauthenticated users hitting `/generate` or `/dashboard` are redirected to `/auth/signin`
- After login, redirect to `/generate` (not back to landing)

---

### `app/auth/signin/page.tsx` (page/component, request-response) -- MODIFY

**Analog:** Self (existing centered card layout, needs redesign to split layout)

**Current imports** (lines 1-7):
```typescript
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
```

**Current core pattern** (lines 16-38) -- form submission with signIn:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password. Please try again.');
    } else {
      router.push('/generate');
      router.refresh();
    }
  } catch {
    setError('Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

**Current error handling** (lines 54-58):
```typescript
{error && (
  <div className="mb-4 rounded-control bg-error-soft px-3 py-3 text-sm text-error">
    {error}
  </div>
)}
```

**Current input pattern** (lines 65-71):
```typescript
<input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
  className="h-11 w-full rounded-control border border-border-strong px-3 text-sm outline-none transition-shadow focus:border-primary focus:shadow-focus"
/>
```

**Current button pattern** (lines 87-93):
```typescript
<button
  type="submit"
  disabled={loading}
  className="h-12 w-full rounded-control bg-primary text-base font-semibold text-white transition-all hover:bg-primary-600 disabled:pointer-events-none disabled:opacity-70"
>
  {loading ? 'Signing in...' : 'Sign in'}
</button>
```

**Target layout** (from auth-trust.md sketch findings, lines 16-25):
```css
.auth-split { display: flex; min-height: calc(100vh - 52px); width: 100%; }
.auth-illustration {
  flex: 1; background: linear-gradient(135deg, var(--color-primary) 0%, #1E40AF 100%);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 48px; color: white; position: relative; overflow: hidden;
}
.auth-form-side {
  flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px;
}
```

**Target HTML structure** (from auth-trust.md lines 53-70):
```html
<div class="auth-split">
  <div class="auth-illustration">
    <h2>Create content that converts</h2>
    <p>AI-powered social media posts for your business.</p>
  </div>
  <div class="auth-form-side">
    <div class="auth-form-container">
      <!-- Logo, title, form, footer link -->
    </div>
  </div>
</div>
```

**What to keep:** Form logic, signIn call, error handling, redirect to `/generate`.
**What to change:** Layout from centered card to split layout with illustration panel.

---

### `app/auth/signup/page.tsx` (page/component, request-response) -- MODIFY

**Analog:** Self (existing centered card layout, needs redesign to split layout)

**Current imports** (lines 1-6):
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
```

**Current core pattern** (lines 16-52) -- form submission with fetch to /api/auth/signup:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  if (password !== confirmPassword) {
    setError('Passwords do not match.');
    return;
  }

  if (password.length < 6) {
    setError('Password must be at least 6 characters.');
    return;
  }

  setLoading(true);

  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Something went wrong.');
      return;
    }

    router.push('/auth/signin');
  } catch {
    setError('Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

**Client-side validation** (lines 20-28):
```typescript
if (password !== confirmPassword) {
  setError('Passwords do not match.');
  return;
}

if (password.length < 6) {
  setError('Password must be at least 6 characters.');
  return;
}
```

**Target layout:** Same split layout as signin (auth-trust.md).

**What to keep:** Form logic, fetch to /api/auth/signup, validation, redirect to `/auth/signin`.
**What to change:** Layout from centered card to split layout with illustration panel.

---

### `components/SiteHeader.tsx` (component, request-response) -- MODIFY

**Analog:** Self (existing header without auth-awareness)

**Current imports** (lines 1-6):
```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
```

**Current structure** (lines 8-43): Header with logo, conditional nav links for landing page, hardcoded "Sign in" button.

**Target pattern** (from RESEARCH.md lines 250-309):
```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Sparkles } from 'lucide-react';

export default function SiteHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLanding = pathname === '/';
  const isAuthenticated = status === 'authenticated';

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
          {isLanding && !isAuthenticated && (
            <nav className="flex gap-6 max-md:hidden">
              <a href="#how" className="text-sm font-medium text-text-secondary hover:text-primary">
                How it works
              </a>
              <a href="#proof" className="text-sm font-medium text-text-secondary hover:text-primary">
                What people say
              </a>
            </nav>
          )}
          
          {isAuthenticated ? (
            <>
              <span className="text-sm text-text-secondary">{session?.user?.name || session?.user?.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="rounded-control border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-primary hover:bg-surface-subtle"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="rounded-control bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
```

**Key changes:**
1. Add `useSession` and `signOut` imports from `next-auth/react`
2. Check `status === 'authenticated'` to conditionally render
3. Show user name/email + Sign out button when authenticated
4. Show Sign in link when unauthenticated
5. Nav links only visible on landing page when unauthenticated

---

### `app/page.tsx` (page, request-response) -- MINOR REFINEMENTS

**Analog:** Self (already well-implemented)

**Current structure** (lines 1-169): Complete landing page with hero (two-column grid), how-it-works (3-column grid), testimonials (3-column grid), SiteHeader, Footer.

**Key patterns already in place:**
- Two-column hero grid: `[grid-template-columns:1.1fr_0.9fr]` (line 48)
- Perspective transform on mockup: `[transform:perspective(800px)_rotateY(-2deg)]` (line 73)
- Step circles: `h-12 w-12 rounded-full bg-primary-50 text-xl font-bold text-primary` (line 132)
- Card styling: `rounded-panel border border-border bg-surface p-6` (line 153)
- Responsive prefixes: `max-md:` for mobile breakpoints

**What to keep:** All existing patterns are correct and match sketch findings.
**Potential refinements:** Footer content, responsive breakpoint fine-tuning, hover transitions on cards.

---

### `app/layout.tsx` (config/layout, request-response) -- MINOR UPDATES

**Analog:** Self (already well-implemented)

**Current structure** (lines 1-25):
```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SessionProvider } from '@/components/SessionProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Content Hub - AI Social Media Content Generator',
  description: 'Generate engaging social media content for multiple platforms within seconds',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

**What to keep:** Inter font, SessionProvider wrapper, metadata.
**What to verify:** Auth pages (signin/signup) will NOT be wrapped in SessionProvider's client-side session check since they use their own form logic. The layout is correct as-is.

---

### `app/globals.css` (config, request-response) -- VERIFY COMPLETENESS

**Analog:** `.claude/skills/sketch-findings-content-hub/sources/themes/default.css` (sketch theme)

**Current tokens** (lines 5-42): All design tokens from sketch findings are already present:
- Colors: primary (#2563EB), surfaces (#F8FAFC, #FFFFFF), text, border, error, platform colors
- Radii: control (10px), card (12px), panel (16px)
- Shadows: card, card-hover, focus
- Transitions: fast (150ms), panel (225ms)

**Sketch theme comparison** (default.css lines 7-87):
- All tokens match exactly
- Sketch theme has additional tokens: `--color-surface-selected`, `--color-info`, `--color-info-soft`, `--radius-modal`, `--radius-pill`, `--shadow-modal`, `--shadow-toast`, typography scale variables, spacing scale variables

**What to potentially add:**
- `--color-surface-selected` (for active states)
- `--color-info` / `--color-info-soft` (for info banners)
- `--radius-modal` (for future modals)
- `--shadow-modal` / `--shadow-toast` (for future overlays)
- Typography scale variables (`--text-display`, `--text-h1`, etc.)
- Spacing scale variables (`--space-1` through `--space-16`)

---

### `tailwind.config.ts` (config, request-response) -- VERIFY COMPLETENESS

**Analog:** Self (already configured)

**Current config** (lines 1-61): Colors, fontFamily, borderRadius, boxShadow all present.

**What to potentially add:**
- `success` and `warning` color variants (already in globals.css but may need Tailwind mapping)
- `info` color variant
- Additional spacing utilities if needed

---

## Shared Patterns

### Authentication Session Check
**Source:** `lib/auth.ts` (lines 7-64)
**Apply to:** All protected page components and SiteHeader
```typescript
// NextAuth config pattern - JWT strategy with session callback
session: {
  strategy: 'jwt',
},
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
    }
    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.id as string;
    }
    return session;
  },
},
pages: {
  signIn: '/auth/signin',
},
```

### Client-Side Session Access
**Source:** `components/SessionProvider.tsx` (lines 1-7)
**Apply to:** SiteHeader, any component needing session state
```typescript
'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
```

### Form Input Pattern
**Source:** `app/auth/signin/page.tsx` (lines 65-71)
**Apply to:** All form inputs across auth pages
```typescript
<input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
  className="h-11 w-full rounded-control border border-border-strong px-3 text-sm outline-none transition-shadow focus:border-primary focus:shadow-focus"
/>
```

### Error Banner Pattern
**Source:** `app/auth/signin/page.tsx` (lines 54-58)
**Apply to:** All pages with error states
```typescript
{error && (
  <div className="mb-4 rounded-control bg-error-soft px-3 py-3 text-sm text-error">
    {error}
  </div>
)}
```

### Primary Button Pattern
**Source:** `app/auth/signin/page.tsx` (lines 87-93)
**Apply to:** All primary action buttons
```typescript
<button
  type="submit"
  disabled={loading}
  className="h-12 w-full rounded-control bg-primary text-base font-semibold text-white transition-all hover:bg-primary-600 disabled:pointer-events-none disabled:opacity-70"
>
  {loading ? 'Signing in...' : 'Sign in'}
</button>
```

### Page Container Pattern
**Source:** `app/page.tsx` (lines 47-48)
**Apply to:** All page-level layouts
```typescript
<div className="px-8 py-20 max-md:px-4 max-md:py-12">
  <div className="mx-auto max-w-[1200px]">
    {/* content */}
  </div>
</div>
```

### Header Pattern
**Source:** `components/SiteHeader.tsx` (lines 13-14)
**Apply to:** All page headers
```typescript
<header className="border-b border-border bg-surface">
  <div className="mx-auto flex max-w-[1200px] items-center justify-between px-8 py-4 max-md:px-4">
```

### Logo Pattern
**Source:** `components/SiteHeader.tsx` (lines 15-20)
**Apply to:** All logo instances (header, auth pages)
```typescript
<Link href="/" className="flex items-center gap-2 text-lg font-bold text-text-primary">
  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
    <Sparkles size={16} />
  </div>
  Content Hub
</Link>
```

---

## No Analog Found

Files with no close match in the codebase (planner should use RESEARCH.md patterns instead):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `middleware.ts` | middleware | request-response | No middleware file exists yet. Use `next-auth/middleware` withAuth pattern from RESEARCH.md |

---

## Metadata

**Analog search scope:** `app/`, `components/`, `lib/`, `.claude/skills/sketch-findings-content-hub/`
**Files scanned:** 12
**Pattern extraction date:** 2026-07-18
