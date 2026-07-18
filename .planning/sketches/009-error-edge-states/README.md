---
sketch: 009
name: error-edge-states
question: "How do failed generation, empty API keys, and network errors feel?"
winner: "C"
tags: [error, edge-case, failure, empty-state]
---

# Sketch 009: Error & Edge States

## Design Question
How do failed generation, empty API keys, and network errors feel?

## How to View
open .planning/sketches/009-error-edge-states/index.html

## Variants
- **A: Inline Banners** — Error/warning/info banners in context, form validation errors, partial failure state, rate limit indicator
- **B: Empty + Onboarding** — Empty dashboard with CTA, disabled form when no API key, network error
- **C: Full-Page Errors** — 404, server error with error ID, auth expired — dedicated error pages

## What to Look For
- Do errors feel helpful or hostile?
- Is the retry action always obvious?
- Does the partial failure state clearly communicate what worked and what didn't?
- Is the rate limit feel informative or punishing?
- Do empty states encourage action or feel like dead ends?
- Does the auth expired state feel calm, not alarming?
- How prominent is the "check status" option during server errors?
