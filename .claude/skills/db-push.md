---
name: db-push
description: Push Prisma schema changes to the database and regenerate client
---

# DB Push

Sync schema changes to the database without creating a migration file.

## Steps

1. Run `npx prisma generate` to regenerate the Prisma client
2. Run `npx prisma db push` to push schema to the database

## When to use

- During development when iterating on schema quickly
- When you don't need a migration history file

## When NOT to use

- Use `npx prisma migrate dev --name <name>` instead when you want a versioned migration file
- Production deployments should always use migrations

## Verify

After pushing, check for warnings in the output. Prisma will warn if the push requires a destructive change (e.g., dropping columns).
