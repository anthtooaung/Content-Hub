import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateWithAISDK, ContentRequest } from '@/lib/ai';
import { scoreContent } from '@/lib/scoring';
import { generateRequestSchema } from '@/lib/validation';
import { getTicketState, deductTickets } from '@/lib/tickets';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = generateRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Check tickets before generation
    const ticketState = await getTicketState(session.user.id);
    if (!ticketState.canGenerate) {
      return NextResponse.json(
        {
          error: 'insufficient_tickets',
          remaining: ticketState.remaining,
          resetAt: ticketState.nextRefreshAt,
        },
        { status: 402 }
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

    // Deduct tickets for authenticated users after successful generation
    let tickets;
    if (session?.user?.id) {
      tickets = await deductTickets(session.user.id);
    }

    return NextResponse.json({
      post: content.post,
      hashtags: content.hashtags,
      caption: content.caption,
      callToAction: content.callToAction,
      score,
      model: content.model,
      tickets,
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
