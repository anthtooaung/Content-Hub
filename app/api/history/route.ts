import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { scoreContent } from '@/lib/scoring';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const content = await prisma.content.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Calculate content score
    const score = scoreContent({
      post: body.post,
      hashtags: body.hashtags,
      callToAction: body.callToAction,
    });

    const content = await prisma.content.create({
      data: {
        userId: session.user.id,
        platform: body.platform,
        tone: body.tone,
        topic: body.topic,
        post: body.post,
        hashtags: body.hashtags,
        caption: body.caption,
        callToAction: body.callToAction,
        scoreReadability: score.readability,
        scoreHashtagRelevance: score.hashtagRelevance,
        scoreCtaStrength: score.ctaStrength,
        scoreOverall: score.overall,
        scoreGrade: score.grade,
        scoreSuggestions: JSON.stringify(score.suggestions),
      },
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('Content save error:', error);
    return NextResponse.json(
      { error: 'Failed to save content' },
      { status: 500 }
    );
  }
}
