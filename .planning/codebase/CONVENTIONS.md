# Coding Conventions

**Analysis Date:** 2026-07-18

## Naming Patterns

**Files:**
- React components: PascalCase in `kebab-case` directories
  - Example: `app/generate/page.tsx`, `app/dashboard/page.tsx`
- Utility/library files: camelCase with `.ts` extension
  - Example: `lib/ai.ts`, `lib/prisma.ts`
- API routes: `route.ts` following Next.js App Router pattern
  - Example: `app/api/generate/route.ts`
- Configuration: kebab-case with config extension
  - Example: `tailwind.config.ts`, `.eslintrc.json`

**Functions:**
- React event handlers: `handleEventName` prefix
  - Example: `handleGenerate` in `/app/generate/page.tsx:18`
- API route functions: Named after HTTP method
  - Example: `POST`, `GET` in `/app/api/history/route.ts`
- Utility functions: camelCase descriptive names
  - Example: `generateWithOpenAI`, `generateWithGemini` in `/lib/ai.ts`

**Variables:**
- React state: `useState` with descriptive camelCase names
  - Example: `loading`, `businessType`, `result` in `/app/generate/page.tsx:15-16`
- Boolean flags: `is` prefix or `loading`/`ready`/`error` patterns
  - Example: `loading` state in `/app/generate/page.tsx:15`

**Types:**
- Interfaces: PascalCase, prefixed with `I` optional (not consistently used)
  - Example: `ContentRequest`, `GeneratedContent` in `/lib/ai.ts:14-27`
- Prisma models: PascalCase
  - Example: `User`, `Content`, `Session` in `/prisma/schema.prisma`

## Code Style

**Formatting:**
- Tool: ESLint via Next.js configuration
- Config: `/home/pc/Documents/Hackthon/Content-Hub/.eslintrc.json`
- Extends: `next/core-web-vitals`
- Strict TypeScript: Enabled in `/home/pc/Documents/Hackthon/Content-Hub/tsconfig.json:8`
- Line length: Not enforced (no Prettier config detected)
- Semicolons: Not explicitly enforced
- Indentation: Spaces (standard Next.js)

**Linting:**
- ESLint via `next lint`
- Core web vitals rules enabled
- Custom rules: `@next/next/no-img-element` disabled

**TypeScript:**
- Strict mode: Enabled (`strict: true`)
- Path aliases: `@/*` maps to project root (`./`)
- Target: ES5
- Module resolution: Bundler
- JSX: Preserve (Next.js handles)

## Import Organization

**Order:**
1. Next.js built-ins (`next/server`, `next/auth`, `next/font`)
2. React and React hooks (`react`, `useState`, `useEffect`)
3. External packages (`openai`, `@google/generative-ai`, `prisma`, `@prisma/client`)
4. Local imports with path alias (`@/lib/ai`, `@/lib/prisma`)
5. Types (`ContentRequest`, `GeneratedContent`)

**Examples:**
```typescript
// /app/api/generate/route.ts:1-3
import { NextRequest, NextResponse } from 'next/server';
import { generateWithOpenAI, generateWithGemini, ContentRequest } from '@/lib/ai';

// /app/generate/page.tsx:1-2
'use client';
import { useState } from 'react';
```

**Path Aliases:**
- `@/*` → project root
  - Example: `import { prisma } from '@/lib/prisma'`
  - Example: `import { generateWithOpenAI } from '@/lib/ai'`

## Error Handling

**API Routes Pattern:**
```typescript
// /app/api/generate/route.ts:4-38
export async function POST(request: NextRequest) {
  try {
    const body: ContentRequest = await request.json();

    // Validate required fields
    if (!body.businessType || !body.platform || !body.tone) {
      return NextResponse.json(
        { error: 'Missing required fields: businessType, platform, tone' },
        { status: 400 }
      );
    }

    // ... business logic ...

    return NextResponse.json(content);
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
```

**Client-Side Pattern:**
```typescript
// /app/generate/page.tsx:18-43
const handleGenerate = async () => {
  setLoading(true);
  try {
    const response = await fetch('/api/generate', { /* ... */ });

    if (!response.ok) throw new Error('Generation failed');

    const data = await response.json();
    setResult(data);
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to generate content. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

**Error Response Format:**
- Status code: 400 (validation), 401 (unauthorized), 500 (server error)
- JSON body: `{ error: 'Descriptive message' }`
- Logging: `console.error` with context message before returning error

**Validation Pattern:**
- Server-side: Explicit checks with early return (no validation library used)
- Required fields: Check at API route entry
- Auth: Session check before protected operations

## Logging

**Framework:** `console.error` / `console.log` (no external logging library)

**Patterns:**
```typescript
// /app/api/generate/route.ts:32
console.error('Generation error:', error);

// /app/api/history/route.ts:22
console.error('History fetch error:', error);

// /app/generate/page.tsx:38
console.error('Error:', error);
```

**Guidelines:**
- Error context: Always prefix with operation name and colon
- Error objects: Pass full error for stack trace
- Client-side: `console.error` for debugging, `alert()` for user feedback

## Comments

**When to Comment:**
- Inline comments explaining complex logic (not present in current code)
- API flow comments: Single-line explaining provider selection logic
  - Example: `// Try OpenAI first, fallback to Gemini` in `/app/api/generate/route.ts:18`

**JSDoc/TSDoc:**
- Not currently used
- No function documentation patterns established

**TODOs/FIXMEs:**
- Not found in current codebase

## Function Design

**Size:** Functions kept small and focused (typically < 40 lines)
- Example: `handleGenerate` is 25 lines
- Example: `fetchContent` is 13 lines

**Parameters:**
- React components: No props on page components (they use state)
- API functions: Typed interface parameter
  - Example: `generateWithOpenAI(request: ContentRequest)`
- Utility functions: Destructured or typed parameters

**Return Values:**
- React components: JSX.Element
- API routes: `NextResponse`
- Async utilities: `Promise<T>` with explicit type

## Module Design

**Exports:**
- Named exports for libraries and utilities
  - Example: `export const prisma`, `export async function generateWithOpenAI`
- Default exports for React components
  - Example: `export default function GeneratePage()`
- Named exports for API routes (Next.js requirement)
  - Example: `export { handler as GET, handler as POST }`

**Barrel Files:**
- Not used (no index.ts files)

## React Component Patterns

**Client vs Server Components:**
- Page components marked with `'use client'` directive at top
  - Example: `/app/generate/page.tsx:1`, `/app/dashboard/page.tsx:1`
- Layout and static pages are server components
  - Example: `/app/layout.tsx`, `/app/page.tsx`

**State Management:**
- Local state only: `useState` and `useEffect` hooks
- No global state (Redux, Zustand, Context not used)
- State initialization: Direct `useState('')` or `useState<boolean>(false)`

**Effects:**
- `useEffect` for data fetching on mount
  - Example: `fetchContent()` called in `/app/dashboard/page.tsx:10`
- Cleanup: Not currently needed (no subscriptions)

**Styling:**
- Tailwind CSS utility classes (inline)
- Theme colors via `primary-*` palette
  - Example: `bg-primary-600`, `hover:text-primary-700`
- Conditional classes: String concatenation
  - Example: `className={loading ? 'animate-spin' : ''}`

## Database Access

**ORM:** Prisma Client

**Singleton Pattern:**
```typescript
// /lib/prisma.ts:1-9
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Usage Pattern:**
- Always import from `@/lib/prisma`
- Direct queries in API routes (no repository pattern)
- Prisma schema defines indexes and relations

**Query Style:**
```typescript
// /app/api/history/route.ts:14-18
const content = await prisma.content.findMany({
  where: { userId: session.user.id },
  orderBy: { createdAt: 'desc' },
  take: 50,
});
```

## Authentication

**Framework:** NextAuth.js v4 with Credentials Provider

**Session Strategy:** JWT

**Protected Routes Pattern:**
```typescript
// /app/api/history/route.ts:8-12
const session = await getServerSession(authOptions);

if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Auth Configuration:**
- Located at `/app/api/auth/[...nextauth]/route.ts`
- Exports `authOptions` for use in protected routes
- Custom callbacks to enrich token and session with user ID

---

*Convention analysis: 2026-07-18*
