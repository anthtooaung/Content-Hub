---
name: add-api-route
description: Scaffold a new Next.js API route with validation and error handling
---

# Add API Route

Scaffold a new Next.js App Router API route.

## Steps

1. Create `app/api/{route-name}/route.ts`
2. Import `NextRequest` and `NextResponse` from `next/server`
3. Add input validation at the top of the handler
4. Return proper HTTP status codes (400 for bad input, 401 for unauthorized, 500 for server errors)
5. Wrap handler body in try/catch with console.error logging

## Template

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // implementation
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to ...' }, { status: 500 });
  }
}
```

## Conventions

- Use Prisma client from `@/lib/prisma` (never instantiate directly)
- Check `getServerSession(authOptions)` for auth-protected routes
- Validate required fields before processing
- Use `NextResponse.json()` for all responses
