import { useGoalStore } from "@/stores/goalStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useProgressStore } from "@/stores/progressStore";

export function syncGoalsFromMetrics(): void {
  const profile = useSettingsStore.getState().profile;
  const latestWeight = useProgressStore.getState().getLatestWeight();
  const goals = useGoalStore.getState().goals;

  for (const goal of goals) {
    if (!goal.active) continue;

    if (goal.unit === "kg" && goal.title.toLowerCase().includes("weight")) {
      useGoalStore.getState().updateGoal(goal.id, {
        current: latestWeight ?? profile.currentWeight,
      });
    }
  }
}

export function syncGoalsFromDayRecord(record: {
  proteinG?: number;
  waterMl?: number;
  steps?: number;
  sleepHours?: number;
}): void {
  const goals = useGoalStore.getState().goals;
  const profile = useSettingsStore.getState().profile;

  for (const goal of goals) {
    if (!goal.active) continue;
    const title = goal.title.toLowerCase();

    if (title.includes("protein") && record.proteinG != null) {
      useGoalStore.getState().updateGoal(goal.id, {
        current: record.proteinG,
        target: profile.dailyProteinGoal,
      });
    }
    if (title.includes("water") && record.waterMl != null) {
      useGoalStore.getState().updateGoal(goal.id, {
        current: record.waterMl,
        target: profile.dailyWaterGoal,
      });
    }
  }
}
