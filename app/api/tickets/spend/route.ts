import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { deductTickets } from '@/lib/tickets';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const state = await deductTickets(session.user.id);

    return NextResponse.json(state);
  } catch (error) {
    console.error('Ticket spend error:', error);
    return NextResponse.json(
      { error: 'Failed to spend tickets' },
      { status: 500 }
    );
  }
}
