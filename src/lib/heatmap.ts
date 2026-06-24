import type { HeatmapDay } from "@/types";
import { useCalendarStore } from "@/stores/calendarStore";
import { getLastNDays } from "@/lib/date-utils";

function scoreToLevel(score: number | null | undefined): HeatmapDay["level"] {
  if (score == null) return "empty";
  if (score >= 80) return "green";
  if (score >= 50) return "yellow";
  return "red";
}

export function getHeatmapData(days = 90): HeatmapDay[] {
  const calendar = useCalendarStore.getState().days;
  return getLastNDays(days).map((date) => {
    const record = calendar[date];
    const score = record?.dailyScore ?? null;
    return { date, score, level: scoreToLevel(score) };
  });
}

export function groupHeatmapByWeek(data: HeatmapDay[]): HeatmapDay[][] {
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }
  return weeks;
}
