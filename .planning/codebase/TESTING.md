# Testing Patterns

**Analysis Date:** 2026-07-18

## Test Framework

**Runner:**
- Vitest 1.6.0 (configured but not currently used)
- Config: `package.json` scripts section
- Plugin: `@vitejs/plugin-react` for React testing

**Assertion Library:**
- Vitest built-in expect (compatible with Jest API)

**Run Commands:**
```bash
npm test                # Run all tests in watch mode
npm run test:run        # Run all tests single run
```

**Note:** No test files currently exist in the codebase. Testing infrastructure is set up but not utilized.

## Test File Organization

**Location:**
- Co-located with source files (standard Vitest convention)
- Pattern: `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`
- Directory structure mirrors source structure

**Naming:**
- Test files: `<filename>.test.ts` or `<filename>.test.tsx`
- Test suites: `describe('<ComponentName> / <FunctionName>')`
- Test cases: `it('should <expected behavior>')` or `test('<description>')`

**Structure:**
```
app/
├── api/
│   └── generate/
│       ├── route.ts          # Source file
│       └── route.test.ts     # Test file (when created)
├── generate/
│   ├── page.tsx              # Source file
│   └── page.test.tsx         # Test file (when created)
└── lib/
    ├── ai.ts                 # Source file
    └── ai.test.ts            # Test file (when created)
```

## Test Structure

**Suite Organization:**
```typescript
// Proposed pattern based on codebase conventions
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import GeneratePage from '../page';

describe('GeneratePage', () => {
  it('should render the form', () => {
    render(<GeneratePage />);
    expect(screen.getByLabelText(/business type/i)).toBeInTheDocument();
  });

  it('should show loading state when generating', async () => {
    // Test implementation
  });
});
```

**Patterns:**
- Setup: Import test utilities and source module
- Teardown: Automatic cleanup (Vitest handles)
- Assertion: Use `expect()` with matchers
- Async: Use `async/await` with `waitFor` for async operations

## Mocking

**Framework:** Vitest built-in `vi` module

**Common Patterns:**

```typescript
// Mock fetch API
vi.spyOn(global, 'fetch').mockResolvedValue({
  ok: true,
  json: async () => ({ post: 'test', hashtags: [] }),
});

// Mock external modules
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: '{}' } }],
        }),
      },
    },
  })),
}));

// Mock Next.js modules
vi.mock('next-auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({
    user: { id: 'test-user-id', email: 'test@example.com' },
  }),
}));
```

**What to Mock:**
- External API calls (OpenAI, Gemini, Prisma)
- `fetch` in client components
- `getServerSession` for auth in API routes
- Environment variables via `vi.stubEnv()`
- Database queries via Prisma mocks

**What NOT to Mock:**
- Internal utility functions
- React components (test actual rendering)
- Next.js routing (use MSW or similar for integration tests)
- Type definitions

## Fixtures and Factories

**Test Data:**
```typescript
// /lib/ai.ts fixtures (proposed)
const mockContentRequest = {
  businessType: 'Coffee Shop',
  platform: 'Twitter',
  tone: 'Professional',
  topic: 'Morning specials',
  keywords: ['coffee', 'morning', 'specials'],
};

const mockGeneratedContent = {
  post: 'Start your morning right with our exclusive coffee specials!',
  hashtags: ['#Coffee', '#Morning', '#Specials'],
  caption: 'Fuel your day with the best coffee in town.',
  callToAction: 'Visit us today!',
};
```

**Location:**
- Inline in test files for simple cases
- `/__fixtures__/` directory for complex shared fixtures (if created)
- Prisma factory functions for database records (if created)

## Coverage

**Requirements:** None enforced currently

**View Coverage:**
```bash
npm run test:run -- --coverage
```

**Coverage Providers:**
- Default: V8 (Vitest standard)
- Threshold: Not configured

**Note:** Coverage reporting is not set up. When adding tests, configure in `vitest.config.ts`:
```typescript
export default {
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
    },
  },
};
```

## Test Types

**Unit Tests:**
- Scope: Individual functions and components
- Example: `generateWithOpenAI()`, `handleGenerate()` in isolation
- Files: Co-located with source (`lib/ai.test.ts`)
- Pattern: Mock dependencies, test business logic

**Integration Tests:**
- Scope: API routes with database and auth
- Example: POST `/api/generate` with mocked OpenAI client
- Files: Co-located with routes (`app/api/generate/route.test.ts`)
- Pattern: Mock external services, test request/response flow

**E2E Tests:**
- Framework: Not currently set up
- Recommendation: Add Playwright or Cypress for full user flows
- Example: User navigates → fills form → generates content → views in dashboard

## Common Patterns

**Async Testing:**
```typescript
// API route testing
describe('POST /api/generate', () => {
  it('should return generated content', async () => {
    const request = new NextRequest('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify(mockContentRequest),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('post');
  });
});

// React component async testing
it('should fetch content on mount', async () => {
  render(<DashboardPage />);

  await waitFor(() => {
    expect(screen.getByText('Loading content...')).not.toBeInTheDocument();
  });
});
```

**Error Testing:**
```typescript
// API error responses
it('should return 400 for missing fields', async () => {
  const request = new NextRequest('http://localhost/api/generate', {
    method: 'POST',
    body: JSON.stringify({ businessType: 'Test' }),
  });

  const response = await POST(request);
  const data = await response.json();

  expect(response.status).toBe(400);
  expect(data.error).toContain('Missing required fields');
});

// Auth error responses
it('should return 401 for unauthenticated requests', async () => {
  vi.mocked(getServerSession).mockResolvedValue(null);

  const request = new NextRequest('http://localhost/api/history');
  const response = await GET(request);

  expect(response.status).toBe(401);
});

// Client-side error handling
it('should show error alert on generation failure', async () => {
  vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
  window.alert = vi.fn();

  const { getByRole } = render(<GeneratePage />);
  await userEvent.click(getByRole('button', { name: /generate/i }));

  expect(window.alert).toHaveBeenCalledWith('Failed to generate content. Please try again.');
});
```

**Form Interaction Testing:**
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GeneratePage from '../page';

it('should update state when user types', async () => {
  render(<GeneratePage />);

  const input = screen.getByLabelText(/business type/i);
  await userEvent.type(input, 'Coffee Shop');

  expect(input).toHaveValue('Coffee Shop');
});

it('should send correct payload on submit', async () => {
  const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => mockGeneratedContent,
  });

  render(<GeneratePage />);

  await userEvent.type(screen.getByLabelText(/business type/i), 'Coffee Shop');
  await userEvent.click(screen.getByRole('button', { name: /generate/i }));

  expect(mockFetch).toHaveBeenCalledWith('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: expect.stringContaining('Coffee Shop'),
  });
});
```

## Testing Setup (Recommended)

**Vitest Configuration:**
Create `/home/pc/Documents/Hackthon/Content-Hub/vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./__tests__/setup.ts'],
  },
});
```

**Setup File:**
Create `/home/pc/Documents/Hackthon/Content-Hub/__tests__/setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

**Required Packages:**
```bash
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

## Test Coverage Priorities

**High Priority:**
- `/lib/ai.ts` - Core AI generation functions
- `/app/api/generate/route.ts` - POST endpoint validation and error handling
- `/app/api/history/route.ts` - Auth and data retrieval

**Medium Priority:**
- `/app/generate/page.tsx` - Form interactions and async calls
- `/app/dashboard/page.tsx` - Data fetching and display

**Low Priority:**
- `/lib/prisma.ts` - Singleton setup (mostly configuration)
- `/app/layout.tsx` - Root layout (static)

---

*Testing analysis: 2026-07-18*
