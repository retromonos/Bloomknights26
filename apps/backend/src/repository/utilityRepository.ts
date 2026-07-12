import type { UtilityRateWindow } from '../lib/scheduler';
import { prisma } from "../app";

/**
 * Resolves the UtilityRate windows to feed into `generateWeeklySchedule`'s
 * `utilityRates` param, for a given user.
 *
 * If a user could have more than one UtilityInstance, pass `utilityInstanceId`
 * explicitly (e.g. from whichever property/context the PowerItems belong to).
 * Without it, this falls back to the user's oldest UtilityInstance.
 */
export async function getUtilityRatesForUser(
  userId: string,
  utilityInstanceId?: string,
): Promise<UtilityRateWindow[]> {
  const utilityInstance = await prisma.utilityInstance.findFirst({
    where: utilityInstanceId ? { id: utilityInstanceId, userId } : { userId },
    orderBy: { createdAt: 'asc' },
    include: { utility: { include: { utilityRates: true } } },
  });

  if (!utilityInstance) return []; // scheduler degrades gracefully to "no cost preference"

  return utilityInstance.utility.utilityRates.map((r) => ({
    id: r.id,
    rate: r.rate,
    startTime: r.startTime,
    endTime: r.endTime,
  }));
}