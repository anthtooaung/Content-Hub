import { NextRequest, NextResponse } from 'next/server';
import { scoreContent } from '@/lib/scoring';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { post, hashtags, callToAction } = body;

    if (!post || !hashtags) {
      return NextResponse.json(
        { error: 'Missing required fields: post, hashtags' },
        { status: 400 }
      );
    }

    const score = scoreContent({
      post,
      hashtags,
      callToAction,
    });

    return NextResponse.json(score);
  } catch (error) {
    console.error('Score calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate score' },
      { status: 500 }
    );
  }
}
