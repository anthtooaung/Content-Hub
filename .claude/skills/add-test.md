---
name: add-test
description: Generate a Vitest test file for a given source file
---

# Add Test

Create a Vitest test file for a source file.

## Steps

1. Create `__tests__/{filename}.test.ts` adjacent to the source file, or `tests/{filename}.test.ts` at the project root
2. Import `describe`, `it`, `expect` from `vitest`
3. Write at minimum: one happy-path test and one edge-case/error test
4. Use `vi.mock()` for external dependencies (Prisma, AI SDKs, NextAuth)

## Template

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('functionName', () => {
  it('should handle normal case', () => {
    expect(result).toBe(expected);
  });

  it('should handle error case', () => {
    expect(() => functionName(badInput)).toThrow();
  });
});
```

## Conventions

- Run tests with `npm run test:run` (single run) or `npm test` (watch)
- Mock Prisma with `vi.mock('@/lib/prisma', () => ({ prisma: { model: { findMany: vi.fn() } } }))`
- Mock AI calls similarly — never call real APIs in tests
- Name test files `{source-filename}.test.ts`
