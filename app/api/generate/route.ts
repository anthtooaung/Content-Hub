import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateWithOpenAI, generateWithGemini, ContentRequest } from '@/lib/ai';
import { scoreContent } from '@/lib/scoring';
import { getTicketState, deductTickets } from '@/lib/tickets';

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

    // Check tickets for authenticated users
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
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

    // Deduct tickets for authenticated users after successful generation
    let tickets;
    if (session?.user?.id) {
      tickets = await deductTickets(session.user.id);
    }

    return NextResponse.json({
      ...content,
      score,
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
