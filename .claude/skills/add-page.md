---
name: add-page
description: Scaffold a new Next.js App Router page with client/server component pattern
---

# Add Page

Scaffold a new Next.js App Router page at the given route path.

## Steps

1. Create the page directory under `app/` (e.g., `app/settings/page.tsx`)
2. Use `"use client"` directive if the page has interactivity (forms, state, event handlers)
3. Include basic Tailwind layout with the app's existing style patterns
4. Export a default component named after the route (e.g., `SettingsPage`)
5. Add a heading with the page name using the same card/section pattern as existing pages

## Conventions to follow

- Import icons from `lucide-react`
- Use `clsx` and `tailwind-merge` (`cn` utility) for conditional classes
- Match the existing page structure from `app/page.tsx` and `app/generate/page.tsx`
- Use `"use client"` for pages with useState, useEffect, or event handlers
