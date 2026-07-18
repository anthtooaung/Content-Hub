import { NextRequest, NextResponse } from 'next/server';
import { generateWithOpenAI, generateWithGemini, ContentRequest } from '@/lib/ai';
import { scoreContent } from '@/lib/scoring';

export async function POST(request: NextRequest) {
  try {
    const body: ContentRequest = await request.json();

    // Validate required fields
    if (!body.businessType || !body.platform || !body.tone) {
      return NextResponse.json(
        { error: 'Missing required fields: businessType, platform, tone' },
        { status: 400 }
      );
    }

    let content;

    // Try OpenAI first, fallback to Gemini on failure
    if (process.env.OPENAI_API_KEY) {
      try {
        content = await generateWithOpenAI(body);
      } catch (openaiError) {
        console.warn('OpenAI failed, falling back to Gemini:', openaiError);
        if (process.env.GEMINI_API_KEY) {
          content = await generateWithGemini(body);
        } else {
          throw openaiError;
        }
      }
    } else if (process.env.GEMINI_API_KEY) {
      content = await generateWithGemini(body);
    } else {
      return NextResponse.json(
        { error: 'No AI API key configured' },
        { status: 500 }
      );
    }

    // Calculate content score
    const score = scoreContent({
      post: content.post,
      hashtags: content.hashtags,
      callToAction: content.callToAction,
    });

    return NextResponse.json({
      ...content,
      score,
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
