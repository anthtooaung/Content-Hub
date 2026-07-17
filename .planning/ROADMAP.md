# Roadmap: Content Hub

## Overview

Content Hub goes from existing scaffolded pages with default styling to a polished AI content generation tool. Three phases deliver an end-to-end user journey: landing page and design foundation, the core generation wizard with progress states, and a timeline dashboard with saved content history. Every phase builds on the previous, shipping a complete capability at each step.

## Phases

- [ ] **Phase 1: Landing & Design Foundation** - Product-first landing page with design tokens, navigation, and responsive layout
- [ ] **Phase 2: Content Generation Wizard** - End-to-end generate flow: form, loading overlay, result cards with copy buttons
- [ ] **Phase 3: Dashboard & Polish** - Saved content timeline, empty states, save-to-database, and final animation polish

## Phase Details

### Phase 1: Landing & Design Foundation
**Goal**: Users land on a professional, product-first page that immediately communicates what Content Hub does and can navigate to the generate flow
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: LAND-01, LAND-02, LAND-03, LAND-04, LAND-05, DES-01, DES-02, AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
**Success Criteria** (what must be TRUE):
  1. User sees a hero section with a real product mockup showing the generation interface within 3 seconds of landing
  2. User can scroll through a 3-step how-it-works section and testimonials without confusion
  3. User can sign up, log in, and log out with session persisting across browser refresh
  4. Unauthenticated users accessing /generate or /dashboard are redirected to the login page
  5. All pages render with consistent design tokens (blue primary, slate surfaces, Inter typeface) and respond correctly at 768px mobile breakpoint
**Plans**: TBD

Plans:
- [ ] 01-01: TBD

### Phase 2: Content Generation Wizard
**Goal**: Users can describe their campaign, select platforms, and get ready-to-post content with clear progress feedback and copy-to-clipboard functionality
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: GEN-01, GEN-02, GEN-03, GEN-04, GEN-05, GEN-06, GEN-07, DES-03, DES-04
**Success Criteria** (what must be TRUE):
  1. User can enter business name, campaign description, content goal, and tone, then select one or more platforms (TikTok, Instagram, Facebook)
  2. User sees a progress overlay with status messages and a progress bar while content is being generated
  3. Results display as cards with platform badges, post content, hashtags, CTAs, and a copy-to-clipboard button
  4. User can copy an entire post with one click and receives visual confirmation
  5. If a specific platform fails, the user sees an error card for that platform with a retry option while other results remain visible
**Plans**: TBD

Plans:
- [ ] 02-01: TBD

### Phase 3: Dashboard & Polish
**Goal**: Users can view and manage their saved content history in a timeline layout, with empty state guidance and polished interactions
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DES-05, DES-06
**Success Criteria** (what must be TRUE):
  1. User can save generated content and see it appear in a timeline grouped by date
  2. New users with no saved content see an encouraging empty state with a clear call-to-action to generate content
  3. Each saved item displays the platform badge, preview text, and creation date
  4. User can click a saved item to view the full content details
  5. Cards have hover lift effects, focus rings are visible for keyboard navigation, and platform-specific colors are applied correctly
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Landing & Design Foundation | 0/1 | Not started | - |
| 2. Content Generation Wizard | 0/1 | Not started | - |
| 3. Dashboard & Polish | 0/1 | Not started | - |
