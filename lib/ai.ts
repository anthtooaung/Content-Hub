import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGroq } from '@ai-sdk/groq';
import { z } from 'zod';
import { buildSystemPrompt } from './generation-prompts';

export interface ContentRequest {
  businessType: string;
  platform: string;
  tone: string;
  emotion?: string;
  ageGroup?: string;
  topic?: string;
  keywords?: string[];
}

export interface GeneratedContent {
  post: string;
  hashtags: string[];
  caption: string;
  callToAction: string;
}

// --- 4-tier fallback: OpenRouter → Groq ---

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

interface ProviderTier {
  label: string;
  model: ReturnType<typeof openrouter> | ReturnType<typeof groq>;
}

const PROVIDER_CHAIN: ProviderTier[] = [
  { label: 'openrouter/gpt-4o-mini', model: openrouter('openai/gpt-4o-mini') },
  { label: 'openrouter/deepseek-v4-flash', model: openrouter('deepseek/deepseek-v4-flash') },
  { label: 'groq/gpt-oss-120b', model: groq('openai/gpt-oss-120b') },
  { label: 'groq/gpt-oss-20b', model: groq('openai/gpt-oss-20b') },
];

const TIMEOUT_MS = 30_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Generation timed out after ${ms}ms`)), ms)
    ),
  ]);
}

async function callWithRetry<T>(
  tier: ProviderTier,
  schema: z.ZodType<T>,
  system: string,
  prompt: string
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { object } = await withTimeout(
        generateObject({ model: tier.model, schema, system, prompt }),
        TIMEOUT_MS
      );
      return object;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

export async function generateStructured<T>(
  schema: z.ZodType<T>,
  system: string,
  prompt: string
): Promise<{ output: T; model: string }> {
  let lastError: unknown;

  for (const tier of PROVIDER_CHAIN) {
    try {
      const output = await callWithRetry(tier, schema, system, prompt);
      return { output, model: tier.label };
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(
    `All providers failed. Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`
  );
}

const contentOutputSchema = z.object({
  post: z.string().describe('The main post body, respecting the platform character limit.'),
  hashtags: z.array(z.string()).describe('Relevant hashtags, within the platform range, without the # symbol.'),
  caption: z.string().describe('A caption accompanying the post.'),
  callToAction: z.string().describe('A short, direct call-to-action.'),
});

export async function generateWithAISDK(
  request: ContentRequest
): Promise<GeneratedContent & { model: string }> {
  const system = buildSystemPrompt(request);
  const { output, model } = await generateStructured(
    contentOutputSchema,
    system,
    request.topic || `Write a ${request.platform} post for this ${request.businessType} business.`
  );
  return { ...output, model };
}
