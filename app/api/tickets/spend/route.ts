import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { spendTickets, GENERATION_COST } from '@/lib/tickets';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ok, balance, resetsAt } = await spendTickets(session.user.id);

    if (!ok) {
      return NextResponse.json(
        { error: 'Not enough tickets', balance, resetsAt, cost: GENERATION_COST },
        { status: 402 }
      );
    }

    return NextResponse.json({ balance, resetsAt, cost: GENERATION_COST });
  } catch (error) {
    console.error('Ticket spend error:', error);
    return NextResponse.json(
      { error: 'Failed to spend tickets' },
      { status: 500 }
    );
  }
}
