# Phase 1: Landing & Design Foundation - Context

**Gathered:** 2026-07-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Product-first landing page with design tokens, navigation, and responsive layout. Includes auth flow (signup/login/logout) with protected routes. Establishes the visual foundation that all subsequent phases build on.

</domain>

<decisions>
## Implementation Decisions

### Visual Design System
- **D-01:** Blue primary (#2563EB) for AI actions, slate surfaces (#F8FAFC page, #FFFFFF cards)
- **D-02:** Inter typeface, 8px-based spacing scale. Headings 600–700 weight, body 400, UI controls 500–600
- **D-03:** Max-width 1200px (landing) / 1440px (app). Centered content. 32px horizontal padding desktop, 16px mobile
- **D-04:** Subtle transitions (150ms fast, 225ms panel). Hover lifts on cards. Focus rings (3px blue glow)
- **D-05:** No heavy gradients, glassmorphism, or chatbot-style UI — calm, professional aesthetic

### Landing Page Layout
- **D-06:** Product-first hero: two-column layout (1.1fr text + 0.9fr mockup), centered vertically
- **D-07:** Hero mockup shows the generate form UI — static HTML/CSS matching sketch exactly
- **D-08:** How-it-works: 3-column grid with numbered step circles (48px, primary-soft bg, primary text)
- **D-09:** Testimonials: 3-column grid with placeholder quotes, italic text, left-aligned
- **D-10:** Site header: flex layout, logo left, nav + CTA right. Footer: border-top, centered text

### Authentication Flow
- **D-11:** Separate pages for login and signup (not modals) — standard Next.js pattern
- **D-12:** Email + password fields only — OAuth out of scope for hackathon
- **D-13:** Unauthenticated users accessing /generate or /dashboard redirect to /login
- **D-14:** After login, redirect to /generate (not back to landing)

### Tailwind Integration
- **D-15:** Use CSS custom properties for design tokens, referenced in Tailwind config
- **D-16:** Keep existing Tailwind setup, extend with project-specific tokens

### Claude's Discretion
- Auth page styling, form validation UX, error states, loading states during auth
- Footer content (copyright text, links)
- Responsive breakpoint behavior for hero mockup

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `.claude/skills/sketch-findings-content-hub/SKILL.md` — Validated design decisions, palette, typography, spacing
- `.claude/skills/sketch-findings-content-hub/references/page-layout-navigation.md` — Hero layout, dashboard layout, header/footer CSS patterns
- `.claude/skills/sketch-findings-content-hub/references/core-flow-forms.md` — Form controls, wizard progress, result cards (for future phases)
- `.claude/skills/sketch-findings-content-hub/references/loading-state-transitions.md` — Loading overlay, skeleton patterns (for future phases)
- `.claude/skills/sketch-findings-content-hub/sources/themes/default.css` — Winning theme file with design tokens

### Requirements
- `.planning/REQUIREMENTS.md` — LAND-01 through LAND-05, DES-01, DES-02, AUTH-01 through AUTH-05
- `.planning/ROADMAP.md` — Phase 1 success criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/layout.tsx` — Root layout with Inter font already configured, can extend for auth pages
- `app/page.tsx` — Current landing page (default Next.js template), full replacement needed
- `app/globals.css` — Current CSS, will be replaced with design token system

### Established Patterns
- Next.js 14 App Router with TypeScript
- Tailwind CSS with `clsx` + `tailwind-merge` for conditional classes
- NextAuth.js v4 with Credentials provider and JWT strategy
- Prisma singleton pattern in `lib/prisma.ts`

### Integration Points
- `app/api/auth/[...nextauth]/route.ts` — Existing NextAuth config, extend for signup
- `app/generate/page.tsx` — Protected route, will need auth guard
- `app/dashboard/page.tsx` — Protected route, will need auth guard

</code_context>

<specifics>
## Specific Ideas

User wants to build first with React — minimal discussion, focus on implementation. Design decisions already locked from 4 sketch sessions.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 1-Landing & Design Foundation*
*Context gathered: 2026-07-18*
