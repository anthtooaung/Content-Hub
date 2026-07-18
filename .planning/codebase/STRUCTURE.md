# Codebase Structure

**Analysis Date:** 2026-07-18

## Directory Layout

```
Content-Hub/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes (RESTful endpoints)
│   │   ├── auth/                 # Authentication routes
│   │   │   └── [...nextauth]/    # NextAuth.js catch-all
│   │   │       └── route.ts      # Auth handler (58 lines)
│   │   ├── generate/             # Content generation
│   │   │   └── route.ts          # POST endpoint (38 lines)
│   │   └── history/              # Content history
│   │       └── route.ts          # GET/POST endpoint (61 lines)
│   ├── components/               # Page-specific components (currently empty)
│   ├── dashboard/                # Dashboard page
│   │   └── page.tsx              # Content management view (110 lines)
│   ├── generate/                 # Content generation page
│   │   └── page.tsx              # Generation form (192 lines)
│   ├── types/                    # Page-specific type definitions (currently empty)
│   ├── globals.css               # Global styles and Tailwind imports
│   ├── layout.tsx                # Root layout (23 lines)
│   └── page.tsx                  # Landing page (90 lines)
├── lib/                          # Shared libraries
│   ├── ai.ts                     # AI provider clients (78 lines)
│   └── prisma.ts                 # Prisma singleton (9 lines)
├── components/                   # Reusable UI components (currently empty)
├── prisma/                       # Database schema
│   └── schema.prisma             # PostgreSQL schema (76 lines)
├── types/                        # Global type definitions (currently empty)
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md           # Architecture overview
│   ├── PROJECT_FLOW.md           # Project workflow
│   └── decisions/                # Decision logs
├── .github/                      # GitHub configuration
│   ├── workflows/
│   │   ├── ci.yml                # CI pipeline
│   │   └── security.yml          # Security scanning
│   ├── ISSUE_TEMPLATE/           # Issue templates
│   ├── pull_request_template.md  # PR template
│   ├── dependabot.yml            # Dependency updates
│   └── CODEOWNERS                # Code ownership
├── .claude/                      # Claude Code configuration
│   ├── settings.json             # Tool and hook settings
│   └── settings.local.json       # Local overrides
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind customization
├── postcss.config.js             # PostCSS plugins
├── next.config.js                # Next.js configuration
├── .eslintrc.json                # ESLint rules
├── .gitignore                    # Git ignore rules
├── CLAUDE.md                     # Claude Code instructions
├── README.md                     # Project overview
└── SETUP.md                      # Development setup
```

## Directory Purposes

**app/:**
- Purpose: Next.js App Router with page and API routing
- Contains: Pages (server/client components), API routes, global styles, layout
- Key files: `app/page.tsx` (landing), `app/generate/page.tsx` (form), `app/dashboard/page.tsx` (history)

**app/api/:**
- Purpose: RESTful API endpoints
- Contains: Route handlers following file-system routing
- Key files: `app/api/generate/route.ts`, `app/api/history/route.ts`, `app/api/auth/[...nextauth]/route.ts`

**lib/:**
- Purpose: Shared business logic and utilities
- Contains: AI provider integrations, database client singleton
- Key files: `lib/ai.ts` (OpenAI/Gemini clients), `lib/prisma.ts` (database client)

**prisma/:**
- Purpose: Database schema and migrations
- Contains: Schema definition for PostgreSQL
- Key files: `prisma/schema.prisma` (User, Account, Session, VerificationToken, Content models)

**components/:**
- Purpose: Reusable UI components (currently empty)
- Contains: No files yet
- Planned: Shared components like buttons, forms, modals

**app/components/:**
- Purpose: Page-specific components (currently empty)
- Contains: No files yet
- Planned: Components used by specific pages

**types/:**
- Purpose: Global TypeScript type definitions (currently empty)
- Contains: No files yet
- Planned: Shared interfaces and types

**app/types/:**
- Purpose: Page-specific types (currently empty)
- Contains: No files yet

**docs/:**
- Purpose: Project documentation
- Contains: Architecture docs, workflow documentation, decisions
- Key files: `docs/ARCHITECTURE.md`, `docs/PROJECT_FLOW.md`

## Key File Locations

**Entry Points:**
- `app/page.tsx`: Landing page, root URL `/`
- `app/generate/page.tsx`: Content generation, `/generate`
- `app/dashboard/page.tsx`: Content dashboard, `/dashboard`

**Configuration:**
- `package.json`: Project metadata, dependencies, scripts
- `tsconfig.json`: TypeScript compiler options (target: ES5, strict mode)
- `tailwind.config.ts`: Custom colors (primary palette), content paths
- `next.config.js`: Experimental server components for AI packages
- `.eslintrc.json`: Linting rules (next/core-web-vitals)

**Core Logic:**
- `lib/ai.ts`: AI provider initialization and content generation functions
- `lib/prisma.ts`: Database client singleton with dev caching
- `app/api/generate/route.ts`: Main API endpoint for content generation
- `app/api/history/route.ts`: Content CRUD operations

**Data Schema:**
- `prisma/schema.prisma`: Complete database schema with relations and indexes

**Testing:**
- None yet. No test files found. Test configuration in package.json.

## Naming Conventions

**Files:**
- Pages: `page.tsx` (Next.js App Router convention)
- API Routes: `route.ts` (Next.js App Router convention)
- Libraries: lowercase with dots (`ai.ts`, `prisma.ts`)
- Configuration: `*.config.js/ts` or `*.config.json`
- Styles: `globals.css` for global, scoped CSS in components

**Directories:**
- Pages: Named after URL segments (`generate`, `dashboard`)
- API: Named after REST resources (`generate`, `history`, `auth`)
- Configuration: `.github`, `.claude`, `.planning`
- Documentation: `docs/`, `decisions/`

**Functions:**
- camelCase: `generateWithOpenAI`, `generateWithGemini`
- Prefix with action verb: `handleGenerate`, `fetchContent`
- React components: PascalCase (default export `Home`, `GeneratePage`, `DashboardPage`)

**Variables:**
- camelCase: `businessType`, `platform`, `content`
- React state: `useState` with descriptive names (`loading`, `result`, `content`)

**Types/Interfaces:**
- PascalCase: `ContentRequest`, `GeneratedContent`
- Descriptive: Names describe the data shape

**Database Models:**
- PascalCase, singular: `User`, `Account`, `Session`, `Content`
- Fields: camelCase in TypeScript, snake_case in PostgreSQL (Prisma handles mapping)

## Where to Add New Code

**New Page:**
- Primary code: `app/[pagename]/page.tsx`
- Add navigation link in `app/page.tsx`
- Add any shared components to `app/components/` or `components/`

**New API Route:**
- Route: `app/api/[resource]/route.ts`
- Follows REST convention (GET, POST, PUT, DELETE)
- Use `NextRequest`, `NextResponse` from `next/server`

**New Library/Service:**
- Shared service: `lib/[servicename].ts`
- Must export functions for use by API routes
- Place AI/client initialization patterns here

**New Component:**
- Reusable: `components/[componentname].tsx`
- Page-specific: `app/[page]/components/[componentname].tsx`
- Follow React functional component pattern

**New Type Definition:**
- Global types: `types/[typename].ts`
- Page-specific: `app/[page]/types/[typename].ts`
- Export interfaces and type aliases

**New API Provider:**
- Add initialization to `lib/ai.ts`
- Create generation function: `generateWith[Provider]()`
- Add provider selection logic to `app/api/generate/route.ts`

**Database Schema Changes:**
- Modify `prisma/schema.prisma`
- Run: `npm run prisma:generate` (regenerate client)
- Run: `npm run prisma:push` (push to database without migration)
- Run: `npm run prisma:migrate` (create migration file)

## Special Directories

**.next/:**
- Purpose: Next.js build output and cache
- Generated: Yes
- Committed: No (in .gitignore)

**node_modules/:**
- Purpose: npm dependencies
- Generated: Yes
- Committed: No (in .gitignore)

**.claude/:**
- Purpose: Claude Code configuration and worktrees
- Generated: Partially (settings.json manual, worktrees auto)
- Committed: Yes (settings.json)

**.github/:**
- Purpose: GitHub configuration and CI/CD
- Generated: No
- Committed: Yes

**docs/decisions/:**
- Purpose: Architecture Decision Records (ADRs)
- Generated: No
- Committed: Yes

**.planning/:**
- Purpose: Codebase analysis and planning documents
- Generated: Yes (by codebase mapper)
- Committed: Yes (for team reference)

## Import Patterns

**Path Aliases:**
- `@/` maps to root: Used in `lib/ai.ts`, `lib/prisma.ts`, API routes
- Example: `import { prisma } from '@/lib/prisma'`
- Configured in `tsconfig.json:22-24`

**Relative Imports:**
- Used within same directory: `import { authOptions } from '../auth/[...nextauth]/route'`
- Avoid `../../` chains — prefer `@/` alias

**External Imports:**
- Libraries imported by name: `next`, `react`, `next-auth`, `@prisma/client`, `openai`, `@google/generative-ai`
- Scoped to `lib/` files for external integrations

## File Size Guidelines

**Pages:** Target < 300 lines (currently `generate/page.tsx` at 192, `dashboard/page.tsx` at 110)

**API Routes:** Target < 100 lines (currently `history/route.ts` at 61, `generate/route.ts` at 38)

**Libraries:** Target < 100 lines (currently `ai.ts` at 78)

**If exceeding targets:** Extract logic to helper functions or separate modules.

---

*Structure analysis: 2026-07-18*
