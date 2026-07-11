import type { TimeBlock } from "@bloomknights/types";
import { prisma } from "../app";

export async function createTimeBlock(timeBlock: Omit<TimeBlock, "id">): Promise<TimeBlock | null> {
  const result = await prisma.timeBlock.create({
    data: timeBlock
  });

  if (!result) return null;

  return {
    id: result.id,
    startTime: result.startTime,
    endTime: result.endTime,
    startDayOfWeek: result.startDayOfWeek,
    endDayOfWeek: result.endDayOfWeek,
    type: result.type,
    userId: result.userId,
  };
}