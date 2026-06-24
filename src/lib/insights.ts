import { useCalendarStore } from "@/stores/calendarStore";
import { useProgressStore } from "@/stores/progressStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { getLastNDays } from "@/lib/date-utils";

export function generateInsights(): string[] {
  const insights: string[] = [];
  const calendar = useCalendarStore.getState().days;
  const profile = useSettingsStore.getState().profile;
  const progress = useProgressStore.getState();

  const last30 = getLastNDays(30);
  const last30Records = last30.map((d) => calendar[d]).filter(Boolean);

  if (last30Records.length >= 7) {
    const waterHits = last30Records.filter(
      (r) => (r?.waterMl ?? 0) >= profile.dailyWaterGoal
    ).length;
    const waterPct = Math.round((waterHits / last30Records.length) * 100);
    if (waterPct > 0) {
      insights.push(
        `Water goal achieved ${waterPct}% of the time this month.`
      );
    }

    const proteinHits = last30Records.filter(
      (r) => (r?.proteinG ?? 0) >= profile.dailyProteinGoal
    ).length;
    const proteinPct = Math.round((proteinHits / last30Records.length) * 100);
    if (proteinPct > 0) {
      insights.push(
        `Protein goal completion at ${proteinPct}% over the last 30 days.`
      );
    }
  }

  const weightChange = progress.getWeightChange(30);
  if (weightChange !== null && weightChange !== 0) {
    const dir = weightChange < 0 ? "decreased" : "increased";
    insights.push(
      `Weight ${dir} by ${Math.abs(weightChange)} kg over the last 30 days.`
    );
  }

  let workoutStreak = 0;
  const sortedDates = Object.keys(calendar).sort().reverse();
  for (const date of sortedDates) {
    if (calendar[date]?.workoutCompletion?.completed) workoutStreak++;
    else break;
  }
  if (workoutStreak >= 2) {
    insights.push(
      `You completed workouts ${workoutStreak} days in a row.`
    );
  }

  const avgScore =
    last30Records.reduce((s, r) => s + (r?.dailyScore ?? 0), 0) /
    (last30Records.length || 1);
  if (avgScore >= 70) {
    insights.push(
      `Your average daily score is ${Math.round(avgScore)}/100 this month.`
    );
  }

  return insights.slice(0, 4);
}
