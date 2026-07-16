---
name: add-model
description: Add a new Prisma model to the database schema
---

# Add Model

Add a new model to `prisma/schema.prisma` and generate the client.

## Steps

1. Read `prisma/schema.prisma` to understand existing models and patterns
2. Add the new model with:
   - `id String @id @default(cuid())` as primary key
   - `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt` timestamps
   - Foreign key relations using `@relation(fields: [field], references: [id], onDelete: Cascade)` where appropriate
   - `@@index()` on fields that will be queried frequently
3. Add relations to existing models if needed (e.g., add `relatedModel RelatedModel[]` to User)
4. Run `npx prisma generate` to regenerate the client
5. Run `npx prisma db push` to sync schema to database

## Existing patterns (from schema.prisma)

- All models use `cuid()` for IDs
- User-owned models have `userId String` + `user User @relation(...)` with `onDelete: Cascade`
- Text-heavy fields use `@db.Text`
- Array fields use native PostgreSQL arrays (e.g., `String[]`)
- Indexes are added for frequent query patterns

## After adding

- Create corresponding API route if the model needs CRUD operations
- Update any affected types in `types/` directory
