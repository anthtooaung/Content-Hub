export const PLATFORM_GUIDELINES: Record<string, { maxChars: number; hashtagRange: [number, number]; style: string }> = {
  Facebook: { maxChars: 600, hashtagRange: [3, 5], style: 'Warm, story-driven, encourage comments/shares.' },
  Instagram: { maxChars: 500, hashtagRange: [8, 15], style: 'Visual-first caption, line breaks, emoji-friendly.' },
  TikTok: { maxChars: 300, hashtagRange: [3, 6], style: 'Hook in first line, trend-aware, casual tone.' },
};

export const EMOTION_TONE_MAP: Record<string, string> = {
  excitement: 'high-energy, exclamation-forward, urgent',
  trust: 'calm, credible, evidence-backed',
  curiosity: 'question-led, teaser phrasing, withhold the payoff',
  urgency: 'scarcity language, deadline framing, direct CTA',
  joy: 'playful, light, celebratory',
  inspiration: 'aspirational, forward-looking, empowering',
};

export const AGE_GROUP_LANGUAGE: Record<string, string> = {
  'gen-z': 'Slang-aware, minimal punctuation formality, short sentences, trend references.',
  millennial: 'Conversational, mild irony welcome, nostalgia cues sparing.',
  'gen-x': 'Direct, practical, respect their time, no forced slang.',
  boomer: 'Clear and formal, spell out abbreviations, avoid slang entirely.',
};

interface PromptContext {
  businessName: string;
  platform: string;
  emotion: string;
  audienceAge: string;
  prompt: string;
  style?: string;
}

export function buildSystemPrompt(ctx: PromptContext): string {
  const platform = PLATFORM_GUIDELINES[ctx.platform] ?? PLATFORM_GUIDELINES.Facebook;
  const tone = EMOTION_TONE_MAP[ctx.emotion] ?? ctx.emotion;
  const ageLanguage = AGE_GROUP_LANGUAGE[ctx.audienceAge] ?? '';

  return `You write social media content for ${ctx.businessName} on ${ctx.platform}.

Campaign brief: ${ctx.prompt}
${ctx.style ? `Content style to follow: ${ctx.style}` : ''}

Emotional tone: ${tone}
Audience: ${ctx.audienceAge} — ${ageLanguage}

Platform rules for ${ctx.platform}:
- Post body must stay under ${platform.maxChars} characters.
- ${platform.hashtagRange[0]}-${platform.hashtagRange[1]} hashtags, relevant and non-generic.
- Style: ${platform.style}

Produce a post, hashtags, a caption, and a call-to-action that match the brief, tone, platform rules, and audience above.`;
}

export function buildStyleSuggestionPrompt(platform: string): string {
  const platformInfo = PLATFORM_GUIDELINES[platform] ?? PLATFORM_GUIDELINES.Facebook;

  return `Suggest 3 distinct trending content styles for a ${platform} post.

Platform style baseline: ${platformInfo.style}

For each style provide:
- name: short label (2-4 words)
- description: what makes this style work on ${platform}, 1 sentence
- hook: an example opening line/hook in this style

Return styles that are meaningfully different from each other in structure or angle.`;
}
