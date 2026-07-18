import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTicketState } from '@/lib/tickets';

// GET /api/profile - Get user profile with connected accounts
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar_url: true,
        created_at: true,
        social_connections: {
          select: {
            id: true,
            provider: true,
            provider_username: true,
            connected_at: true,
            is_active: true,
          },
          where: {
            is_active: true,
          },
          orderBy: {
            connected_at: 'desc',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get ticket state (auto-resets if 24h passed)
    const tickets = await getTicketState(session.user.id);

    return NextResponse.json({ ...user, tickets });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/profile - Update profile or disconnect account
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, connectionId } = body;

    if (action === 'disconnect' && connectionId) {
      // Disconnect a social account
      const connection = await prisma.social_connections.findFirst({
        where: {
          id: connectionId,
          user_id: session.user.id,
        },
      });

      if (!connection) {
        return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
      }

      await prisma.social_connections.update({
        where: { id: connectionId },
        data: { is_active: false },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/profile - Delete user account and all data
export async function DELETE() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    // Delete in order due to foreign key constraints
    // 1. Delete social connections
    await prisma.social_connections.deleteMany({
      where: { user_id: userId },
    });

    // 2. Delete published posts
    await prisma.published_posts.deleteMany({
      where: { user_id: userId },
    });

    // 3. Delete saved posts
    await prisma.saved_posts.deleteMany({
      where: { user_id: userId },
    });

    // 4. Delete AI responses (via content_generations)
    const generations = await prisma.content_generations.findMany({
      where: { user_id: userId },
      select: { id: true },
    });

    if (generations.length > 0) {
      const generationIds = generations.map(g => g.id);

      await prisma.ai_responses.deleteMany({
        where: { content_generation_id: { in: generationIds } },
      });

      await prisma.content_generations.deleteMany({
        where: { user_id: userId },
      });
    }

    // 5. Delete businesses
    await prisma.businesses.deleteMany({
      where: { user_id: userId },
    });

    // 6. Delete Content records
    await prisma.content.deleteMany({
      where: { userId: userId },
    });

    // 7. Finally delete the user
    await prisma.users.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
