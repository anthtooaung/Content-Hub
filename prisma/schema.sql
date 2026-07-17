-- ============================================================
-- SQL Schema for Content-Hub — AI Social Media Content Generator
-- Generated from prisma/schema.prisma
-- Database: PostgreSQL
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── ENUMS ───────────────────────────────────────────────

CREATE TYPE login_provider_type AS ENUM ('email', 'google', 'facebook', 'tiktok');
CREATE TYPE oauth_provider_type AS ENUM ('google', 'facebook', 'tiktok', 'instagram');
CREATE TYPE platform_type AS ENUM ('facebook', 'instagram', 'linkedin', 'twitter', 'tiktok');
CREATE TYPE tone_type AS ENUM ('professional', 'casual', 'humorous', 'inspirational', 'educational');
CREATE TYPE generation_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE ai_response_status AS ENUM ('draft', 'ready_to_post', 'posted', 'failed');
CREATE TYPE post_status AS ENUM ('pending', 'posted', 'failed');

-- ─── TABLES ──────────────────────────────────────────────

-- Users: Self-managed auth table with bcrypt password hashing.
-- OAuth-only users have password_hash = NULL.
CREATE TABLE users (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email                  VARCHAR(255) NOT NULL UNIQUE,
    name                   VARCHAR(255),
    avatar_url             TEXT,
    password_hash          TEXT,          -- bcrypt hash, NULL for OAuth-only users
    email_verified         BOOLEAN NOT NULL DEFAULT false,
    primary_login_provider login_provider_type NOT NULL DEFAULT 'email',
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Social Connections: OAuth provider accounts linked for login and/or posting.
CREATE TABLE social_connections (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider          oauth_provider_type NOT NULL,
    provider_user_id  VARCHAR(255),
    provider_username VARCHAR(255),
    access_token      TEXT,
    refresh_token     TEXT,
    token_expires_at  TIMESTAMPTZ,
    platform_page_id  VARCHAR(255),
    used_for_login    BOOLEAN NOT NULL DEFAULT false,
    used_for_posting  BOOLEAN NOT NULL DEFAULT false,
    is_active         BOOLEAN NOT NULL DEFAULT true,
    connected_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (user_id, provider, provider_user_id)
);

-- Businesses: Reusable business profiles owned by a user.
CREATE TABLE businesses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name   VARCHAR(255) NOT NULL,
    industry        VARCHAR(100),
    target_audience TEXT,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Content Generations: The "request" record — what the user asked the AI to do.
CREATE TABLE content_generations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id         UUID REFERENCES businesses(id) ON DELETE SET NULL,
    platform            platform_type NOT NULL,
    tone                tone_type NOT NULL,
    language            VARCHAR(10),
    prompt              TEXT NOT NULL,
    image_url           TEXT,
    auto_post_requested BOOLEAN NOT NULL DEFAULT false,
    status              generation_status NOT NULL DEFAULT 'pending',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Responses: The actual generated content for each request.
CREATE TABLE ai_responses (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_generation_id UUID NOT NULL REFERENCES content_generations(id) ON DELETE CASCADE,
    generated_content     TEXT NOT NULL,
    hashtags              TEXT[],
    call_to_action        TEXT,
    ai_model              VARCHAR(100),
    tokens_used           INTEGER,
    status                ai_response_status NOT NULL DEFAULT 'draft',
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Published Posts: Audit trail for auto-post attempts.
CREATE TABLE published_posts (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ai_response_id       UUID NOT NULL REFERENCES ai_responses(id) ON DELETE CASCADE,
    social_connection_id UUID NOT NULL REFERENCES social_connections(id) ON DELETE CASCADE,
    platform             platform_type NOT NULL,
    external_post_id     VARCHAR(255),
    caption_used         TEXT,
    image_url            TEXT,
    status               post_status NOT NULL DEFAULT 'pending',
    error_message        TEXT,
    posted_at            TIMESTAMPTZ,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Saved Posts: Bookmarks / favorites.
CREATE TABLE saved_posts (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ai_response_id UUID NOT NULL REFERENCES ai_responses(id) ON DELETE CASCADE,
    title          VARCHAR(255),
    is_favorite    BOOLEAN NOT NULL DEFAULT false,
    notes          TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── INDEXES ─────────────────────────────────────────────

CREATE INDEX idx_social_connections_user_id ON social_connections(user_id);
CREATE INDEX idx_businesses_user_id ON businesses(user_id);
CREATE INDEX idx_content_generations_user_id ON content_generations(user_id);
CREATE INDEX idx_content_generations_business_id ON content_generations(business_id);
CREATE INDEX idx_ai_responses_content_generation_id ON ai_responses(content_generation_id);
CREATE INDEX idx_published_posts_user_id ON published_posts(user_id);
CREATE INDEX idx_published_posts_ai_response_id ON published_posts(ai_response_id);
CREATE INDEX idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX idx_saved_posts_ai_response_id ON saved_posts(ai_response_id);

-- ─── AUTO-UPDATE TRIGGER ─────────────────────────────────
-- Automatically updates `updated_at` columns on row changes.

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_users
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_social_connections
    BEFORE UPDATE ON social_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_businesses
    BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_saved_posts
    BEFORE UPDATE ON saved_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
