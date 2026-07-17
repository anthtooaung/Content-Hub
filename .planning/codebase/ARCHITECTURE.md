# Architecture

**Analysis Date:** 2026-07-18

## System Overview

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER (React/Next.js)                       │
├─────────────────┬─────────────────┬────────────────────┬────────────────────┤
│  Landing Page   │ Generation Page │   Dashboard Page   │  Auth Components   │
│  `app/page.tsx` │ `app/generate/` │  `app/dashboard/`  │  `next-auth/`      │
│                 │  page.tsx       │  page.tsx          │  components        │
└────────┬────────┴────────┬────────┴─────────┬──────────┴────────┬───────────┘
         │                 │                  │                   │
         │                 ▼                  ▼                   │
┌────────┼───────────────────────────────────────────────────────┼─────────────┐
│        │              API ROUTES LAYER (Next.js Server)         │              │
│        │  ┌──────────────────────────────────────────────────┐  │              │
│        │  │  POST /api/generate  │  GET/POST /api/history    │  │              │
│        │  │  `app/api/generate/` │  `app/api/history/`       │  │              │
│        │  │       route.ts       │       route.ts            │  │              │
│        │  └────────────┬─────────┴────────────┬──────────────┘  │              │
│        │               │                      │                 │              │
│        │               ▼                      ▼                 │              │
│        │  ┌──────────────────────────────────────────────────┐  │              │
│        │  │  POST /api/auth/[...nextauth]                    │  │              │
│        │  │  `app/api/auth/[...nextauth]/route.ts`           │  │              │
│        │  └──────────────────────────────────────────────────┘  │              │
└────────┼───────────────────────────────────────────────────────┼─────────────┘
         │                                                       │
         │                                                       │
         ▼                                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           SHARED LIBRARIES                                   │
│  ┌─────────────────┐                    ┌──────────────────────────────┐      │
│  │  Prisma Client   │                    │  AI Service Layer            │      │
│  │  `lib/prisma.ts` │                    │  `lib/ai.ts`                │      │
│  └────────┬────────┘                    └─────────────┬────────────────┘      │
│           │                                           │                       │
│           │                                           ▼                       │
│           │                           ┌──────────────────────────────────┐    │
│           │                           │  External AI Providers          │    │
│           │                           │  OpenAI API (primary)           │    │
│           │                           │  Gemini API (fallback)          │    │
│           │                           └──────────────────────────────────┘    │
└───────────┼───────────────────────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           DATA STORE                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │  PostgreSQL Database                                                 │    │
│  │  `prisma/schema.prisma`                                              │    │
│  │  Tables: User, Account, Session, VerificationToken, Content          │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Landing Page | Feature introduction, navigation to generation | `app/page.tsx` |
| Generation Form | User input collection, API call, result display | `app/generate/page.tsx` |
| Dashboard | Display saved content, manage history | `app/dashboard/page.tsx` |
| Root Layout | HTML shell, metadata, global styles | `app/layout.tsx` |
| Global Styles | Tailwind imports, CSS variables | `app/globals.css` |
| Generate API | Content generation orchestration, provider selection | `app/api/generate/route.ts` |
| History API | Content CRUD operations for authenticated users | `app/api/history/route.ts` |
| Auth API | NextAuth.js session management | `app/api/auth/[...nextauth]/route.ts` |
| AI Service | OpenAI/Gemini client init, content generation functions | `lib/ai.ts` |
| Prisma Client | Singleton database client with dev hot-reload caching | `lib/prisma.ts` |
| Database Schema | User/Content data models, relations, indexes | `prisma/schema.prisma` |

## Pattern Overview

**Overall:** Layered Monolithic Architecture with Clean Separation

**Key Characteristics:**
- Server-side rendering with Next.js App Router (React Server Components)
- API routes follow file-system routing convention
- Client-side pages use `'use client'` directive for interactivity
- Dual AI provider pattern with primary/fallback selection
- JWT-based authentication with Prisma adapter for session storage
- Singleton database client pattern for connection efficiency

## Layers

**Presentation Layer:**
- Purpose: User interface and interaction handling
- Location: `app/`
- Contains: React pages, global styles, layout
- Depends on: Next.js routing, React hooks, API routes
- Used by: End users via browser

**API Layer:**
- Purpose: RESTful endpoints for data operations
- Location: `app/api/`
- Contains: Route handlers for generate, history, and auth
- Depends on: Prisma client, AI service, NextAuth
- Used by: Client pages via fetch calls

**Service Layer:**
- Purpose: Business logic and external integrations
- Location: `lib/`
- Contains: AI provider clients, database client singleton
- Depends on: External APIs (OpenAI, Gemini), Prisma
- Used by: API routes

**Data Layer:**
- Purpose: Persistent storage and data access
- Location: `prisma/`
- Contains: Schema definition, migrations
- Depends on: PostgreSQL database
- Used by: Prisma client in service layer

## Data Flow

### Primary Generation Path

1. **User submits form** — `app/generate/page.tsx:18-42`
   - Collects: businessType, platform, tone, topic, keywords
   - Validates required fields client-side
   - Sends POST request to `/api/generate`

2. **API routes to AI provider** — `app/api/generate/route.ts:4-38`
   - Validates businessType, platform, tone are present
   - Selects provider based on env vars: OPENAI_API_KEY → OpenAI, GEMINI_API_KEY → Gemini
   - Calls `generateWithOpenAI()` or `generateWithGemini()` from `lib/ai.ts`
   - Returns GeneratedContent JSON response

3. **AI service generates content** — `lib/ai.ts:29-78`
   - Constructs identical prompt for both providers
   - OpenAI: Uses `gpt-3.5-turbo` with JSON response format
   - Gemini: Uses `gemini-pro` with JSON extraction via regex
   - Returns structured data: { post, hashtags, caption, callToAction }

4. **Client displays results** — `app/generate/page.tsx:141-189`
   - Renders post, hashtags, caption, call-to-action
   - Provides copy-to-clipboard functionality
   - Content is NOT auto-saved to database

### Content Storage Path

1. **User triggers save** — `app/dashboard/page.tsx:14-26` (future implementation)
   - User can save generated content from dashboard

2. **History API saves to DB** — `app/api/history/route.ts:30-61`
   - Verifies session authentication
   - Creates Content record with all fields
   - Stores: userId, platform, tone, topic, post, hashtags[], caption, callToAction

3. **Data persists** — `prisma/schema.prisma:58-76`
   - Indexed on: userId, platform, createdAt
   - Supports: isFavorite flag, timestamps

### Authentication Flow

1. **User submits credentials** — NextAuth form (at `/auth/signin`)
2. **NextAuth validates** — `app/api/auth/[...nextauth]/route.ts:16-36`
   - Looks up user by email in database
   - Returns user object on success
3. **JWT token created** — `app/api/auth/[...nextauth]/route.ts:42-54`
   - Stores user ID in token
   - Attaches user to session via callback
4. **Session validated** — `app/api/history/route.ts:8-14`
   - API routes check `getServerSession(authOptions)`
   - Returns 401 if no valid session

**State Management:**
- Client-side state via React `useState`/`useEffect` hooks
- No global state management (Redux, Zustand) — simple app doesn't require it
- Authentication state managed by NextAuth's `useSession` hook
- Form state managed locally in generation page

## Key Abstractions

**ContentRequest Interface:**
- Purpose: Standardizes input for AI content generation
- Examples: `lib/ai.ts:14-20`
- Pattern: TypeScript interface defining required/optional fields

**GeneratedContent Interface:**
- Purpose: Standardizes output from AI providers
- Examples: `lib/ai.ts:22-27`
- Pattern: TypeScript interface defining response shape

**Dual Provider Pattern:**
- Purpose: Resilience through redundancy (OpenAI primary, Gemini fallback)
- Examples: `app/api/generate/route.ts:19-28`, `lib/ai.ts:29-78`
- Pattern: Try primary provider, fallback on availability (not on failure)

**Singleton Client Pattern:**
- Purpose: Efficient database connection reuse across hot reloads
- Examples: `lib/prisma.ts:1-9`
- Pattern: Module-level singleton with globalThis caching in development

## Entry Points

**Landing Page:**
- Location: `app/page.tsx`
- Triggers: User navigates to root URL `/`
- Responsibilities: Introduction, feature overview, navigation links

**Generation Form:**
- Location: `app/generate/page.tsx`
- Triggers: User navigates to `/generate`
- Responsibilities: Collect input, call API, display results

**Dashboard:**
- Location: `app/dashboard/page.tsx`
- Triggers: User navigates to `/dashboard`
- Responsibilities: Display saved content history

**API Endpoints:**
- Location: `app/api/`
- Triggers: Client-side fetch calls
- Responsibilities: Business logic execution, data persistence

## Architectural Constraints

- **Threading:** Single-threaded event loop (Node.js). Long AI generation calls may block if not awaited properly. Each request handled independently by Next.js server.

- **Global state:** Minimal. `lib/prisma.ts` module-level singleton (line 3-7). Environment variables loaded at module initialization. No other global mutable state.

- **Circular imports:** None detected. Clear dependency flow: Pages → API Routes → Services → Database. Libraries don't import from pages.

- **External dependency isolation:** AI provider clients (`lib/ai.ts`) are isolated from business logic. Easy to swap providers or add new ones.

- **Database connection management:** Prisma handles connection pooling. Singleton ensures single client instance across hot reloads.

## Anti-Patterns

### No Automatic Provider Failover

**What happens:** Provider selection is based on API key availability, not on request failure. If OpenAI is configured but fails during generation, the request fails without trying Gemini.

**Why it's wrong:** Defeats the purpose of having a dual-provider setup. User experience suffers when one provider has issues.

**Do this instead:** Add try-catch around the selected provider call with fallback logic:
```typescript
// In app/api/generate/route.ts, after provider selection
try {
  content = await generateWithOpenAI(body);
} catch (error) {
  console.error('OpenAI failed, trying Gemini:', error);
  content = await generateWithGemini(body);
}
```

### Missing Error Boundary in AI Service

**What happens:** `lib/ai.ts:50` and `lib/ai.ts:77` parse JSON without validation. Malformed responses will crash the request.

**Why it's wrong:** External AI responses can be unpredictable. JSON parsing without validation is fragile.

**Do this instead:** Use Zod or manual validation to ensure response matches `GeneratedContent` interface:
```typescript
import { z } from 'zod';

const ContentSchema = z.object({
  post: z.string(),
  hashtags: z.array(z.string()),
  caption: z.string(),
  callToAction: z.string(),
});

const parsed = JSON.parse(content || '{}');
return ContentSchema.parse(parsed); // Throws if invalid
```

### No Rate Limiting

**What happens:** `/api/generate` endpoint can be called repeatedly without restrictions, potentially incurring high API costs.

**Why it's wrong:** In production, this creates financial and abuse risks.

**Do this instead:** Add rate limiting middleware (e.g., with `express-rate-limit` or Next.js middleware) to limit requests per user/IP.

## Error Handling

**Strategy:** Try-catch blocks with generic error messages. No custom error classes.

**Patterns:**
- API routes: `try { ... } catch { return NextResponse.json({ error: "..." }, { status: 500 }) }`
- Client pages: `try { ... } catch (error) { console.error("Error:", error); alert("Failed...") }`
- No error boundaries defined (React's ErrorBoundary)

**Error Response Format:**
```json
{ "error": "Descriptive message", "status": 400|401|500 }
```

## Cross-Cutting Concerns

**Logging:** Minimal. Only `console.error()` in API routes for debugging. No structured logging, no log levels.

**Validation:** Only in API routes for required fields. Client-side validation is implicit (required attribute). No schema validation library used.

**Authentication:** NextAuth.js with Credentials provider. JWT strategy with PrismaAdapter. Session checked server-side in API routes. Client-side via `useSession`.

**Authorization:** Not implemented. Any authenticated user can access any content. No role-based access control.

**Styling:** Tailwind CSS with custom primary color palette. Components use `clsx` + `tailwind-merge` for conditional classes (defined in `tailwind.config.ts:11-24`). Dark mode via `prefers-color-scheme` media query in `globals.css:5-15`.

**Formatting:** No formatter configured (Prettier not present). ESLint configured with `next/core-web-vitals` rules.

---

*Architecture analysis: 2026-07-18*
