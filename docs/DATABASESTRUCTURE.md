# Database Structure — AI Social Media Content Generator

Full database structure for the project: table purposes, columns, relationships, RLS policies, and the self-managed authentication flow.

Core behavior this schema supports:
- A self-managed **`users`** table with **bcrypt-hashed passwords** for email/password signups and OAuth support for Google, Facebook, and TikTok.
- Login via **email/password, Google, Facebook, or TikTok** — all managed in the application's own database (no Supabase Auth dependency).
- Connecting **Facebook and Instagram** accounts for auto-posting (separate from login).
- **No image attached → generate content only**, saved as a draft.
- **Image attached → generate content AND auto-post it** to the connected platform.
- Persisted **drafts** so generated content isn't lost until the user publishes it.

A couple of implementation notes worth knowing going in:
- Passwords are hashed using **bcrypt** at the application layer before storing in `users.password_hash`. OAuth-only users have `password_hash = NULL`.
- OAuth login (Google, Facebook, TikTok) is handled by the application — your backend exchanges the OAuth authorization code for tokens and creates/matches a user record with the corresponding `social_connections` entry.
- Actually publishing to Facebook/Instagram (calling the Meta Graph API) is application logic — an Edge Function or backend job — not something the database does on its own. The tables below are what that job reads from and writes results back to.
- OAuth tokens are sensitive. Columns are typed `TEXT` for simplicity, but in production use application-level encryption rather than storing them in plaintext.

---

## 1. Table Reference

### Table: `users`
* **Purpose:** Self-managed user table that handles both email/password and OAuth signups. Stores core account info, hashed password, and login method.
* **Authentication approach:** Passwords are hashed with bcrypt at the application layer. OAuth-only users (Google/Facebook/TikTok) have `password_hash = NULL`.

| Column Name | Data Type | Purpose & Details |
| :--- | :--- | :--- |
| `id` | `UUID` | **Primary Key**. Auto-generated via `gen_random_uuid()`. |
| `email` | `VARCHAR(255)` | User's email address. **Unique** — used as the login identifier for email/password auth and to match OAuth accounts. |
| `name` | `VARCHAR(255)` | Public display name. |
| `avatar_url` | `TEXT` | Profile picture URL. |
| `password_hash` | `TEXT` | **bcrypt hash** of the user's password. `NULL` for OAuth-only users (Google/Facebook/TikTok signups). |
| `email_verified` | `BOOLEAN` | Whether the user's email has been verified. Defaults to `false` for email signups (requires verification email), `true` for OAuth signups (providers pre-verify). |
| `primary_login_provider` | `ENUM (login_provider_type)` | How the account was originally created: `email`, `google`, `facebook`, or `tiktok`. Defaults to `email`. |
| `created_at` | `TIMESTAMPTZ` | Account creation time. |
| `updated_at` | `TIMESTAMPTZ` | Auto-updated on any change. |

---

### Table: `social_connections`
* **Purpose:** One row per external account a user has linked, tagged by what it's used for. Handles both OAuth login identity and posting authorization.
* **Relationship:** Many-to-1 with `users`. Referenced by `published_posts` to know which connection published a post.

| Column Name | Data Type | Purpose & Details |
| :--- | :--- | :--- |
| `id` | `UUID` | **Primary Key**. |
| `user_id` | `UUID` | **Foreign Key** → `users`. |
| `provider` | `ENUM (oauth_provider_type)` | `google`, `facebook`, `tiktok`, or `instagram`. |
| `provider_user_id` | `VARCHAR(255)` | The user's ID on that external platform. |
| `provider_username` | `VARCHAR(255)` | Display handle, for UI. |
| `access_token` | `TEXT` | OAuth access token (sensitive — encrypt at rest). |
| `refresh_token` | `TEXT` | OAuth refresh token, if provided. |
| `token_expires_at` | `TIMESTAMPTZ` | When the access token expires. |
| `platform_page_id` | `VARCHAR(255)` | Facebook Page ID / Instagram Business Account ID — required by Meta's API to publish. NULL for login-only connections. |
| `used_for_login` | `BOOLEAN` | True if this connection is used to sign the user in. |
| `used_for_posting` | `BOOLEAN` | True if authorized to auto-post. |
| `is_active` | `BOOLEAN` | False if disconnected or the token was revoked. |
| `connected_at` | `TIMESTAMPTZ` | When first connected. |
| `updated_at` | `TIMESTAMPTZ` | Auto-updated on token refresh. |

`UNIQUE (user_id, provider, provider_user_id)` prevents duplicate connections for the same external account.

---

### Table: `businesses`
* **Purpose:** Reusable business profiles owned by a user. Prevents re-entering business details every time they generate content.
* **Relationship:** Many-to-1 with `users`. 1-to-many with `content_generations`.

| Column Name | Data Type | Purpose & Details |
| :--- | :--- | :--- |
| `id` | `UUID` | **Primary Key**. |
| `user_id` | `UUID` | **Foreign Key** → `users`. |
| `business_name` | `VARCHAR(255)` | Name of the brand/company. |
| `industry` | `VARCHAR(100)` | Sector, gives the AI context. |
| `target_audience` | `TEXT` | Freeform description of who the business sells to. |
| `deleted_at` | `TIMESTAMPTZ` | Soft delete, so past analytics aren't broken. |
| `created_at` | `TIMESTAMPTZ` | Creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | Auto-updated. |

---

### Table: `content_generations`
* **Purpose:** The "request" record — historical record of exactly what the user asked the AI to do. Also the switchboard for the auto-post logic.
* **Relationship:** Many-to-1 with `users`. Many-to-1 with `businesses` (optional). 1-to-many with `ai_responses`.

| Column Name | Data Type | Purpose & Details |
| :--- | :--- | :--- |
| `id` | `UUID` | **Primary Key**. |
| `user_id` | `UUID` | **Foreign Key** → `users`. |
| `business_id` | `UUID` | **Foreign Key** → `businesses`. Optional. |
| `platform` | `ENUM (platform_type)` | `facebook`, `instagram`, `linkedin`, `twitter`, `tiktok`. |
| `tone` | `ENUM (tone_type)` | e.g. `professional`, `casual`. |
| `language` | `VARCHAR(10)` | ISO language code for the output. |
| `prompt` | `TEXT` | The user's exact instructions. |
| `image_url` | `TEXT` | Set if the user attached an image to the request. |
| `auto_post_requested` | `BOOLEAN` | Defaults to `false`. Set to `true` when an image is attached. This is the flag the backend checks after generation. |
| `status` | `ENUM (generation_status)` | `pending`, `processing`, `completed`, `failed`. |
| `created_at` | `TIMESTAMPTZ` | Timestamp of the request. |

**The branching logic this enables:**
- No image → `auto_post_requested = false` → content is generated and left as a draft in `ai_responses` for the user to review, edit, or publish manually later.
- Image attached → `auto_post_requested = true` → after generation, the backend publishes to the user's connected Facebook/Instagram account, logs the attempt in `published_posts`, and updates the response's status to `posted` or `failed`.

---

### Table: `ai_responses`
* **Purpose:** Stores the actual generated text/hashtags/CTA, and its publishing lifecycle. Normalized so regenerating ("Rewrite") doesn't overwrite previous output.
* **Relationship:** Many-to-1 with `content_generations`. Referenced by `saved_posts` and `published_posts`.

| Column Name | Data Type | Purpose & Details |
| :--- | :--- | :--- |
| `id` | `UUID` | **Primary Key**. |
| `content_generation_id` | `UUID` | **Foreign Key** → `content_generations`. |
| `generated_content` | `TEXT` | The post body. |
| `hashtags` | `TEXT[]` | Generated hashtags. |
| `call_to_action` | `TEXT` | Extracted CTA. |
| `ai_model` | `VARCHAR(100)` | Which model generated it (e.g. `gemini-2.5-pro`, `gpt-4o`). |
| `tokens_used` | `INTEGER` | For billing/quota tracking. |
| `status` | `ENUM (ai_response_status)` | `draft`, `ready_to_post`, `posted`, `failed`. Defaults to `draft`. |
| `created_at` | `TIMESTAMPTZ` | Timestamp of generation. |

---

### Table: `published_posts`
* **Purpose:** Audit trail for every Facebook/Instagram auto-post attempt.
* **Relationship:** Many-to-1 with `ai_responses`. Many-to-1 with `social_connections`. Many-to-1 with `users`.

| Column Name | Data Type | Purpose & Details |
| :--- | :--- | :--- |
| `id` | `UUID` | **Primary Key**. |
| `user_id` | `UUID` | **Foreign Key** → `users`. Denormalized for simpler queries. |
| `ai_response_id` | `UUID` | **Foreign Key** → `ai_responses`. |
| `social_connection_id` | `UUID` | **Foreign Key** → `social_connections`. Which account published it. |
| `platform` | `ENUM (platform_type)` | The target platform. |
| `external_post_id` | `VARCHAR(255)` | Post ID returned by the platform's API. NULL until it succeeds. |
| `caption_used` | `TEXT` | Snapshot of the exact caption posted. |
| `image_url` | `TEXT` | The image that was posted. |
| `status` | `ENUM (post_status)` | `pending`, `posted`, `failed`. |
| `error_message` | `TEXT` | Populated on failure. |
| `posted_at` | `TIMESTAMPTZ` | When it went live. |
| `created_at` | `TIMESTAMPTZ` | When the attempt was recorded. |

---

### Table: `saved_posts`
* **Purpose:** Bookmark/favorites table pointing to a specific AI generation.
* **Relationship:** Many-to-1 with `users`. 1-to-1 with `ai_responses`.

| Column Name | Data Type | Purpose & Details |
| :--- | :--- | :--- |
| `id` | `UUID` | **Primary Key**. |
| `user_id` | `UUID` | **Foreign Key** → `users`. |
| `ai_response_id` | `UUID` | **Foreign Key** → `ai_responses`. The exact output they liked. |
| `title` | `VARCHAR(255)` | Optional custom name for the bookmark. |
| `is_favorite` | `BOOLEAN` | True if starred. |
| `notes` | `TEXT` | Optional scratchpad. |
| `created_at` | `TIMESTAMPTZ` | When saved. |
| `updated_at` | `TIMESTAMPTZ` | Auto-updated if title/notes change. |

---

## 2. Authentication Flow

### How Passwords and OAuth Work

#### Email/Password Signup
1. User submits email + password via the signup form.
2. Application hashes the password with **bcrypt** (e.g., cost factor 12).
3. A row is inserted into `users` with `password_hash = <bcrypt hash>`, `primary_login_provider = 'email'`, `email_verified = false`.
4. A verification email is sent. Once confirmed, `email_verified` is set to `true`.

#### Email/Password Login
1. User submits email + password.
2. Application fetches the user by email, compares the submitted password against `password_hash` using bcrypt.
3. If valid and `email_verified = true`, issue a session/JWT.

#### OAuth Signup (Google / Facebook / TikTok)
1. User clicks "Continue with Google/Facebook/TikTok".
2. Application redirects to the provider's OAuth consent screen.
3. Provider redirects back with an authorization code.
4. Application exchanges the code for `access_token` and `refresh_token`, plus the user's profile (email, name, avatar).
5. Application checks if a `users` row with that email exists:
   - **No** → create a new `users` row with `password_hash = NULL`, `primary_login_provider = 'google'/'facebook'/'tiktok'`, `email_verified = true`.
   - **Yes** → link to the existing account.
6. An entry is created in `social_connections` with `used_for_login = true` and the OAuth tokens.

#### OAuth Login (Returning User)
1. Same OAuth redirect flow.
2. Application matches the `provider + provider_user_id` in `social_connections` to find the existing user.
3. Refreshes `access_token` / `refresh_token` if updated.
4. Issues a session/JWT.

### Why There's No Separate Auth Service Dependency
- **Passwords** are hashed and stored directly in `users.password_hash`. The application handles hashing (bcrypt) and comparison — no external auth table.
- **OAuth tokens** for login are stored in `social_connections` with `used_for_login = true`.
- **OAuth tokens** for posting (separate from login) are also in `social_connections` with `used_for_posting = true`.
- This gives full control over the auth flow without depending on Supabase Auth or any third-party auth service.

---

## 3. Row-Level Security (RLS) Policies

> **Note:** If you're using Prisma directly from a backend server (not client-side Supabase), RLS is optional — your backend controls access. If you still want RLS at the database level, apply these policies.

### `users`
* **SELECT / UPDATE**: Only the authenticated user can read/update their own row.

### `social_connections`
* **SELECT / INSERT / UPDATE / DELETE**: Only the owning user.

### `businesses`
* **SELECT / INSERT / UPDATE / DELETE**: Only the owning user.

### `content_generations`
* **SELECT / INSERT / UPDATE / DELETE**: Only the owning user.

### `ai_responses`
* Access controlled via the parent `content_generations` row ownership.

### `published_posts`
* **SELECT**: Only the owning user.
* **INSERT / UPDATE**: Reserved for the backend service.

### `saved_posts`
* **SELECT / INSERT / UPDATE / DELETE**: Only the owning user.

---

## 4. End-to-End Flow

1. User submits a prompt in `content_generations`, optionally attaching an image.
2. Backend/Edge Function generates the content, inserts it into `ai_responses` (`status = 'draft'`).
3. Backend checks `content_generations.auto_post_requested`:
   - **false** → done — the row stays a draft. User can view/edit it later, publish manually, or bookmark it via `saved_posts`.
   - **true** → backend finds the user's active `social_connections` row for the requested `platform` (`used_for_posting = true`), calls the platform's publish API, logs the result in `published_posts`, and updates `ai_responses.status` to `posted` or `failed`.
