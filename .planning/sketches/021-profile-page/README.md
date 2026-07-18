---
sketch: 021
name: profile-page
question: "How should the profile page display user info, ticket balance, and reset timer?"
winner: "B"
tags: [profile, tickets, account, navigation]
---

# Sketch 021: Profile Page

## Design Question
How should the profile page layout present the back button, user info, ticket balance with countdown, and connected accounts?

## How to View
open .planning/sketches/021-profile-page/index.html

## Variants
- **A: Card-Based** — Back button top-left, profile avatar/name card, circular progress ticket card with stats + reset timer, usage info, connected accounts. Clean, focused single-column.
- **B: Dashboard Bar** — Back button with label "Back to Generate", full-width profile header, horizontal progress bar with 12/15 counter, detailed stats row (available/used/generations-left), reset timer with next-refresh time, low-ticket warning banner. Data-dense.
- **C: Split Layout** — Two-column grid: left = centered profile card with connected accounts, right = large ticket number with bar + mini stats + timer. Compact, parallel information.

## What to Look For
- Does the circular progress (A) feel more satisfying than the horizontal bar (B/C)?
- Is the low-ticket warning (B) useful or alarming?
- Does the split layout (C) feel balanced or cluttered on desktop?
- Is "Back to Generate" (B) better than just "Back" (A/C)?
- How does each feel at mobile width (375px)?
