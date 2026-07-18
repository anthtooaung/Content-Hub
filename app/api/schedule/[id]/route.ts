import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Verify scheduled post belongs to user
    const existingPost = await prisma.scheduledPost.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Scheduled post not found' },
        { status: 404 }
      );
    }

    // Can only update scheduled posts
    if (existingPost.status !== 'scheduled') {
      return NextResponse.json(
        { error: 'Can only update scheduled posts' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    // Allow updating scheduled time
    if (body.scheduledAt) {
      const scheduledDate = new Date(body.scheduledAt);
      if (scheduledDate <= new Date()) {
        return NextResponse.json(
          { error: 'Scheduled time must be in the future' },
          { status: 400 }
        );
      }
      updateData.scheduledAt = scheduledDate;
    }

    // Allow cancelling
    if (body.status === 'cancelled') {
      updateData.status = 'cancelled';
    }

    const updatedPost = await prisma.scheduledPost.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Schedule update error:', error);
    return NextResponse.json(
      { error: 'Failed to update scheduled post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Verify scheduled post belongs to user
    const existingPost = await prisma.scheduledPost.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Scheduled post not found' },
        { status: 404 }
      );
    }

    // Can only cancel scheduled posts
    if (existingPost.status !== 'scheduled') {
      return NextResponse.json(
        { error: 'Can only cancel scheduled posts' },
        { status: 400 }
      );
    }

    await prisma.scheduledPost.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Schedule delete error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel scheduled post' },
      { status: 500 }
    );
  }
}
