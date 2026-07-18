import { prisma } from '@/lib/prisma';

export const DAILY_TICKETS = 15;
export const GENERATION_COST = 3;

/** Midnight (00:00) of the given date, in server-local time. */
export function startOfServerDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Midnight of the day after the given date, in server-local time. */
function startOfNextServerDay(d: Date): Date {
  const start = startOfServerDay(d);
  start.setDate(start.getDate() + 1);
  return start;
}

export interface TicketState {
  balance: number;
  resetsAt: Date;
}

export interface SpendResult {
  ok: boolean;
  balance: number;
  resetsAt: Date;
}

/**
 * Read the user's ticket balance, lazily applying the daily reset if the
 * last reset predates today's midnight. Persists the reset when it fires.
 */
export async function getTicketState(userId: string): Promise<TicketState> {
  const user = await prisma.users.findUniqueOrThrow({
    where: { id: userId },
    select: { ticket_balance: true, tickets_reset_at: true },
  });

  const now = new Date();
  const todayStart = startOfServerDay(now);

  if (user.tickets_reset_at < todayStart) {
    const updated = await prisma.users.update({
      where: { id: userId },
      data: { ticket_balance: DAILY_TICKETS, tickets_reset_at: now },
      select: { ticket_balance: true },
    });
    return { balance: updated.ticket_balance, resetsAt: startOfNextServerDay(now) };
  }

  return { balance: user.ticket_balance, resetsAt: startOfNextServerDay(now) };
}

/**
 * Atomically apply the lazy daily reset (if due) and deduct GENERATION_COST.
 * Uses a transaction with a conditional update so concurrent spends can't
 * drive the balance negative.
 */
export async function spendTickets(userId: string): Promise<SpendResult> {
  return prisma.$transaction(async (tx) => {
    const user = await tx.users.findUniqueOrThrow({
      where: { id: userId },
      select: { ticket_balance: true, tickets_reset_at: true },
    });

    const now = new Date();
    const todayStart = startOfServerDay(now);
    const resetsAt = startOfNextServerDay(now);
    const resetDue = user.tickets_reset_at < todayStart;
    const effectiveBalance = resetDue ? DAILY_TICKETS : user.ticket_balance;

    if (effectiveBalance < GENERATION_COST) {
      // Persist the reset even if we can't afford the spend, so the
      // reflected balance is accurate.
      if (resetDue) {
        await tx.users.update({
          where: { id: userId },
          data: { ticket_balance: DAILY_TICKETS, tickets_reset_at: now },
        });
      }
      return { ok: false, balance: effectiveBalance, resetsAt };
    }

    if (resetDue) {
      // Reset and spend together in one write.
      const updated = await tx.users.update({
        where: { id: userId },
        data: { ticket_balance: effectiveBalance - GENERATION_COST, tickets_reset_at: now },
        select: { ticket_balance: true },
      });
      return { ok: true, balance: updated.ticket_balance, resetsAt };
    }

    // No reset due: conditional decrement guards against concurrent
    // spends racing the balance below zero.
    const result = await tx.users.updateMany({
      where: { id: userId, ticket_balance: { gte: GENERATION_COST } },
      data: { ticket_balance: { decrement: GENERATION_COST } },
    });

    if (result.count === 0) {
      // Lost the race — someone else spent first.
      const fresh = await tx.users.findUniqueOrThrow({
        where: { id: userId },
        select: { ticket_balance: true },
      });
      return { ok: false, balance: fresh.ticket_balance, resetsAt };
    }

    const fresh = await tx.users.findUniqueOrThrow({
      where: { id: userId },
      select: { ticket_balance: true },
    });
    return { ok: true, balance: fresh.ticket_balance, resetsAt };
  });
}
