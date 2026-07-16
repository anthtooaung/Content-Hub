---
name: add-component
description: Create a reusable React component with Tailwind styling
---

# Add Component

Create a new reusable component in the `components/` directory.

## Steps

1. Create `components/{component-name}.tsx`
2. Define props interface with `ComponentProps` suffix (e.g., `ButtonProps`)
3. Use `React.forwardRef` for components that need ref forwarding
4. Use `cn()` from `@/lib/utils` (clsx + tailwind-merge) for conditional classes
5. Export as default

## Conventions

- Import icons from `lucide-react`
- Use Tailwind utility classes, avoid inline styles
- Keep components small and focused on one responsibility
- Use `cn()` for merging Tailwind classes conditionally
- Follow existing patterns in `app/generate/page.tsx` for button/card styling
