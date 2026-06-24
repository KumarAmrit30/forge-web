import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  subDays,
  isSunday,
  startOfMonth,
  getDay,
  addDays,
} from "date-fns";

export function todayKey(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function formatDate(date: Date | string, fmt = "MMM d"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, fmt);
}

export function getWeekStart(date = new Date()): string {
  return format(startOfWeek(date, { weekStartsOn: 0 }), "yyyy-MM-dd");
}

export function getWeekDays(weekStart: string): string[] {
  const start = parseISO(weekStart);
  const end = endOfWeek(start, { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end }).map((d) => format(d, "yyyy-MM-dd"));
}

export function getLastNDays(n: number): string[] {
  const today = new Date();
  return Array.from({ length: n }, (_, i) =>
    format(subDays(today, n - 1 - i), "yyyy-MM-dd")
  );
}

export function isSundayToday(): boolean {
  return isSunday(new Date());
}

export function currentMonthKey(): string {
  return format(new Date(), "yyyy-MM");
}

export function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1);
  const startPad = getDay(first);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];

  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function formatTimeNow(): string {
  return format(new Date(), "HH:mm");
}

export function isFirstWeekOfMonth(): boolean {
  const today = new Date();
  const firstWeekEnd = addDays(startOfMonth(today), 6);
  return today <= firstWeekEnd;
}
