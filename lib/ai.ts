import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGroq } from '@ai-sdk/groq';
import { z } from 'zod';

// Legacy OpenAI setup
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Legacy Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

export interface ContentRequest {
  businessType: string;
  platform: string;
  tone: string;
  emotion?: string;
  ageGroup?: string;
  topic?: string;
  keywords?: string[];
  businessName?: string;
  audienceAge?: string;
  style?: string;
}

export interface GeneratedContent {
  post: string;
  hashtags: string[];
  caption: string;
  callToAction: string;
}

export async function generateWithOpenAI(request: ContentRequest): Promise<GeneratedContent> {
  const prompt = `Generate a social media post for a ${request.businessType} business on ${request.platform}.
Tone: ${request.tone}
${request.emotion ? `Emotional resonance: ${request.emotion}` : ''}
${request.ageGroup ? `Target audience age group: ${request.ageGroup}` : ''}
${request.topic ? `Topic: ${request.topic}` : ''}
${request.keywords ? `Keywords: ${request.keywords.join(', ')}` : ''}

Please provide:
1. A engaging post (under 280 characters for Twitter, longer for other platforms)
2. 5-10 relevant hashtags
3. A caption
4. A call-to-action

Format the response as JSON with these fields: post, hashtags, caption, callToAction`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0].message.content;
  return JSON.parse(content || '{}');
}

export async function generateWithGemini(request: ContentRequest): Promise<GeneratedContent> {
  const prompt = `Generate a social media post for a ${request.businessType} business on ${request.platform}.
Tone: ${request.tone}
${request.emotion ? `Emotional resonance: ${request.emotion}` : ''}
${request.ageGroup ? `Target audience age group: ${request.ageGroup}` : ''}
${request.topic ? `Topic: ${request.topic}` : ''}
${request.keywords ? `Keywords: ${request.keywords.join(', ')}` : ''}

Please provide:
1. A engaging post (under 280 characters for Twitter, longer for other platforms)
2. 5-10 relevant hashtags
3. A caption
4. A call-to-action

Format the response as JSON with these fields: post, hashtags, caption, callToAction`;

  const result = await geminiModel.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error('Failed to parse AI response');
}

// --- Vercel AI SDK structured generation (4-tier fallback) ---

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
