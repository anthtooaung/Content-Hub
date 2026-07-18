---
sketch: 010
name: button-states
question: "How should buttons look in idle vs hover states?"
winner: B
tags: [buttons, interaction, states, color]
---

# Sketch 010: Button States

## Design Question
How should primary, secondary, and icon buttons look in idle state vs hover — specifically fixing the "washed out" appearance of secondary buttons that only show color on hover?

## How to View
open .planning/sketches/010-button-states/index.html

## Variants
- **A: Current** — Vibrant primary (bg-primary), neutral secondary (border + bg-surface), outline icon buttons. The "See how it works" button is gray until hovered.
- **B: All Vibrant** — Secondary buttons get blue tint in idle (bg-primary-soft + border-primary-border). Every button immediately signals "this is interactive and branded."
- **C: Tinted Border** — Secondary buttons get blue border only (border-primary-border), no fill. Hover fills with blue. A middle ground between A and B.

## What to Look For
- Do the secondary buttons in **B** feel too heavy / like primary buttons?
- Does **C**'s blue-border-only approach feel like enough visual signal in idle?
- Compare the "See how it works" button across all three — which feels most natural next to the vibrant "Try it now" primary?
- Check the icon buttons (Copy, Save, Saved) — which variant makes them feel most discoverable?
