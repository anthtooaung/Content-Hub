# Project Flow — Content Hub

> End-to-end user journey, data flow, and feature pipeline for the AI Social Media Content Generator.

## Overview

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Landing     │───▶│  Generate    │───▶│  AI Engine   │───▶│  Results     │
│  Page (/)    │    │  Form        │    │  (OpenAI /   │    │  Display     │
│              │    │  (/generate) │    │   Gemini)    │    │              │
└─────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
                         │                                        │
                         │              ┌──────────────┐          │
                         └─────────────▶│  Save to DB  │◀─────────┘
                                        │  (Optional)  │
                                        └──────┬───────┘
                                               │
                                        ┌──────▼───────┐
                                        │  Dashboard   │
                                        │  (/dashboard)│
                                        └──────────────┘
```

---

## Page Routes

| Route | File | Type | Purpose |
|-------|------|------|---------|
| `/` | `app/page.tsx` | Server Component | Landing page with feature navigation |
| `/generate` | `app/generate/page.tsx` | Client Component | Content generation form |
| `/dashboard` | `app/dashboard/page.tsx` | Client Component | Saved content history viewer |

---

## API Routes

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/generate` | POST | No | Generate content via AI |
| `/api/history` | GET | Yes | Fetch user's saved content (last 50) |
| `/api/history` | POST | Yes | Save generated content to DB |
| `/api/auth/[...nextauth]` | GET/POST | — | NextAuth.js authentication |

---

## Feature Flow

### 1. Landing Page (`/`)

```
User arrives
    │
    ├──▶ Sees hero section + 4 feature cards
    │
    ├──▶ Clicks "Get Started" or "Generate Posts" card
    │
    └──▶ Navigates to /generate
```

**Cards:**
- ✅ Generate Posts → links to `/generate`
- 🔗 Smart Hashtags → placeholder (`#`)
- 🔗 Campaign Ideas → placeholder (`#`)
- 🔗 Content History → placeholder (`#`)

---

### 2. Content Generation (`/generate`)

```
┌─────────────────────────────────────────────────────────┐
│  FORM FIELDS                                            │
├─────────────────────────────────────────────────────────┤
│  Business Type *  [text input]                          │
│  Platform *       [select: Twitter|Instagram|LinkedIn   │
│                    |Facebook|TikTok]                    │
│  Tone *           [select: Professional|Casual|Funny    │
│                    |Inspirational|Educational           │
│                    |Promotional]                        │
│  Topic            [text input, optional]                │
│  Keywords         [text input, optional, comma-sep]     │
├─────────────────────────────────────────────────────────┤
│  [Generate Content]  (disabled until businessType set)  │
└─────────────────────────────────────────────────────────┘
```

**Flow:**
1. User fills form fields
2. Clicks "Generate Content"
3. Client sends `POST /api/generate` with JSON body
4. Server validates required fields (`businessType`, `platform`, `tone`)
5. Server selects AI provider based on env vars
6. AI returns structured JSON response
7. Client renders: post, hashtags, caption, CTA
8. User can copy post or hashtags to clipboard

**Output Display:**
```
┌──────────────────────────────────────┐
│  📝 Generated Post                   │
│  ┌──────────────────────────────┐    │
│  │  [post text]                 │    │
│  └──────────────────────────────┘    │
│  [Copy Post]                         │
├──────────────────────────────────────┤
│  #️⃣ Hashtags                         │
│  #tag1  #tag2  #tag3  #tag4          │
│  [Copy Hashtags]                     │
├──────────────────────────────────────┤
│  📄 Caption                          │
│  [caption text]                      │
├──────────────────────────────────────┤
│  📢 Call to Action                   │
│  [CTA text]                          │
└──────────────────────────────────────┘
```

---

### 3. AI Generation Pipeline

```
                    POST /api/generate
                           │
                           ▼
                    ┌──────────────┐
                    │  Validate    │
                    │  Required    │
                    │  Fields      │
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
     ┌─────────────────┐      ┌─────────────────┐
     │ OPENAI_API_KEY  │      │ GEMINI_API_KEY  │
     │   is set?       │      │   is set?       │
     └────────┬────────┘      └────────┬────────┘
              │ YES                    │ YES
              ▼                        ▼
     ┌─────────────────┐      ┌─────────────────┐
     │  OpenAI         │      │  Gemini         │
     │  gpt-3.5-turbo  │      │  gemini-pro     │
     └────────┬────────┘      └────────┬────────┘
              │                        │
              └───────────┬────────────┘
                          │
                          ▼
                 GeneratedContent
                 {post, hashtags, caption, callToAction}
```

**Provider Selection Logic:**
- Environment-variable based, NOT failure-based
- OpenAI is tried first if its key exists
- Gemini is tried only if OpenAI key is absent
- No automatic failover within a single request

**Prompt sent to both providers:**
```
Generate a social media post for a {businessType} business on {platform}.
Tone: {tone}
Topic: {topic}        ← only if provided
Keywords: {keywords}  ← only if provided

Please provide:
1. A engaging post (under 280 characters for Twitter, longer for other platforms)
2. 5-10 relevant hashtags
3. A caption
4. A call-to-action

Format the response as JSON with these fields: post, hashtags, caption, callToAction
```

**Output Interface:**
```typescript
interface GeneratedContent {
  post: string;       // The social media post text
  hashtags: string[]; // Array of hashtag strings
  caption: string;    // Platform caption
  callToAction: string; // CTA text
}
```

---

### 4. Saving Content

```
    ┌──────────────────────┐
    │  Generated Content   │
    │  (from /generate)    │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │  POST /api/history   │
    │  (requires auth)     │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │  Content Model       │
    │  - userId (FK)       │
    │  - platform          │
    │  - tone              │
    │  - topic             │
    │  - post              │
    │  - hashtags          │
    │  - caption           │
    │  - callToAction      │
    │  - isFavorite        │
    └──────────────────────┘
```

**Save Request Body:**
```json
{
  "platform": "Twitter",
  "tone": "Professional",
  "topic": "Product Launch",
  "post": "Excited to announce...",
  "hashtags": ["#launch", "#new"],
  "caption": "Check out our new product...",
  "callToAction": "Shop now at..."
}
```

**Status:** ⚠️ Endpoint exists but **no UI triggers it** — the generate page lacks a save button.

---

### 5. Dashboard History (`/dashboard`)

```
User navigates to /dashboard
           │
           ▼
    ┌──────────────────────┐
    │  GET /api/history    │
    │  (requires auth)     │
    └──────────┬───────────┘
               │
     ┌─────────┴─────────┐
     │                   │
     ▼                   ▼
  401 Unauthorized     200 OK
     │                   │
     ▼                   ▼
  Empty state        Content cards
  (no auth error)    (up to 50 items)
```

**Content Card Display:**
```
┌──────────────────────────────────────┐
│  [Twitter]  [Professional]           │
│  Posted: Jan 15, 2026                │
├──────────────────────────────────────┤
│  Excited to announce our new...      │
├──────────────────────────────────────┤
│  #launch #newproduct #tech           │
├──────────────────────────────────────┤
│  Check out our new product...        │
└──────────────────────────────────────┘
```

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│  NextAuth.js Configuration                              │
├─────────────────────────────────────────────────────────┤
│  Provider: CredentialsProvider (email + password)       │
│  Strategy: JWT (not database sessions)                  │
│  Adapter: PrismaAdapter (User, Account, Session tables) │
├─────────────────────────────────────────────────────────┤
│  Custom pages:                                          │
│    signIn → /auth/signin  ⚠️ NOT YET CREATED           │
└─────────────────────────────────────────────────────────┘
```

**Session Flow:**
1. User signs in via `/auth/signin` (not yet built)
2. NextAuth validates credentials against DB
3. JWT token created with `user.id`
4. Token stored in cookie
5. API routes check session via `getServerSession(authOptions)`

**Status:** ⚠️ Auth UI not implemented — no sign-in, sign-up, or sign-out pages.

---

## Database Schema

### Entity Relationships

```
┌──────────┐       ┌──────────────┐
│  User    │1────*│  Account     │
│          │       │  (OAuth)     │
│          │1────*│  Session     │
│          │       │  (Auth)      │
│          │1────*│  Content     │
│          │       │  (Posts)     │
└──────────┘       └──────────────┘
```

### Content Model

| Field | Type | Notes |
|-------|------|-------|
| id | String | `@id @default(cuid())` |
| userId | String | FK → User, cascade delete |
| platform | String | Indexed |
| tone | String | — |
| topic | String? | Optional |
| post | String | `@db.Text` |
| hashtags | String[] | PostgreSQL array |
| caption | String | `@db.Text` |
| callToAction | String? | Optional |
| isFavorite | Boolean | Default: `false`, no UI yet |
| createdAt | DateTime | Indexed |
| updatedAt | DateTime | Auto-updated |

**Indexes:** `userId`, `platform`, `createdAt`

---

## Known Gaps

| Gap | Status | Priority |
|-----|--------|----------|
| No sign-in/sign-up UI | 🔴 Missing | High |
| No save button on generate page | 🔴 Missing | High |
| No password hashing in auth | 🔴 Missing | High |
| No route protection (middleware) | 🟡 Partial | Medium |
| No AI failover (env-var only) | 🟡 Partial | Medium |
| No favorite/unfavorite UI | 🟡 Partial | Low |
| No reusable components | 🟡 Technical debt | Low |
| Landing page placeholder cards | 🟢 Cosmetic | Low |

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | JWT signing secret |
| `NEXTAUTH_URL` | Yes | App base URL for auth callbacks |
| `OPENAI_API_KEY` | One required | OpenAI API access |
| `GEMINI_API_KEY` | One required | Google Gemini API access |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | NextAuth.js v4 |
| AI (Primary) | OpenAI gpt-3.5-turbo |
| AI (Fallback) | Google Gemini gemini-pro |
| Icons | Lucide React (unused) |
