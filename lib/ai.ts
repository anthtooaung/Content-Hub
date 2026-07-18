import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// OpenAI setup
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Gemini setup
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

  // Extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error('Failed to parse AI response');
}
