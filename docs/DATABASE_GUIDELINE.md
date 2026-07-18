# Database Guideline — Content-Hub

A practical guide for developers: what each table does, when to use it, and how they work together.

> **Setup:** Run `npx prisma migrate dev` to create all tables. No manual SQL needed.

---

## Quick Overview

```
users ─────────┬──► social_connections ──► published_posts
               │
               ├──► businesses
               │        │
               ├──► content_generations
               │        │
               │        └──► ai_responses ──┬──► published_posts
               │                            │
               └──► saved_posts ◄───────────┘
```

---

## Tables & Their Duties

### 1. `users` — Who is using the app

| Duty | Details |
|---|---|
| **What it stores** | User accounts — email, name, avatar, hashed password, login method |
| **When to use** | User signup, login, profile display, profile updates |
| **Auth role** | Holds `password_hash` (bcrypt) for email/password users. OAuth-only users have `password_hash = NULL` |

**Key tasks:**
- ✅ Create a new user on signup (email/password or OAuth)
- ✅ Verify email/password on login (compare bcrypt hash)
- ✅ Display user profile info (name, avatar)
- ✅ Check `primary_login_provider` to know how the user signed up
- ✅ Check `email_verified` before allowing email/password login

**Example queries:**
```ts
// Signup
await prisma.users.create({ data: { email, name, password_hash, primary_login_provider: 'email' } })

// Find user for login
await prisma.users.findUnique({ where: { email } })
```

---

### 2. `social_connections` — Linked OAuth accounts

| Duty | Details |
|---|---|
| **What it stores** | OAuth provider accounts (Google, Facebook, TikTok, Instagram) with tokens |
| **When to use** | OAuth login, connecting social accounts for posting, token refresh |
| **Dual purpose** | `used_for_login = true` → login identity. `used_for_posting = true` → auto-post authorization |

**Key tasks:**
- ✅ Store OAuth tokens after Google/Facebook/TikTok login
- ✅ Link a Facebook Page or Instagram Business account for auto-posting
- ✅ Check `is_active` before using a connection
- ✅ Refresh expired tokens (check `token_expires_at`)
- ✅ Find the right connection when auto-posting (`used_for_posting = true` + `platform`)

**Example queries:**
```ts
// Save OAuth login
await prisma.social_connections.create({
  data: { user_id, provider: 'google', provider_user_id, access_token, used_for_login: true }
})

// Find posting connection for Facebook
await prisma.social_connections.findFirst({
  where: { user_id, provider: 'facebook', used_for_posting: true, is_active: true }
})
```

---

### 3. `businesses` — Reusable brand profiles

| Duty | Details |
|---|---|
| **What it stores** | Business name, industry, target audience |
| **When to use** | When generating content — gives the AI context about the brand |
| **Soft delete** | Uses `deleted_at` instead of actual deletion to preserve analytics history |

**Key tasks:**
- ✅ Create/update business profiles in user settings
- ✅ Attach a business to a content generation request (optional)
- ✅ Provide AI with brand context for better content generation
- ✅ Soft delete with `deleted_at` (don't hard delete)

**Example queries:**
```ts
// Create a business
await prisma.businesses.create({
  data: { user_id, business_name: 'My Coffee Shop', industry: 'Food & Beverage', target_audience: 'Coffee lovers aged 20-40' }
})

// List user's active businesses
await prisma.businesses.findMany({ where: { user_id, deleted_at: null } })
```

---

### 4. `content_generations` — The user's request to AI

| Duty | Details |
|---|---|
| **What it stores** | What the user asked the AI to generate — platform, tone, prompt, and whether an image was attached |
| **When to use** | When the user submits a content generation form |
| **Auto-post logic** | `auto_post_requested` determines what happens after generation |

**Key tasks:**
- ✅ Record every generation request (history)
- ✅ Track generation status: `pending` → `processing` → `completed` / `failed`
- ✅ Determine auto-post behavior:
  - `auto_post_requested = false` → save as draft only
  - `auto_post_requested = true` → generate AND auto-post

**Example queries:**
```ts
// Create a generation request
await prisma.content_generations.create({
  data: { user_id, platform: 'instagram', tone: 'casual', prompt: 'Post about our new menu', image_url: 'https://...', auto_post_requested: true, status: 'pending' }
})

// Get user's generation history
await prisma.content_generations.findMany({
  where: { user_id },
  include: { ai_responses: true },
  orderBy: { created_at: 'desc' }
})
```

---

### 5. `ai_responses` — What the AI generated

| Duty | Details |
|---|---|
| **What it stores** | The actual generated post text, hashtags, CTA, and which AI model was used |
| **When to use** | After the AI generates content — store the result here |
| **Multiple responses** | One `content_generation` can have many `ai_responses` (for "Rewrite" / regeneration) |

**Key tasks:**
- ✅ Store AI-generated content (post body, hashtags, CTA)
- ✅ Track which AI model was used and token usage
- ✅ Manage content lifecycle: `draft` → `ready_to_post` → `posted` / `failed`
- ✅ Support regeneration — each rewrite creates a new `ai_responses` row

**Example queries:**
```ts
// Save AI response
await prisma.ai_responses.create({
  data: { content_generation_id, generated_content: '...', hashtags: ['#coffee', '#morning'], call_to_action: 'Visit us today!', ai_model: 'gemini-2.5-pro', tokens_used: 150, status: 'draft' }
})

// Update status after auto-post
await prisma.ai_responses.update({ where: { id }, data: { status: 'posted' } })
```

---

### 6. `published_posts` — Auto-post audit trail

| Duty | Details |
|---|---|
| **What it stores** | Record of every auto-post attempt — what was posted, where, and whether it succeeded |
| **When to use** | After the backend calls the Facebook/Instagram API to publish |
| **Backend only** | Users can view these, but only the backend creates/updates them |

**Key tasks:**
- ✅ Log every auto-post attempt (success or failure)
- ✅ Store the `external_post_id` returned by the platform API
- ✅ Snapshot `caption_used` and `image_url` (in case the draft is edited later)
- ✅ Record `error_message` on failure (expired token, API rejection, etc.)
- ✅ Show publish history to the user

**Example queries:**
```ts
// Log a publish attempt
await prisma.published_posts.create({
  data: { user_id, ai_response_id, social_connection_id, platform: 'instagram', caption_used: '...', image_url: '...', status: 'pending' }
})

// Update after API call
await prisma.published_posts.update({
  where: { id },
  data: { status: 'posted', external_post_id: '12345', posted_at: new Date() }
})
```

---

### 7. `saved_posts` — User bookmarks / favorites

| Duty | Details |
|---|---|
| **What it stores** | Bookmarked AI responses that the user wants to keep or revisit |
| **When to use** | When the user stars/favorites a generated post |
| **Simple** | Just a link between a user and an AI response with optional title/notes |

**Key tasks:**
- ✅ Bookmark a generated post
- ✅ Add custom title and notes to a bookmark
- ✅ Toggle `is_favorite` for starred items
- ✅ List all saved/favorited posts for a user

**Example queries:**
```ts
// Save a post
await prisma.saved_posts.create({
  data: { user_id, ai_response_id, title: 'Great coffee post', is_favorite: true }
})

// Get user's favorites
await prisma.saved_posts.findMany({
  where: { user_id, is_favorite: true },
  include: { ai_response: true },
  orderBy: { created_at: 'desc' }
})
```

---

## End-to-End Flow

```
1. User signs up        →  users (create)
2. Links Facebook       →  social_connections (used_for_posting = true)
3. Submits prompt       →  content_generations (status: pending)
   + attaches image     →  auto_post_requested = true
4. AI generates         →  ai_responses (status: draft)
5. Backend checks auto_post_requested:
   ├─ false → stays as draft (user reviews later)
   └─ true  → calls Meta API
              ├─ success → published_posts (status: posted)
              └─ failure → published_posts (status: failed, error_message)
6. User bookmarks       →  saved_posts
```

---

## Setup Commands

```bash
# First time — create tables
npx prisma migrate dev --name init

# After schema changes — create new migration
npx prisma migrate dev --name describe_the_change

# Generate Prisma Client (after any schema change)
npx prisma generate

# View data in browser
npx prisma studio
```
