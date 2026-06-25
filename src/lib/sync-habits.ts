import { useHabitStore } from "@/stores/habitStore";
import { updateTodayRecord } from "@/lib/sync-day";
import { todayKey } from "@/lib/date-utils";

export function syncHabitsToTodayRecord() {
  const date = todayKey();
  const { habits, completions } = useHabitStore.getState();
  const dayCompletions = completions[date];
  const habitMap: Record<string, boolean> = {};

  for (const habit of habits) {
    if (!habit.active) continue;
    habitMap[habit.id] = dayCompletions?.[habit.id] ?? false;
  }

  return updateTodayRecord({ habits: habitMap });
}
