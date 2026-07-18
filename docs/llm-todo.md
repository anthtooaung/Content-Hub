# Content Generation AI Integration Checklist

Integrating AI-powered content generation into Content-Hub's existing design system and architecture.

---

## Design System Reference

All new components must follow these Content-Hub conventions:

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#2563EB` | Buttons, active states, focus rings |
| `surface` / `surface-subtle` | `#FFFFFF` / `#F1F5F9` | Cards, inputs, backgrounds |
| `border` / `border-strong` | `#E2E8F0` / `#CBD5E1` | Separators, input borders |
| `borderRadius.control` | `10px` | Buttons, inputs, selects |
| `borderRadius.card` | `12px` | Content cards |
| `borderRadius.panel` | `16px` | Large containers, modals |
| `shadow.card` | `0 4px 20px rgba(15,23,42,0.06)` | Cards at rest |
| `shadow.modal` | `0 20px 50px rgba(15,23,42,0.16)` | Modals, overlays |

**Patterns to follow:**
- Page wrapper: `<AppLayout>` → centered `max-w-[860px]` → `px-8 py-8`
- Section headers: uppercase `text-[11px]` label + `<div className="h-px flex-1 bg-border" />`
- Buttons: `rounded-control bg-primary text-white` with `hover:bg-primary-600 hover:shadow-[0_4px_16px_rgba(37,99,235,0.3)]`
- Alternate buttons: `rounded-control border-2 border-primary-200 bg-primary-50 text-primary`
- Inputs: `h-11 w-full rounded-control border border-border-strong px-3.5 text-sm outline-none focus:border-primary focus:shadow-focus`
- Loading skeletons: pulse animation on `bg-border` blocks
- Icons: `lucide-react`
- Conditional classes: `clsx()` from `clsx` package

---

## Phase 1: AI Infrastructure

| # | Task | File | Action | Notes |
|---|------|------|--------|-------|
| 1.1 | Install packages: `ai`, `@ai-sdk/openai`, `@ai-sdk/groq`, `zod` | `package.json` | Modify | Keep existing `openai` and `@google/generative-ai` as secondary fallback |
| 1.2 | Create `lib/generation-prompts.ts` — platform-specific guidelines, emotion/age constants, `buildSystemPrompt()`, `buildStyleSuggestionPrompt()` | `lib/generation-prompts.ts` | Create | Per-platform hashtag counts, tone rules, CTA styles. Per-age language guidelines. Emotion-to-tone mapping. |
| 1.3 | Create `lib/validation.ts` — Zod schemas for generate request, style request | `lib/validation.ts` | Create | `generateRequestSchema` (businessName, platform, emotion, audienceAge, prompt, style?), `styleRequestSchema` (platform) |
| 1.4 | Rewrite `lib/ai.ts` — add `generateStructured<T>()` using Vercel AI SDK with Zod output schemas. Keep existing `generateWithOpenAI()` and `generateWithGemini()` as legacy fallbacks | `lib/ai.ts` | Rewrite | 4-tier provider chain: OpenRouter primary → OpenRouter fallback → Groq primary → Groq fallback. 30s timeout, 1 retry per provider. Returns `{ output, model }`. |

---

## Phase 2: API Routes

| # | Task | File | Action | Notes |
|---|------|------|--------|-------|
| 2.1 | Create style suggestions endpoint | `app/api/generate/styles/route.ts` | Create | POST. Auth required. Zod validates `{ platform }`. Calls `generateStructured()` with `buildStyleSuggestionPrompt()`. Returns `{ styles: [{ name, description, hook }], model }`. |
| 2.2 | Rewrite generate endpoint | `app/api/generate/route.ts` | Rewrite | POST. Auth required. Zod validates full request. `buildSystemPrompt()` for context. Two parallel `generateStructured()` calls via `Promise.all()` for dual variations. Auto-save both to `Content` model. Returns `{ results: [{ id, content, hashtags, cta, model }] }`. |

---

## Phase 3: UI Components (Content-Hub Style)

All components use Content-Hub's design tokens: `rounded-control`, `rounded-panel`, `bg-primary`, `border-border`, `shadow-card`, etc.

### 3.1 Style Suggestions Panel

Create `components/StyleSuggestions.tsx`

- **Purpose**: Step between platform selection and form — shows AI-suggested trending content styles
- **Props**: `{ platform: string; onSelectStyle: (style: ContentStyle) => void; onSkip: () => void }`
- **Layout**: Centered card (`max-w-[640px] mx-auto`), section header with divider
- **States**:
  - Loading: skeleton card with 3 pulse blocks + "Finding trending styles…" text
  - Error: `bg-warning-soft border border-warning` banner with retry
  - Loaded: 3 clickable cards stacked vertically, each showing name, description, hook
  - Each card: `rounded-panel border border-border bg-surface p-5 hover:border-border-strong hover:shadow-card cursor-pointer transition-all`
- **Skip button**: `rounded-control border-2 border-primary-200 bg-primary-50 text-primary` (Content-Hub's secondary button style)
- **Model badge**: `text-xs text-text-muted font-mono` below the cards

### 3.2 Platform Picker (optional enhancement)

The existing form already has platform toggle buttons. Consider adding a dedicated platform-first step:
- If used, create `components/PlatformPicker.tsx`
- Two large cards side by side (Facebook, TikTok)
- Card style: `rounded-panel border border-border bg-surface p-6 hover:border-primary hover:bg-primary-50 cursor-pointer transition-all`
- Use existing platform colors: `bg-tiktok`, `bg-instagram`, `bg-facebook` for dot indicators

### 3.3 Refactor Generate Page

Modify `app/generate/page.tsx`

**Current flow**: form → loading → results
**New flow**: platform (optional) → style suggestions (optional) → form → loading → results

Changes:
1. Add wizard step `style` between platform and form
2. After platform selection, fetch style suggestions and render `StyleSuggestions` component
3. Style selection pre-fills form context and is sent to API
4. Add "Regenerate" button in results (re-runs with same params)
5. Add variation selection UI — two side-by-side result cards with "Choose" button
6. Show model name (`text-xs text-text-muted font-mono`) on each result card
7. All new UI elements use existing Content-Hub classes: `rounded-panel`, `bg-surface`, `border-border`, `shadow-card`, etc.

---

## Phase 4: Database

| # | Task | File | Action |
|---|------|------|--------|
| 4.1 | Add optional `style` field to `Content` model | `prisma/schema.prisma` | Modify |
| 4.2 | Add `emotion` and `audienceAge` fields to `Content` model (if not present) | `prisma/schema.prisma` | Modify |
| 4.3 | Run migration | CLI: `npx prisma migrate dev` | Execute |

---

## Phase 5: Wiring & Polish

| # | Task | File | Details |
|---|------|------|---------|
| 5.1 | Add env vars | `.env`, `.env.example` | `OPENROUTER_API_KEY`, `GROQ_API_KEY` (keep existing `OPENAI_API_KEY`, `GEMINI_API_KEY` as legacy) |
| 5.2 | Update `ContentRequest` interface | `lib/ai.ts` | Add `businessName`, `emotion`, `audienceAge`, `style` fields |
| 5.3 | Auto-save on generation | `app/api/generate/route.ts` | Save every generation to `Content` model via Prisma (no manual save needed) |
| 5.4 | Update `CLAUDE.md` | `CLAUDE.md` | Document new AI providers, Zod validation, generation flow |
| 5.5 | Test end-to-end | Manual | Verify: style suggestions load → form submits → dual variations render → choose works → copy works → save works → regenerate works |

---

## Implementation Order

```
1.4 → 1.2 → 1.3 → 1.1 → 2.2 → 2.1 → 4.1 → 4.2 → 4.3 → 3.1 → 3.3 → 5.x
```

1. **`lib/ai.ts`** first — everything depends on `generateStructured()`
2. **Prompts + validation** — required by API routes
3. **Install packages** — needed before any code runs
4. **API routes** — backend logic before UI
5. **DB migration** — schema before data
6. **UI components** — wire up after backend is ready
7. **Polish** — env vars, docs, testing

---

## What Changes vs social-ai

| Aspect | social-ai | Content-Hub (this plan) |
|--------|-----------|------------------------|
| Design system | Minimal (card, btn-primary, hashtag) | Full Content-Hub tokens (rounded-control, shadow-card, border-border, platform colors) |
| Layout | Simple flex column | Centered card layout with section dividers |
| Loading states | Plain text | Skeleton pulses with shimmer |
| Error states | Inline text | `bg-warning-soft` banners with retry |
| Buttons | Generic `btn-primary` | Content-Hub's `rounded-control bg-primary` with hover shadow |
| Provider chain | OpenRouter → Groq (no legacy) | Vercel AI SDK primary + existing OpenAI/Gemini as secondary fallback |
| Wizard | 3-step: platform → styles → form | 4-step: platform (optional) → styles (optional) → form → results |
| Variations | Always 2 | 2 per platform, side-by-side comparison |
