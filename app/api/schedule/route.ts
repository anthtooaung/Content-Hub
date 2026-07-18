import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const scheduledPosts = await prisma.scheduledPost.findMany({
      where: { userId: session.user.id },
      include: {
        content: true,
        socialConnection: {
          select: {
            provider: true,
            provider_username: true,
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return NextResponse.json(scheduledPosts);
  } catch (error) {
    console.error('Schedule fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled posts' },
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
    const { contentId, socialConnectionId, scheduledAt } = body;

    if (!contentId || !socialConnectionId || !scheduledAt) {
      return NextResponse.json(
        { error: 'Missing required fields: contentId, socialConnectionId, scheduledAt' },
        { status: 400 }
      );
    }

    // Verify content belongs to user
    const content = await prisma.content.findFirst({
      where: {
        id: contentId,
        userId: session.user.id,
      },
    });

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // Verify social connection belongs to user
    const socialConnection = await prisma.social_connections.findFirst({
      where: {
        id: socialConnectionId,
        user_id: session.user.id,
        is_active: true,
      },
    });

    if (!socialConnection) {
      return NextResponse.json(
        { error: 'Social connection not found' },
        { status: 404 }
      );
    }

    // Validate scheduled time is in the future
    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      );
    }

    const scheduledPost = await prisma.scheduledPost.create({
      data: {
        userId: session.user.id,
        contentId,
        socialConnectionId,
        platform: socialConnection.provider,
        scheduledAt: scheduledDate,
        status: 'scheduled',
      },
      include: {
        content: true,
        socialConnection: {
          select: {
            provider: true,
            provider_username: true,
          },
        },
      },
    });

    return NextResponse.json(scheduledPost);
  } catch (error) {
    console.error('Schedule create error:', error);
    return NextResponse.json(
      { error: 'Failed to create scheduled post' },
      { status: 500 }
    );
  }
}
