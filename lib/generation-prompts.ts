export const PLATFORM_GUIDELINES: Record<string, { maxChars: number; hashtagRange: [number, number]; style: string }> = {
  Facebook: { maxChars: 600, hashtagRange: [3, 5], style: 'Warm, story-driven, encourage comments/shares.' },
  Instagram: { maxChars: 500, hashtagRange: [8, 15], style: 'Visual-first caption, line breaks, emoji-friendly.' },
  TikTok: { maxChars: 300, hashtagRange: [3, 6], style: 'Hook in first line, trend-aware, casual tone.' },
};

export const EMOTION_TONE_MAP: Record<string, string> = {
  joy: 'playful, light, celebratory',
  excitement: 'high-energy, exclamation-forward, urgent',
  trust: 'calm, credible, evidence-backed',
  inspiration: 'aspirational, forward-looking, empowering',
  urgency: 'scarcity language, deadline framing, direct CTA',
  curiosity: 'question-led, teaser phrasing, withhold the payoff',
  pride: 'confident, achievement-focused, celebratory of milestones',
  gratitude: 'warm, appreciative, community-focused',
};

export const AGE_GROUP_LANGUAGE: Record<string, string> = {
  'gen-alpha': 'Very short sentences, high-energy, meme-literate, minimal formality.',
  'gen-z': 'Slang-aware, minimal punctuation formality, short sentences, trend references.',
  millennials: 'Conversational, mild irony welcome, nostalgia cues sparing.',
  'gen-x': 'Direct, practical, respect their time, no forced slang.',
  boomers: 'Clear and formal, spell out abbreviations, avoid slang entirely.',
  all: 'Broadly accessible, no generation-specific slang, clear and warm.',
};

interface PromptContext {
  businessType: string;
  platform: string;
  tone: string;
  emotion?: string;
  ageGroup?: string;
  topic?: string;
  keywords?: string[];
}

export function buildSystemPrompt(ctx: PromptContext): string {
  const platform = PLATFORM_GUIDELINES[ctx.platform] ?? PLATFORM_GUIDELINES.Facebook;
  const emotionTone = ctx.emotion ? EMOTION_TONE_MAP[ctx.emotion] ?? ctx.emotion : undefined;
  const ageLanguage = ctx.ageGroup ? AGE_GROUP_LANGUAGE[ctx.ageGroup] : undefined;

  return `You write social media content for a ${ctx.businessType} business on ${ctx.platform}.

${ctx.topic ? `Topic/campaign: ${ctx.topic}` : ''}
Tone: ${ctx.tone}
${emotionTone ? `Emotional resonance: ${emotionTone}` : ''}
${ageLanguage ? `Target audience language style: ${ageLanguage}` : ''}
${ctx.keywords?.length ? `Keywords to weave in: ${ctx.keywords.join(', ')}` : ''}

Platform rules for ${ctx.platform}:
- Post body must stay under ${platform.maxChars} characters.
- ${platform.hashtagRange[0]}-${platform.hashtagRange[1]} hashtags, relevant and non-generic.
- Style: ${platform.style}

Produce a post, hashtags, a caption, and a call-to-action matching all of the above.`;
}
