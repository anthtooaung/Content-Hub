# Database Structure — AI Social Media Content Generator

Full database structure for the project: table purposes, columns, relationships, RLS policies, and the Supabase multi-provider auth flow.

Core behavior this schema supports:
- A dedicated **`users`** table storing core account info (this is the "user table" — separate from Supabase's internal `auth.users`, which only handles credentials/sessions).
- Login via **Google, Facebook, or TikTok** (in addition to email/password).
- Connecting **Facebook and Instagram** accounts for auto-posting (separate from login).
- **No image attached → generate content only**, saved as a draft.
- **Image attached → generate content AND auto-post it** to the connected platform.
- Persisted **drafts** so generated content isn't lost until the user publishes it.

A couple of implementation notes worth knowing going in:
- Google and Facebook are built-in OAuth providers in Supabase Auth. TikTok is not on Supabase's built-in list — you'll either add it as a Custom OAuth/OIDC Provider (Authentication → Providers → Custom Providers in the dashboard, if TikTok's endpoints qualify) or run TikTok's OAuth exchange yourself and store the resulting tokens in `social_connections`.
- Actually publishing to Facebook/Instagram (calling the Meta Graph API) is application logic — a Supabase Edge Function or backend job — not something the database does on its own. The tables below are what that job reads from and writes results back to.
- OAuth tokens are sensitive. Columns are typed `TEXT` for simplicity, but in production use Supabase Vault or application-level encryption rather than storing them in plaintext.

---

## 1. Table Reference

### Table: `users`
* **Why it was created:** Supabase's built-in `auth.users` table only handles authentication (email, hashed password, provider identity) — it's not meant to hold application-facing profile data. This table is the actual "user table" the rest of the app reads from.
* **Purpose:** Stores the core account record for every signed-up person — display info plus which method they originally signed up with.
* **Relationship:** 1-to-1 with `auth.users`.

| Column Name | Data Type | Purpose & Details |
| :--- | :--- | :--- |
| `id` | `UUID` | **Primary Key / Foreign Key**. Matches `auth.users.id`. Cascades on delete. |
| `email` | `VARCHAR(255)` | Cached copy of the user's email, kept in sync from `auth.users` for easier querying without joining. |
| `name` | `VARCHAR(255)` | Public display name. |
| `avatar_url` | `TEXT` | Profile picture URL. |
| `primary_login_provider` | `ENUM (login_provider_type)` | How the account was originally created: `email`, `google`, `facebook`, or `tiktok`. |
| `created_at` | `TIMESTAMPTZ` | Account creation time. |
| `updated_at` | `TIMESTAMPTZ` | Auto-updated on any change. |

---

### Table: `social_connections`
* **Why it was created:** A user can log in with one provider but separately connect other accounts for posting — e.g., signed up with Google, but connected a Facebook Page and an Instagram Business account for auto-posting. Login and posting permissions are tracked per-connection rather than crammed into one row on `users`.
* **Purpose:** One row per external account a user has linked, tagged by what it's used for.
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
* **Why it was created:** Prevents users from re-entering business details every time they generate content; also avoids duplicating business info across many generation requests.
* **Purpose:** Reusable business profiles owned by a user.
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
* **Why it was created:** Historical record of exactly what the user asked the AI to do — kept separate from the AI's answer so regenerating doesn't overwrite or duplicate anything.
* **Purpose:** The "request" record. Also the switchboard for the auto-post logic — whether an image was attached determines what happens after generation.
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
| `auto_post_requested` | `BOOLEAN` (generated) | `= (image_url IS NOT NULL)`, computed automatically by the database. This is the flag the backend checks after generation. |
| `status` | `ENUM (generation_status)` | `pending`, `processing`, `completed`, `failed`. |
| `created_at` | `TIMESTAMPTZ` | Timestamp of the request. |

**The branching logic this enables:**
- No image → `auto_post_requested = false` → content is generated and left as a draft in `ai_responses` for the user to review, edit, or publish manually later.
- Image attached → `auto_post_requested = true` → after generation, the backend publishes to the user's connected Facebook/Instagram account, logs the attempt in `published_posts`, and updates the response's status to `posted` or `failed`.

---

### Table: `ai_responses`
* **Why it was created:** Normalized out of `content_generations` so regenerating ("Rewrite") doesn't overwrite the previous AI output or duplicate the prompt.
* **Purpose:** Stores the actual generated text/hashtags/CTA, and its publishing lifecycle.
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
| `status` | `ENUM (ai_response_status)` | `draft`, `ready_to_post`, `posted`, `failed`. Defaults to `draft` — every generation is a persisted draft until something advances it. |
| `created_at` | `TIMESTAMPTZ` | Timestamp of generation. |

---

### Table: `published_posts`
* **Why it was created:** Audit trail for what was actually auto-posted, where, and whether it worked — needed once posting became automatic instead of manual.
* **Purpose:** Records the outcome of every Facebook/Instagram auto-post attempt.
* **Relationship:** Many-to-1 with `ai_responses`. Many-to-1 with `social_connections`.

| Column Name | Data Type | Purpose & Details |
| :--- | :--- | :--- |
| `id` | `UUID` | **Primary Key**. |
| `user_id` | `UUID` | **Foreign Key** → `users`. Denormalized here so RLS doesn't need a multi-level subquery. |
| `ai_response_id` | `UUID` | **Foreign Key** → `ai_responses`. |
| `social_connection_id` | `UUID` | **Foreign Key** → `social_connections`. Which account published it. |
| `platform` | `ENUM (platform_type)` | Restricted to `facebook` or `instagram` by check constraint. |
| `external_post_id` | `VARCHAR(255)` | Post ID returned by Meta's API. NULL until it succeeds. |
| `caption_used` | `TEXT` | Snapshot of the exact caption posted (in case the draft is edited afterward). |
| `image_url` | `TEXT` | The image that was posted. |
| `status` | `ENUM (post_status)` | `pending`, `posted`, `failed`. |
| `error_message` | `TEXT` | Populated on failure (expired token, API rejection, etc.). |
| `posted_at` | `TIMESTAMPTZ` | When it went live. |
| `created_at` | `TIMESTAMPTZ` | When the attempt was recorded. |

---

### Table: `saved_posts`
* **Why it was created:** Lets users bookmark favorite outputs out of potentially hundreds of generations.
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

## 2. Row-Level Security (RLS) Policies

RLS restricts which rows a user can read/write based on their auth token, so even direct access via the public anon key can't leak another user's data.

### `users`
* **SELECT / UPDATE**: `auth.uid() = id`.

### `social_connections`
* **SELECT / INSERT / UPDATE / DELETE**: `auth.uid() = user_id`.

### `businesses`
* **SELECT / INSERT / UPDATE / DELETE**: `auth.uid() = user_id`.

### `content_generations`
* **SELECT / INSERT / UPDATE / DELETE**: `auth.uid() = user_id`.

### `ai_responses`
* No direct `user_id` column. Policy uses an `EXISTS` subquery checking whether the authenticated user owns the parent `content_generations` row.
* *Service role note:* When the backend generates AI content and inserts it, it uses the Supabase Service Role Key, which bypasses RLS — intentional for server-to-server writes. The RLS policy here guards against direct client-side tampering.

### `published_posts`
* **SELECT**: `auth.uid() = user_id` — users can see their own publish history.
* **INSERT / UPDATE**: Reserved for the service role (the backend job that calls Meta's API). Not opened to the client, since a publish result has to come from the actual platform call, not something the client could fake.

### `saved_posts`
* **SELECT / INSERT / UPDATE / DELETE**: `auth.uid() = user_id`.

---

## 3. Supabase Authentication in React (Email + Google/Facebook/TikTok)

### Step 1: Install Dependencies
```bash
npm install @supabase/supabase-js
```

### Step 2: Initialize Supabase Client
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://YOUR_PROJECT_ID.supabase.co'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Step 3: React Authentication Component
```jsx
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function AuthComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => setUser(session?.user || null)
    );
    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: email.split('@')[0] } }
    });
    setMessage(error ? `Error: ${error.message}` : 'Check your email to confirm sign up.');
    setLoading(false);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMessage(error ? `Error: ${error.message}` : 'Signed in successfully!');
    setLoading(false);
  };

  // Google and Facebook are built-in Supabase providers.
  // TikTok requires a Custom OAuth/OIDC Provider (or your own token exchange) —
  // see notes at the top of this document.
  const handleOAuthLogin = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider, // 'google' | 'facebook' | 'custom:tiktok'
      options: { redirectTo: window.location.origin }
    });
    if (error) setMessage(`Error: ${error.message}`);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMessage('Logged out successfully.');
  };

  if (user) {
    return (
      <div style={{ padding: '20px', border: '1px solid #ccc' }}>
        <h2>Welcome!</h2>
        <p>Logged in as: {user.email}</p>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>Sign In / Sign Up</h2>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input type="email" placeholder="Email address" value={email}
               onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password}
               onChange={(e) => setPassword(e.target.value)} required />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleSignIn} disabled={loading} type="submit">
            {loading ? 'Processing...' : 'Sign In'}
          </button>
          <button onClick={handleSignUp} disabled={loading} type="button">
            {loading ? 'Processing...' : 'Sign Up'}
          </button>
        </div>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '15px' }}>
        <button onClick={() => handleOAuthLogin('google')}>Continue with Google</button>
        <button onClick={() => handleOAuthLogin('facebook')}>Continue with Facebook</button>
        <button onClick={() => handleOAuthLogin('custom:tiktok')}>Continue with TikTok</button>
      </div>

      {message && <p style={{ marginTop: '15px', color: 'blue' }}>{message}</p>}
    </div>
  );
}
```

### How this integrates with the database
1. **Sign up / OAuth login** creates a row in Supabase's internal `auth.users` table, regardless of method (email, Google, Facebook, TikTok).
2. A `handle_new_user()` trigger fires immediately after, inserting a matching row into the `users` table with `id`, `email`, `name`, and `primary_login_provider`.
3. Once logged in, the Supabase client attaches a JWT to every request, which is what RLS checks against (`auth.uid() = user_id`).
4. Connecting Facebook/Instagram *for posting* (as opposed to login) is a separate flow from a settings page: request the extra Graph API scopes (`pages_manage_posts`, `instagram_content_publish`, etc.), then write the resulting Page ID/tokens into `social_connections` with `used_for_posting = true`.

---

## 4. Where Passwords and OAuth Tokens Actually Live

### Passwords
There's no `password` column on `users`, and there shouldn't be. When someone signs up with email/password, Supabase Auth already hashes the password (bcrypt) and stores it in its own internal `auth.users.encrypted_password` column — a table you don't manage and can't query for the raw value. Adding a `password` column to `users` would mean one of two bad outcomes:
- Storing it in **plaintext** — a serious security vulnerability (full account takeover if the database is ever exposed, plus regulatory exposure in most jurisdictions).
- Storing a **second hash** — redundant, another thing that can drift out of sync with the real one in `auth.users`, and a second attack surface for no actual benefit, since Supabase already verifies passwords for you via `supabase.auth.signInWithPassword()`.

`users.primary_login_provider` already tells you what you likely actually want to know — whether the account is `email` (password-based) or OAuth-only (`google`/`facebook`/`tiktok`). If you need "does this account have a password set" as a boolean (e.g., to show a "Set a password" prompt for OAuth-only users), that's a fine, safe thing to derive — just not the password itself.

### OAuth tokens
Two different things get called "OAuth token" here, stored in two different places:

1. **The login identity** (proves who the user is) — Supabase stores this itself in an internal `auth.identities` table: one row per (user, provider), holding the provider's account ID and a JSON blob of basic profile data returned at sign-in. You can read this via `supabase.auth.getUserIdentities()`, but you don't need to build anything for it — it's automatic.

2. **The provider's API access token** (needed to actually *call* Google/Facebook/TikTok's API later — e.g., to auto-post) — Supabase does **not** persist this anywhere. It's only handed to your client once, immediately after login, on the session object (`session.provider_token` and `session.provider_refresh_token`), and then it's gone unless you capture and store it yourself.

That's the entire reason `social_connections` exists in this schema — it's where you persist #2, since Supabase won't. Capture it right after the OAuth redirect completes:

```javascript
const { data: { session } } = await supabase.auth.getSession();

if (session?.provider_token) {
  await supabase.from('social_connections').upsert({
    user_id: session.user.id,
    provider: session.user.app_metadata.provider, // 'google' | 'facebook'
    provider_user_id: session.user.user_metadata.sub ?? session.user.id,
    provider_username: session.user.user_metadata.name,
    access_token: session.provider_token,
    refresh_token: session.provider_refresh_token, // often null — see note below
    used_for_login: true
  }, { onConflict: 'user_id,provider,provider_user_id' });
}
```

A couple of provider-specific gotchas worth knowing:
- **Google doesn't return a refresh token by default.** You have to explicitly request offline access when starting the OAuth flow (`signInWithOAuth({ provider: 'google', options: { queryParams: { access_type: 'offline', prompt: 'consent' } } })`), or `provider_refresh_token` will come back empty.
- **Facebook's short-lived access token (~1–2 hours) isn't enough for ongoing auto-posting.** You'll need a separate server-side call to exchange it for a long-lived token (~60 days) via the Graph API, then store *that* in `access_token`/`token_expires_at`, and refresh it again before it expires.
- Because of the above, the tokens captured at **login** time are rarely the same ones you'd use for **posting** months later — in practice, connecting a Facebook Page/Instagram Business account for auto-posting is usually its own flow from a settings page (requesting `pages_manage_posts` / `instagram_content_publish` scopes), separate from the login flow, even though both write to the same `social_connections` table.

---

## 5. End-to-End Flow

1. User submits a prompt in `content_generations`, optionally attaching an image.
2. Backend/Edge Function generates the content, inserts it into `ai_responses` (`status = 'draft'`).
3. Backend checks `content_generations.auto_post_requested`:
   - **false** → done — the row stays a draft. User can view/edit it later, publish manually, or bookmark it via `saved_posts`.
   - **true** → backend finds the user's active `social_connections` row for the requested `platform` (`used_for_posting = true`), calls the platform's publish API, logs the result in `published_posts`, and updates `ai_responses.status` to `posted` or `failed`.
