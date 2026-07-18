# Codebase Concerns

**Analysis Date:** 2026-07-18

## Tech Debt

**No Test Coverage:**
- Issue: Entire codebase lacks test files; vitest is configured but unused
- Files: `app/generate/page.tsx`, `app/dashboard/page.tsx`, `app/api/generate/route.ts`, `lib/ai.ts`
- Impact: No regression detection, no validation of correctness, no safe refactoring capability
- Fix approach: Write unit tests for `lib/ai.ts` (mock AI providers), API route tests (mock DB), component tests (render behavior)

**TypeScript `any` Type Usage:**
- Issue: Component state typed as `any` loses type safety
- Files: `app/generate/page.tsx:16` (`useState<any>(null)`), `app/dashboard/page.tsx:7` (`useState<any[]>([])`)
- Impact: Runtime errors not caught at compile time, no IDE autocompletion
- Fix approach: Create `GeneratedContent` and `SavedContent` interfaces, use them in state

**Incomplete Landing Page:**
- Issue: Three of four feature links point to `href="#"` (Smart Hashtags, Campaign Ideas, Content History)
- Files: `app/page.tsx:42-85`
- Impact: Broken UX, users see non-functional cards
- Fix approach: Either implement missing features or remove the cards entirely

**No Content Auto-Save:**
- Issue: Generated content doesn't persist automatically; requires manual POST to `/api/history`
- Files: `app/generate/page.tsx`, `app/api/history/route.ts`
- Impact: Users lose content on page refresh, no automatic history
- Fix approach: Auto-save after generation, or add save button in generate results UI

**No Sign-In Page:**
- Issue: Auth config references `/auth/signin` but that page doesn't exist
- Files: `app/api/auth/[...nextauth]/route.ts:56`
- Impact: Users redirected to 404 on failed auth, broken authentication flow
- Fix approach: Create `app/auth/signin/page.tsx` with credentials form

**Duplicated Prompt Construction:**
- Issue: Same prompt template repeated in `generateWithOpenAI()` and `generateWithGemini()`
- Files: `lib/ai.ts:30-41`, `lib/ai.ts:54-65`
- Impact: Maintenance burden, inconsistency risk
- Fix approach: Extract shared `buildPrompt(request: ContentRequest): string` function

## Known Bugs

**No Automatic Provider Failover:**
- Symptoms: If OpenAI is selected, it's used even if Gemini would work; no retry on failure
- Files: `app/api/generate/route.ts:18-28`
- Trigger: OpenAI key set but API returns error
- Workaround: Manually unset `OPENAI_API_KEY` to force Gemini

**Silent Error Handling in Components:**
- Symptoms: `console.error` called but users see generic "alert" error message with no details
- Files: `app/generate/page.tsx:38-39`, `app/dashboard/page.tsx:22`
- Trigger: Any API error
- Workaround: None — poor user experience

**Unvalidated API Body:**
- Symptoms: API accepts any JSON body, no Zod or schema validation beyond checking 3 required fields exist
- Files: `app/api/generate/route.ts:8-14`
- Trigger: Malformed request body with missing/extra fields
- Workaround: None — potential injection vector

## Security Considerations

**Prompt Injection Risk:**
- Risk: User input (`businessType`, `platform`, `topic`, `keywords`) inserted directly into LLM prompts without sanitization
- Files: `lib/ai.ts:30-41`, `lib/ai.ts:54-65`
- Current mitigation: None
- Recommendations: Sanitize user input, strip special characters, use structured prompts with delimiters

**No Rate Limiting:**
- Risk: Unauthenticated requests to `/api/generate` could be abused; no throttle on expensive AI API calls
- Files: `app/api/generate/route.ts`
- Current mitigation: None
- Recommendations: Add rate limiting middleware (e.g., `next-rate-limiter`) with per-IP and per-user limits

**No Request Origin Validation:**
- Risk: API routes accept requests from any origin without CORS or origin header checks
- Files: `app/api/generate/route.ts`, `app/api/history/route.ts`
- Current mitigation: None
- Recommendations: Add CSRF protection via Next.js built-in or middleware

**Generate Page Not Protected:**
- Risk: `/generate` page is accessible without authentication, while `/api/history` requires session
- Files: `app/generate/page.tsx`, `app/api/generate/route.ts`
- Current mitigation: None
- Recommendations: Either gate `/generate` page behind auth, or allow unauthenticated generation (document the choice)

**Insecure Error Messages:**
- Risk: API errors may expose internal details to client
- Files: `app/api/generate/route.ts:32-34`
- Current mitigation: Generic "Failed to generate content" message
- Recommendations: Good — but ensure error object doesn't leak stack traces in production

## Performance Bottlenecks

**No Timeout on AI API Calls:**
- Problem: OpenAI/Gemini API calls have no timeout; slow network could block requests indefinitely
- Files: `lib/ai.ts:43-47`, `lib/ai.ts:67-69`
- Cause: No timeout option passed to `openai.chat.completions.create()` or `geminiModel.generateContent()`
- Improvement path: Add `timeout` option (e.g., 30 seconds) and handle timeout errors gracefully

**No Caching of Generated Content:**
- Problem: Duplicate requests with same parameters regenerate identical content
- Files: `app/api/generate/route.ts`
- Cause: No caching layer or memoization
- Improvement path: Cache recent results by content hash (Redis or in-memory with TTL)

**No Pagination in History Endpoint:**
- Problem: `take: 50` hard-coded limit with no cursor pagination
- Files: `app/api/history/route.ts:15-18`
- Cause: Simple query with offset limit
- Improvement path: Implement cursor-based pagination with skip/take

**No Database Connection Pooling:**
- Problem: Singleton PrismaClient may not handle concurrent requests well under load
- Files: `lib/prisma.ts`
- Cause: Single connection in development; production may need pooling
- Improvement path: Add connection pooling via `@prisma/adapter-pg` or configure pool in `schema.prisma`

## Fragile Areas

**Dual AI Provider Architecture:**
- Files: `lib/ai.ts`, `app/api/generate/route.ts`
- Why fragile: Two different AI SDKs with different response formats; Gemini requires regex extraction while OpenAI uses JSON mode; either SDK breaking change breaks the system
- Safe modification: Always test both providers when changing prompts or output handling; add fallback error handling
- Test coverage: None — critical gap

**Prisma Adapter with NextAuth Credentials:**
- Files: `app/api/auth/[...nextauth]/route.ts:8`
- Why fragile: Credentials provider doesn't store passwords (authorize() returns user without password validation); unclear how users are actually created
- Safe modification: Verify user creation flow; add password hashing if users are stored
- Test coverage: None

**Client-Side Route Protection:**
- Files: `app/dashboard/page.tsx`
- Why fragile: Dashboard calls `/api/history` which checks session server-side, but UI doesn't verify session on client; unauthenticated users see empty state rather than redirect
- Safe modification: Add `useSession()` check with redirect in dashboard
- Test coverage: None

**AI Response Parsing:**
- Files: `lib/ai.ts:50`, `lib/ai.ts:74`
- Why fragile: `JSON.parse()` can throw on malformed AI output; Gemini regex extraction may miss edge cases
- Safe modification: Wrap in try/catch with retry logic; validate response against schema
- Test coverage: None

## Scaling Limits

**Concurrent Request Volume:**
- Current capacity: Unbounded (no rate limiting)
- Limit: Would hit AI API rate limits quickly; each request takes 2-10 seconds
- Scaling path: Add queue system (Redis + BullMQ), implement rate limiting, add request queuing

**Database Load on History Queries:**
- Current capacity: 50 items per user, indexed on userId
- Limit: 1M+ users with 1000+ posts each would slow queries
- Scaling path: Add pagination, partitioning by userId ranges, or move to read replicas

**No Background Job System:**
- Current capacity: Synchronous generation only
- Limit: Long AI responses block thread; users wait
- Scaling path: Implement background job queue for non-real-time content generation

## Dependencies at Risk

**@google/generative-ai:**
- Risk: SDK version 0.12.0 is pre-release; breaking changes likely
- Impact: `generateWithGemini()` would break
- Migration plan: Monitor releases; use adapter pattern to isolate SDK calls

**next-auth Credentials Provider:**
- Risk: Credentials provider is deprecated in newer auth patterns; v5 changes
- Impact: Entire authentication system
- Migration plan: Consider moving to OAuth providers (GitHub, Google) for easier auth

**openai SDK:**
- Risk: Frequent major version changes; v4→v5 breaking changes likely
- Impact: `generateWithOpenAI()` would break
- Migration plan: Keep version pinned; use adapter pattern

## Missing Critical Features

**No Input Validation:**
- Problem: No Zod schemas for request validation; only basic field existence check
- Blocks: Safe multi-tenant usage, API stability

**No Structured Logging:**
- Problem: `console.error` only; no error aggregation or monitoring
- Blocks: Production debugging, error analytics

**No CORS Configuration:**
- Problem: Default Next.js CORS behavior; no explicit origin control
- Blocks: Deployment behind reverse proxy, mobile app integration

**No Database Migrations:**
- Problem: Schema changes pushed via `prisma db push` without migration files
- Blocks: Schema rollback, multi-environment deployment

## Test Coverage Gaps

**No Unit Tests:**
- What's not tested: `lib/ai.ts` (AI generation logic), `lib/prisma.ts` (DB connection), all API routes
- Files: `lib/ai.ts`, `app/api/generate/route.ts`, `app/api/history/route.ts`
- Risk: Bugs in AI response parsing, database queries go undetected
- Priority: High

**No Component Tests:**
- What's not tested: Generate form submission, Dashboard rendering, Error display
- Files: `app/generate/page.tsx`, `app/dashboard/page.tsx`
- Risk: UI breaks silently, broken user flows
- Priority: High

**No API Integration Tests:**
- What's not tested: End-to-end API flow, Auth → Generate → Save
- Files: `app/api/` directory
- Risk: Breaking changes in one route affect others without detection
- Priority: Medium

**No AI Provider Integration Tests:**
- What's not tested: Real API calls to OpenAI/Gemini with valid/invalid responses
- Files: `lib/ai.ts`
- Risk: AI SDK updates break response parsing
- Priority: Medium

---

*Concerns audit: 2026-07-18*
