import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTicketState } from '@/lib/tickets';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { balance, resetsAt } = await getTicketState(session.user.id);

    return NextResponse.json({ balance, resetsAt });
  } catch (error) {
    console.error('Ticket state fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket balance' },
      { status: 500 }
    );
  }
}
