---
sketch: 004
name: loading-transitions
question: "How do skeletons, progress, and state transitions feel?"
winner: "B"
tags: [loading, skeleton, transitions, polish]
---

# Sketch 004: Loading & Transitions

## Design Question
How do skeletons, progress, and state transitions feel?

## How to View
open .planning/sketches/004-loading-transitions/index.html

## Variants
- **A: Inline Skeleton** — Skeleton cards pulse in place, results fade in one by one
- **B: Progress Overlay** — Centered progress bar with status messages overlaying results
- **C: Progressive Reveal** — Platform results appear one at a time with entrance animation

## What to Look For
- Does the loading feel fast or slow (even if duration is the same)?
- Is the user informed about what's happening during the wait?
- How does error/partial failure feel?
- Which approach feels most polished and professional?
- Use the controls bar to cycle through Empty → Loading → Loaded → Error states
- Adjust the speed slider to test at different animation speeds
