import { useHabitStore } from "@/stores/habitStore";
import { isHabitDueOnDate } from "@/lib/habit-utils";
import { updateTodayRecord } from "@/lib/sync-day";
import { todayKey } from "@/lib/date-utils";

export function syncHabitsToTodayRecord() {
  const date = todayKey();
  const { habits, completions } = useHabitStore.getState();
  const dayCompletions = completions[date];
  const habitMap: Record<string, boolean> = {};
  const today = new Date(`${date}T12:00:00`);

  for (const habit of habits) {
    if (!isHabitDueOnDate(habit, today)) continue;
    habitMap[habit.id] = dayCompletions?.[habit.id] ?? false;
  }

  return updateTodayRecord({ habits: habitMap });
}
