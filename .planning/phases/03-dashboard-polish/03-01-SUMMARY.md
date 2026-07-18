---
phase: 03-dashboard-polish
plan: 01
subsystem: data-layer
tags: [prisma, schema, database, save-flow, content-model]
requires: []
provides: [Content model, Save button]
affects: [prisma/schema.prisma, app/generate/page.tsx]
tech-stack: [next.js, prisma, postgresql, react, tailwind-css]
key-files:
  - prisma/schema.prisma
  - app/generate/page.tsx
  - app/api/history/route.ts
key-decisions:
  - Used String type for platform (not enum) because API sends capitalized values like "TikTok", "Instagram", "Facebook"
  - Added @db.Uuid to userId field to match users.id type for relation compatibility
  - Used @default(cuid()) for Content id instead of UUID to match plan specification
  - Added saving/saved state management with async POST to /api/history
  - Used clsx for conditional button styling with success colors when saved
requirements-completed: [DASH-03]
duration: ~10 min
completed: 2026-07-18
---

## Accomplishments

1. **Content model added to Prisma schema** — Added `Content` model with all required fields (id, userId, platform, tone, topic, post, hashtags, caption, callToAction, createdAt) and proper relations to users model. Added indexes on userId and createdAt for query performance.

2. **Database synced** — Ran `prisma db push` successfully, creating the Content table in PostgreSQL. Ran `prisma generate` to regenerate the Prisma client with the new model.

3. **Users model updated** — Added `contents Content[]` relation to the users model to enable bidirectional querying.

4. **Save button added to ResultCard** — Added Save button next to Copy button in each ResultCard component. Button handles three states: default ("Save"), saving ("Saving..."), and saved ("Saved" with checkmark). Uses POST to /api/history to persist content.

5. **Save flow implemented** — handleSave async function sends platform, post, hashtags, caption, and callToAction to the history API endpoint. Button disables during save and shows success state with green styling.

## Verification Results

| Check | Result |
|-------|--------|
| prisma db push | Success - database synced |
| prisma generate | Success - client regenerated |
| TypeScript (new code) | No errors introduced |
| Pre-existing TypeScript errors | 2 errors in lib/auth.ts and prisma/seed.ts (unrelated to this plan) |
| Content model in schema | Present with correct fields and relations |
| Save button in ResultCard | Present with proper state management |
| POST /api/history | Will create Content records with session.user.id |

## Deviations

None — plan executed exactly as specified.

## Self-Check

PASSED
