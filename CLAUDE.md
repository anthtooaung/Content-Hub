# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Content Hub is an AI-powered social media content generator for the AI Solution Sprint Hackathon 2026. It lets users describe their business/campaign and generates platform-specific social media posts, captions, hashtags, and CTAs using OpenAI (primary) or Gemini (fallback).

## Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # ESLint via next lint
npm test                 # Vitest (watch mode)
npm run test:run         # Vitest single run
npm run prisma:generate  # Generate Prisma client after schema changes
npm run prisma:push      # Push schema to database (no migration file)
npm run prisma:migrate   # Run Prisma migrations
npm run prisma:studio    # Open Prisma Studio GUI
```

## Architecture

**Framework:** Next.js 14 App Router with TypeScript.

**Pages (App Router):**
- `/app/page.tsx` — Landing page with feature navigation
- `/app/generate/page.tsx` — Content generation form (client component), calls POST `/api/generate`
- `/app/dashboard/page.tsx` — Saved content list (client component), calls GET `/api/history`

**API Routes:**
- `/app/api/auth/[...nextauth]/route.ts` — NextAuth.js with CredentialsProvider, JWT sessions, PrismaAdapter
- `/app/api/generate/route.ts` — POST endpoint; tries OpenAI first, falls back to Gemini
- `/app/api/history/route.ts` — GET (user's last 50 posts) and POST (save content); requires session auth

**Shared Libraries:**
- `/lib/prisma.ts` — Singleton PrismaClient (globalThis caching for dev hot-reload)
- `/lib/ai.ts` — OpenAI/Gemini client init, `ContentRequest`/`GeneratedContent` interfaces, `generateWithOpenAI()` and `generateWithGemini()` functions

**Database:** PostgreSQL via Prisma ORM. Schema at `prisma/schema.prisma` defines `User`, `Account`, `Session`, `VerificationToken`, and `Content` models. Content is indexed on userId, platform, createdAt.

## LLM Integration

**Providers (dual-model, failover pattern):**
- **OpenAI** (primary) — `gpt-3.5-turbo` via `openai` SDK, uses `response_format: { type: 'json_object' }` for structured output
- **Gemini** (fallback) — `gemini-pro` via `@google/generative-ai` SDK, JSON extracted from response via regex `\{[\s\S]*\}`

**Provider selection** (`/app/api/generate/route.ts`):
OpenAI is used if `OPENAI_API_KEY` is set; otherwise Gemini if `GEMINI_API_KEY` is set; otherwise 500. Selection is based on which key is available, not on failure — there is no automatic failover between providers within a single request.

**Input interface** (`ContentRequest` in `/lib/ai.ts`):
```typescript
{ businessType: string; platform: string; tone: string; topic?: string; keywords?: string[] }
```

**Output interface** (`GeneratedContent` in `/lib/ai.ts`):
```typescript
{ post: string; hashtags: string[]; caption: string; callToAction: string }
```

**Prompt structure:** Both providers receive an identical prompt instructing the model to generate a post (280 chars for Twitter, longer for others), 5–10 hashtags, a caption, and a CTA — all returned as JSON.

**Generation flow:**
1. User submits form on `/generate` page → POST `/api/generate`
2. Route validates required fields (`businessType`, `platform`, `tone`)
3. Calls `generateWithOpenAI()` or `generateWithGemini()` based on env vars
4. Returns `GeneratedContent` JSON to client
5. Client displays results with copy buttons (content is not yet auto-saved)

**Environment variables for LLM:** `OPENAI_API_KEY`, `GEMINI_API_KEY`

## Environment Variables

`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` — required for app to run. LLM keys listed above under LLM Integration.

## Conventions

- **Branching:** GitHub Flow — branch off main, open PR, require 1 review, no self-merge.
- **Starting work:** When beginning a task, always ask the user whether to create a new branch or use the current branch.
- **AI generation pattern:** Always try OpenAI first in `/api/generate`, fall back to Gemini on failure.
- **Prisma client:** Always import from `/lib/prisma.ts` — it's a singleton with dev hot-reload caching via `globalThis`.
- **Auth:** NextAuth.js v4 with Credentials provider and JWT strategy. Session is checked server-side in API routes and client-side via `useSession`.
- **Styling:** Tailwind CSS with `clsx` + `tailwind-merge` for conditional classes. Lucide React for icons.
- **Testing:** Vitest is configured in package.json. No test files exist yet — new code should include tests.
