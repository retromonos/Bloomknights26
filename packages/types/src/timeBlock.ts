export type DayOfWeek = number;

export type TimeBlock = {
  start: Date;
  end: Date;
  startDayOfWeek: DayOfWeek;
  endDayOfWeek: DayOfWeek;
}