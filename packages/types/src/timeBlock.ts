export type DayOfWeek = number;

export type TimeBlock = {
  id: string;
  startTime: Date;
  endTime: Date;
  startDayOfWeek: DayOfWeek;
  endDayOfWeek: DayOfWeek;
  type: string;
  userId: string;
}