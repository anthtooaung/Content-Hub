# Architecture — Content Hub

> One page overview of the AI Social Media Content Generator.

## What it does
An AI-powered web app that helps small businesses, freelancers, and content creators generate social media posts, captions, hashtags, and marketing ideas. Users enter their business details and goals, and the AI produces platform-specific content ready to publish.

## Diagram

```
[ Browser (React/Next.js) ]
         |
         v
[ Next.js API Routes ]
         |
    +---------+
    |         |
    v         v
[ PostgreSQL ] [ OpenAI / Gemini API ]
[ (Prisma)  ]
```

## Where things live
| Path | What |
|---|---|
| `app/` | Next.js pages and API routes |
| `app/api/` | Backend API endpoints |
| `lib/` | Shared utilities (DB, AI setup) |
| `prisma/` | Database schema |
| `.github/workflows/` | CI + security |
| `docs/` | Architecture, decisions |

## External services
| Service | Purpose | Keys needed |
|---|---|---|
| PostgreSQL | User data, content history | `DATABASE_URL` |
| OpenAI API | Content generation | `OPENAI_API_KEY` |
| Google Gemini API | Content generation (alternative) | `GEMINI_API_KEY` |
| NextAuth.js | Authentication | `NEXTAUTH_SECRET` |

## How to run
See the [README](../README.md) Quickstart.
