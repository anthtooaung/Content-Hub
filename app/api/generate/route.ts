import { NextRequest, NextResponse } from 'next/server';
import { generateWithAISDK, ContentRequest } from '@/lib/ai';
import { scoreContent } from '@/lib/scoring';
import { generateRequestSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = generateRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const req: ContentRequest = parsed.data;
    const result = await generateWithAISDK(req);
    const content = result;

    const score = scoreContent({
      post: content.post,
      hashtags: content.hashtags,
      callToAction: content.callToAction,
    });

    return NextResponse.json({
      post: content.post,
      hashtags: content.hashtags,
      caption: content.caption,
      callToAction: content.callToAction,
      score,
      model: content.model,
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
