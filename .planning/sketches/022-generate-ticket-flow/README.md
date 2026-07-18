---
sketch: 022
name: generate-ticket-flow
question: "How should the generate page show ticket cost and low-ticket warnings?"
winner: "B"
tags: [generate, tickets, cost, warning, rate-limit]
---

# Sketch 022: Generate Page — Ticket Flow

## Design Question
How should the generate form show ticket cost, warn about low tickets, and handle the blocked state when tickets run out?

## How to View
open .planning/sketches/022-generate-ticket-flow/index.html

## Variants
- **A: Inline Badge** — Compact ticket badge in card header + thin progress bar below. Cost shown as a subtle line above the button. Clean, non-intrusive. The badge stays visible as a quick-glance indicator.
- **B: Warning Modal** — Same inline badge but low-state: amber warning banner at top, low-ticket bar, and a confirmation modal when clicking Generate with only 4 tickets left. Modal explains the consequence ("4 → 1 remaining") with Proceed/Cancel.
- **C: Blocked State** — When tickets hit zero: red banner, empty progress bar, disabled form fields and button, overlay countdown timer showing exact time until refresh. Form is visually present but completely blocked.

## What to Look For
- Is the inline badge (A) noticeable enough without being distracting?
- Does the warning modal (B) feel helpful or annoying?
- Does the blocked state (C) clearly communicate what happened and when it resolves?
- Does the cost line above the button feel natural or tacked on?
- How does the ticket bar feel at different fill levels (80% → 27% → 0%)?
