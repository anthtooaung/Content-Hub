# Technology Stack

**Analysis Date:** 2026-07-18

## Languages

**Primary:**
- TypeScript ^5.4.0 - Full-stack Next.js application (both client and server components)
- React ^18.3.0 - UI rendering and client-side state management

**Secondary:**
- SQL (Prisma Schema) - Database schema definition at `prisma/schema.prisma`

## Runtime

**Environment:**
- Node.js 18+ (minimum) / 20 (CI/CD target)
- Next.js 14 App Router (full-stack framework)

**Package Manager:**
- npm (with `package-lock.json` lockfile)
- Lockfile present: Yes

## Frameworks

**Core:**
- Next.js ^14.2.0 - Full-stack React framework with App Router, API Routes, Server-Side Rendering
- React ^18.3.0 - UI library for component-based interfaces
- React DOM ^18.3.0 - Browser-specific React renderer

**Testing:**
- Vitest ^1.6.0 - Unit and integration testing framework (configured in package.json)
- @vitejs/plugin-react ^4.2.0 - Vite plugin for React component testing

**Build/Dev:**
- ESLint ^8.57.0 - Code linting with Next.js config (`eslint-config-next`)
- PostCSS ^8.4.0 - CSS processing for Tailwind
- Tailwind CSS ^3.4.0 - Utility-first CSS framework

## Key Dependencies

**Critical:**
- @prisma/client ^5.14.0 - Database ORM client for PostgreSQL connection
- prisma ^5.14.0 (dev) - Prisma CLI for migrations, schema generation
- next-auth ^4.24.0 - Authentication with Credentials Provider, JWT sessions, Prisma Adapter

**Infrastructure:**
- openai ^4.40.0 - OpenAI API client for GPT-3.5-turbo LLM generation
- @google/generative-ai ^0.12.0 - Google Gemini API client for fallback LLM generation

**UI/UX:**
- lucide-react ^0.378.0 - Icon library for React components
- clsx ^2.1.0 - Conditional class name utility
- tailwind-merge ^2.3.0 - Merge Tailwind classes without conflicts

## Configuration

**Environment:**
- `.env` file (not committed) - Database URL, API keys, NextAuth secret
- `.env.example` - Template with required variables documented
- Required vars: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `OPENAI_API_KEY` (optional), `GEMINI_API_KEY` (optional)

**Build:**
- `next.config.js` - Next.js config with experimental serverComponentsExternalPackages for OpenAI/Gemini SDKs
- `tsconfig.json` - TypeScript config (target ES5, strict mode, path aliases with `@/*`)
- `tailwind.config.ts` - Custom color palette (primary blue shades) and content paths
- `postcss.config.js` - PostCSS plugin config (tailwindcss, autoprefixer)
- `.eslintrc.json` - ESLint extends `next/core-web-vitals`

## Platform Requirements

**Development:**
- Node.js 18+ (local)
- PostgreSQL database (local or remote)
- API keys: At least one of OpenAI or Gemini
- NextAuth secret for JWT session signing

**Production:**
- Vercel deployment (configured for Next.js)
- PostgreSQL database (Vercel Postgres, Supabase, or external)
- Environment variables configured in Vercel dashboard

---

*Stack analysis: 2026-07-18*
