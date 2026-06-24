import { useCalendarStore } from "@/stores/calendarStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useHabitStore } from "@/stores/habitStore";
import { useProgressStore } from "@/stores/progressStore";
import { getWeekDays } from "@/lib/date-utils";

export type WeeklyMetrics = {
  currentWeight?: number;
  avgSleep: number;
  workoutCompletionPct: number;
  waterCompletionPct: number;
  proteinCompletionPct: number;
  habitCompletionPct: number;
};

export function computeWeeklyMetrics(weekStart: string): WeeklyMetrics {
  const days = getWeekDays(weekStart);
  const calendar = useCalendarStore.getState().days;
  const profile = useSettingsStore.getState().profile;
  const habits = useHabitStore.getState().habits.filter((h) => h.active);
  const completions = useHabitStore.getState().completions;

  let sleepTotal = 0;
  let sleepCount = 0;
  let workoutDone = 0;
  let waterDone = 0;
  let proteinDone = 0;
  let habitDone = 0;
  let habitTotal = 0;

  for (const date of days) {
    const record = calendar[date];
    if (record?.sleepHours) {
      sleepTotal += record.sleepHours;
      sleepCount++;
    }
    if (record?.workoutCompletion?.completed) workoutDone++;
    if ((record?.waterMl ?? 0) >= profile.dailyWaterGoal) waterDone++;
    if ((record?.proteinG ?? 0) >= profile.dailyProteinGoal) proteinDone++;

    for (const habit of habits) {
      habitTotal++;
      if (completions[date]?.[habit.id]) habitDone++;
    }
  }

  const dayCount = days.length;
  const latestWeight = useProgressStore.getState().getLatestWeight();

  return {
    currentWeight: latestWeight ?? profile.currentWeight,
    avgSleep: sleepCount ? Math.round((sleepTotal / sleepCount) * 10) / 10 : 0,
    workoutCompletionPct: Math.round((workoutDone / dayCount) * 100),
    waterCompletionPct: Math.round((waterDone / dayCount) * 100),
    proteinCompletionPct: Math.round((proteinDone / dayCount) * 100),
    habitCompletionPct: habitTotal
      ? Math.round((habitDone / habitTotal) * 100)
      : 0,
  };
}
