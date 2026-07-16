# Content Hub — AI Social Media Content Generator

An AI-powered web application that helps businesses, freelancers, and content creators generate engaging social media content for multiple platforms within seconds. Users describe their business or campaign, and the AI produces posts, captions, hashtags, and marketing ideas tailored to their audience.

---

## Quickstart

```bash
git clone https://github.com/anthtooaung/Content-Hub.git && cd Content-Hub
cp .env.example .env        # fill in real values LOCALLY — never commit .env
npm install && npm run dev
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (Full-stack) |
| Styling | Tailwind CSS |
| Database | PostgreSQL + Prisma ORM |
| AI | OpenAI API / Google Gemini API (JS SDK) |
| Auth | NextAuth.js |
| Deploy | Vercel |

## Features

- Generate Facebook, Instagram, LinkedIn, X, TikTok posts
- Smart hashtag suggestions
- Marketing campaign ideas
- Call-to-action generation
- Multiple writing tones (professional, casual, funny, etc.)
- Content history & favorites
- User authentication

## Project Structure

```
app/
  api/
    auth/          → NextAuth.js (login/signup)
    generate/      → AI content generation endpoint
    history/       → Save/fetch generated content
  dashboard/       → User dashboard
  generate/        → Content generation page
lib/
  prisma.js        → Database connection
  ai.js            → OpenAI/Gemini setup
prisma/
  schema.prisma    → Database schema
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- OpenAI or Gemini API key

### Installation
```bash
npm install
cp .env.example .env    # add your keys
npx prisma db push      # setup database
npm run dev             # start dev server
```

## Team

| Name | Role |
|------|------|
| Ant Htoo Aung | Anchor / Lead |
| Hein Aung Kyaw | Developer |
| Kaung Htet | Developer |
| Khant Phone Pyaw Sone | Developer / Reviewer |
| Kaung Pyaw Sone | Developer / Reviewer |

---

## What's already set up

| File | Gives you |
|---|---|
| `.github/workflows/ci.yml` | lint, test, build on every PR |
| `.github/workflows/security.yml` | gitleaks + semgrep security scanning |
| `.github/dependabot.yml` | weekly dependency update PRs |
| `.env.example` | secret hygiene — never commit real keys |
| `docs/ARCHITECTURE.md` | 1-page architecture overview |

**Git rule:** branch → PR → 1 teammate review → merge. No push to `main`, no self-merge.
