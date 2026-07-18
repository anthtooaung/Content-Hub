import { prisma } from './prisma';

const TICKETS_PER_DAY = 15;
const TICKETS_PER_GENERATION = 3;
const RESET_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface TicketState {
  remaining: number;
  total: number;
  usedToday: number;
  resetAt: Date;
  canGenerate: boolean;
  generationsLeft: number;
  nextRefreshAt: Date;
}

/**
 * Get the current ticket state for a user.
 * Auto-resets tickets if 24h have passed since last reset.
 */
export async function getTicketState(userId: string): Promise<TicketState> {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      tickets_remaining: true,
      ticket_reset_at: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const now = new Date();
  let remaining = user.tickets_remaining;
  let resetAt = new Date(user.ticket_reset_at);

  // Auto-reset if 24h have passed
  if (now.getTime() - resetAt.getTime() >= RESET_INTERVAL_MS) {
    remaining = TICKETS_PER_DAY;
    resetAt = now;

    await prisma.users.update({
      where: { id: userId },
      data: {
        tickets_remaining: TICKETS_PER_DAY,
        ticket_reset_at: now,
      },
    });
  }

  const usedToday = TICKETS_PER_DAY - remaining;
  const generationsLeft = Math.floor(remaining / TICKETS_PER_GENERATION);
  const nextRefreshAt = new Date(resetAt.getTime() + RESET_INTERVAL_MS);

  return {
    remaining,
    total: TICKETS_PER_DAY,
    usedToday,
    resetAt,
    canGenerate: remaining >= TICKETS_PER_GENERATION,
    generationsLeft,
    nextRefreshAt,
  };
}

/**
 * Deduct tickets after a successful generation.
 * Returns the updated ticket state.
 */
export async function deductTickets(userId: string): Promise<TicketState> {
  const state = await getTicketState(userId);

  if (!state.canGenerate) {
    throw new Error('Insufficient tickets');
  }

  const newRemaining = state.remaining - TICKETS_PER_GENERATION;

  await prisma.users.update({
    where: { id: userId },
    data: { tickets_remaining: newRemaining },
  });

  return {
    ...state,
    remaining: newRemaining,
    usedToday: TICKETS_PER_DAY - newRemaining,
    canGenerate: newRemaining >= TICKETS_PER_GENERATION,
    generationsLeft: Math.floor(newRemaining / TICKETS_PER_GENERATION),
  };
}
