import { useWaterStore } from "@/stores/waterStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { todayKey } from "@/lib/date-utils";

export function computeWaterStreaks(): {
  current: number;
  longest: number;
} {
  const logs = useWaterStore.getState().dailyLogs;
  const goal = useSettingsStore.getState().profile.dailyWaterGoal;
  const dates = Object.keys(logs).sort();

  let longest = 0;
  let current = 0;
  let run = 0;

  for (const date of dates) {
    const met = (logs[date]?.totalMl ?? 0) >= goal;
    if (met) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }

  const today = todayKey();
  let streakDate = today;
  while (logs[streakDate]?.totalMl >= goal) {
    current++;
    const d = new Date(streakDate);
    d.setDate(d.getDate() - 1);
    streakDate = d.toISOString().split("T")[0];
  }

  return { current, longest: Math.max(longest, current) };
}

export function refreshWaterStreaks(): void {
  const { current, longest } = computeWaterStreaks();
  useWaterStore.getState().setStreaks(current, longest);
}
