-- CreateEnum
CREATE TYPE "login_provider_type" AS ENUM ('email', 'google', 'facebook', 'tiktok');

-- CreateEnum
CREATE TYPE "oauth_provider_type" AS ENUM ('google', 'facebook', 'tiktok', 'instagram');

-- CreateEnum
CREATE TYPE "platform_type" AS ENUM ('facebook', 'instagram', 'linkedin', 'twitter', 'tiktok');

-- CreateEnum
CREATE TYPE "tone_type" AS ENUM ('professional', 'casual', 'humorous', 'inspirational', 'educational');

-- CreateEnum
CREATE TYPE "generation_status" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "ai_response_status" AS ENUM ('draft', 'ready_to_post', 'posted', 'failed');

-- CreateEnum
CREATE TYPE "post_status" AS ENUM ('pending', 'posted', 'failed');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "avatar_url" TEXT,
    "password_hash" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "primary_login_provider" "login_provider_type" NOT NULL DEFAULT 'email',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_connections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "provider" "oauth_provider_type" NOT NULL,
    "provider_user_id" VARCHAR(255),
    "provider_username" VARCHAR(255),
    "access_token" TEXT,
    "refresh_token" TEXT,
    "token_expires_at" TIMESTAMPTZ,
    "platform_page_id" VARCHAR(255),
    "used_for_login" BOOLEAN NOT NULL DEFAULT false,
    "used_for_posting" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "connected_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "businesses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "business_name" VARCHAR(255) NOT NULL,
    "industry" VARCHAR(100),
    "target_audience" TEXT,
    "deleted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_generations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "business_id" UUID,
    "platform" "platform_type" NOT NULL,
    "tone" "tone_type" NOT NULL,
    "language" VARCHAR(10),
    "prompt" TEXT NOT NULL,
    "image_url" TEXT,
    "auto_post_requested" BOOLEAN NOT NULL DEFAULT false,
    "status" "generation_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_generations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_responses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content_generation_id" UUID NOT NULL,
    "generated_content" TEXT NOT NULL,
    "hashtags" TEXT[],
    "call_to_action" TEXT,
    "ai_model" VARCHAR(100),
    "tokens_used" INTEGER,
    "status" "ai_response_status" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "published_posts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "ai_response_id" UUID NOT NULL,
    "social_connection_id" UUID NOT NULL,
    "platform" "platform_type" NOT NULL,
    "external_post_id" VARCHAR(255),
    "caption_used" TEXT,
    "image_url" TEXT,
    "status" "post_status" NOT NULL DEFAULT 'pending',
    "error_message" TEXT,
    "posted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "published_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_posts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "ai_response_id" UUID NOT NULL,
    "title" VARCHAR(255),
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "social_connections_user_id_provider_provider_user_id_key" ON "social_connections"("user_id", "provider", "provider_user_id");

-- AddForeignKey
ALTER TABLE "social_connections" ADD CONSTRAINT "social_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_generations" ADD CONSTRAINT "content_generations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_generations" ADD CONSTRAINT "content_generations_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_responses" ADD CONSTRAINT "ai_responses_content_generation_id_fkey" FOREIGN KEY ("content_generation_id") REFERENCES "content_generations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "published_posts" ADD CONSTRAINT "published_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "published_posts" ADD CONSTRAINT "published_posts_ai_response_id_fkey" FOREIGN KEY ("ai_response_id") REFERENCES "ai_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "published_posts" ADD CONSTRAINT "published_posts_social_connection_id_fkey" FOREIGN KEY ("social_connection_id") REFERENCES "social_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_posts" ADD CONSTRAINT "saved_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_posts" ADD CONSTRAINT "saved_posts_ai_response_id_fkey" FOREIGN KEY ("ai_response_id") REFERENCES "ai_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
