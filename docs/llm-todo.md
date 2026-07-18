# Content Generation AI Integration Checklist (Revised)

Goal: swap the generation engine to OpenRouter/Groq via Vercel AI SDK with structured (Zod-validated) output. Zero UI changes — existing `/generate` page, request shape, and response shape stay exactly as they are.

---

## Contract (do not change)

**Request** (`POST /api/generate`, one call per platform, sent by `app/generate/page.tsx`):
```ts
{ businessType: string; platform: 'TikTok' | 'Instagram' | 'Facebook'; tone: string;
  emotion?: string; ageGroup?: string; topic?: string; keywords?: string[] }
```
`emotion` ids: joy, excitement, trust, inspiration, urgency, curiosity, pride, gratitude.
`ageGroup` ids: gen-alpha, gen-z, millennials, gen-x, boomers, all.

**Response** (flat, no wrapper):
```ts
{ post: string; hashtags: string[]; caption: string; callToAction: string;
  score: { readability, hashtagRelevance, ctaStrength, overall, grade, suggestions };
  model?: string }
```

---

## Phase 1: AI Infrastructure — done

- `lib/ai.ts`: `generateStructured<T>()` via Vercel AI SDK, pinned spec-v1-compatible versions (`ai@4.3.19`, `@ai-sdk/openai@0.0.72`, `@ai-sdk/groq@0.0.3`, `zod@^3.23.8`). 4-tier chain: OpenRouter gpt-4o-mini → OpenRouter deepseek-v4-flash → Groq gpt-oss-120b → Groq gpt-oss-20b. 30s timeout, 1 retry/tier.
- Legacy `generateWithOpenAI`/`generateWithGemini` kept as final safety net.

## Phase 2: Align prompts/validation/route to the real contract

| # | Task | File | Notes |
|---|------|------|-------|
| 2.1 | Fix `lib/generation-prompts.ts` | Modify | Match actual field names (`businessType`/`platform`/`tone`/`emotion`/`ageGroup`/`topic`) and actual emotion/ageGroup ids used by the UI. Drop `buildStyleSuggestionPrompt` (unused, no style-suggestions UI). |
| 2.2 | Fix `lib/validation.ts` | Modify | `generateRequestSchema` matches `ContentRequest`: `businessType`, `platform` enum `['TikTok','Instagram','Facebook']`, `tone`, `emotion?`, `ageGroup?`, `topic?`, `keywords?`. Drop `styleRequestSchema`. |
| 2.3 | Add engine adapter in `lib/ai.ts` | Modify | `generateWithAISDK(request: ContentRequest): Promise<GeneratedContent & { model: string }>` — builds prompt from `ContentRequest` via `buildSystemPrompt`, calls `generateStructured()` with a Zod schema matching `GeneratedContent`. |
| 2.4 | Revert `app/api/generate/route.ts` to original single-object contract | Modify | Same validation-then-generate-then-score-then-return flow as before. Provider order: `generateWithAISDK()` (OpenRouter/Groq, 4-tier) → on total failure, fall back to legacy `generateWithOpenAI`/`generateWithGemini` if those keys are set. Response stays flat `{ ...content, score, model? }`. |
| 2.5 | Delete `app/api/generate/styles/route.ts` | Delete | No wizard step consumes it; dead code otherwise. |

## Dropped from original plan

- Phase 3 (StyleSuggestions panel, PlatformPicker, wizard refactor) — not wanted, existing UI stays as-is.
- Phase 4 (DB fields for `style`/`emotion`/`audienceAge`) — not needed; existing flow never persisted those, `/api/history` save is manual and untouched.
- Dual-variation generation / `results[]` response — page.tsx does one platform per call already, in parallel client-side.

## Phase 5: Wiring & Polish

| # | Task | Notes |
|---|------|-------|
| 5.1 | Env vars | `OPENROUTER_API_KEY`, `GROQ_API_KEY` set. Keep `OPENAI_API_KEY`/`GEMINI_API_KEY` as legacy fallback. |
| 5.2 | Test end-to-end | Start dev server, generate content for each platform from the real UI, confirm cards render, score renders, copy/save still work. |
