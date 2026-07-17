# External Integrations

**Analysis Date:** 2026-07-18

## APIs & External Services

**AI/LLM Providers:**
- OpenAI API - Primary content generation provider
  - Model: `gpt-3.5-turbo`
  - SDK/Client: `openai` package (^4.40.0)
  - Auth: `OPENAI_API_KEY` environment variable
  - Response format: JSON (`response_format: { type: 'json_object' }`)
  - Implementation: `lib/ai.ts` - `generateWithOpenAI()` function

- Google Gemini API - Fallback content generation provider
  - Model: `gemini-pro`
  - SDK/Client: `@google/generative-ai` package (^0.12.0)
  - Auth: `GEMINI_API_KEY` environment variable
  - Response format: Text with regex JSON extraction (`\{[\s\S]*\}`)
  - Implementation: `lib/ai.ts` - `generateWithGemini()` function

**Provider Selection:**
- Logic location: `app/api/generate/route.ts` (lines 18-28)
- Primary: OpenAI if `OPENAI_API_KEY` exists
- Fallback: Gemini if `GEMINI_API_KEY` exists (and OpenAI not available)
- Error: Returns 500 if neither key is configured
- Note: No automatic failover within a request - selection is static based on environment

## Data Storage

**Databases:**
- PostgreSQL (primary relational database)
  - Connection: `DATABASE_URL` environment variable
  - Client: Prisma ORM (`@prisma/client` ^5.14.0)
  - Singleton pattern: `lib/prisma.ts` with globalThis caching for dev hot-reload
  - Schema location: `prisma/schema.prisma`

- Database Models:
  - `User` - User accounts with email, image, name
  - `Account` - OAuth provider accounts (NextAuth schema)
  - `Session` - User sessions (NextAuth schema)
  - `VerificationToken` - Email verification tokens
  - `Content` - Generated social media content with userId, platform, tone, post, hashtags, caption, callToAction

- Indexes:
  - `Content`: Indexed on `userId`, `platform`, and `createdAt` for efficient queries

**File Storage:**
- None detected (local filesystem only)

**Caching:**
- GlobalThis Prisma client caching for development hot-reload (`lib/prisma.ts`)
- No external caching layer (Redis/Memcached) detected

## Authentication & Identity

**Auth Provider:**
- NextAuth.js v4 (^4.24.0)
  - Implementation: `app/api/auth/[...nextauth]/route.ts`
  - Credentials Provider: Email/password authentication
  - Session Strategy: JWT (configured in `authOptions.session.strategy`)
  - Database Adapter: `@auth/prisma-adapter` for storing users/sessions in PostgreSQL

- Auth Flow:
  - Server-side: `getServerSession(authOptions)` in API routes (`app/api/history/route.ts`)
  - Client-side: `useSession()` hook (not currently used in pages, but available)
  - Protected endpoints: `/api/history` requires valid session (returns 401 if not)

- Custom Pages:
  - SignIn: `/auth/signin` (configured in `authOptions.pages`)

## Monitoring & Observability

**Error Tracking:**
- None detected (console.error logging only)

**Logs:**
- Server-side: `console.error` in API route catch blocks
- Locations: `app/api/generate/route.ts` (line 32), `app/api/history/route.ts` (lines 21, 48)

## CI/CD & Deployment

**Hosting:**
- Vercel (mentioned in README, optimized for Next.js)
- GitHub Actions CI/CD pipeline

**CI Pipeline:**
- File: `.github/workflows/ci.yml`
- Triggers: Push to main, PRs, manual dispatch
- Steps: Setup Node 20, npm install, lint, typecheck, test, build
- Additional: Conditional Python testing if requirements.txt exists

**Security Scanning:**
- File: `.github/workflows/security.yml`
- Gitleaks: Secrets detection (v8.18.4 Docker image)
- Semgrep: SAST scanning with community rules
- Both currently advisory (continue-on-error: true, not enforced)

**Dependency Management:**
- Dependabot: Weekly dependency update PRs (`.github/dependabot.yml`)
- Scans: npm ecosystem

## Environment Configuration

**Required env vars:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Secret for JWT session encryption
- `NEXTAUTH_URL` - Application base URL (e.g., http://localhost:3000)
- `OPENAI_API_KEY` - OpenAI API key (optional, but primary LLM provider)
- `GEMINI_API_KEY` - Google Gemini API key (optional, fallback LLM provider)

**Secrets location:**
- `.env` file (git-ignored, never committed)
- `.env.example` - Template provided for developer setup
- GitHub Secrets (for CI/CD - not currently used in this setup)

## Webhooks & Callbacks

**Incoming:**
- NextAuth callbacks:
  - JWT callback: `app/api/auth/[...nextauth]/route.ts` (lines 41-47) - Attaches user ID to token
  - Session callback: `app/api/auth/[...nextauth]/route.ts` (lines 48-53) - Attaches user ID to session

**Outgoing:**
- None detected

## Data Flow Summary

**Content Generation:**
1. User submits form on `/generate` page (`app/generate/page.tsx`)
2. Client-side React calls `POST /api/generate` with `ContentRequest`
3. API route validates required fields (`businessType`, `platform`, `tone`)
4. Routes to OpenAI or Gemini based on environment configuration
5. LLM generates JSON response matching `GeneratedContent` interface
6. Response returned to client and displayed

**Content Storage:**
1. User generates content on `/generate` page
2. User navigates to `/dashboard` page (`app/dashboard/page.tsx`)
3. Client-side fetches `GET /api/history` (requires authenticated session)
4. API returns user's last 50 generated content items sorted by date

---

*Integration audit: 2026-07-18*
