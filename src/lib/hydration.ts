import { useSettingsStore } from "@/stores/settingsStore";
import { useGoalStore } from "@/stores/goalStore";
import { useWaterStore } from "@/stores/waterStore";
import { useWorkoutStore } from "@/stores/workoutStore";
import { useHabitStore } from "@/stores/habitStore";
import { useProgressStore } from "@/stores/progressStore";
import { useCalendarStore } from "@/stores/calendarStore";
import { useBlueprintStore } from "@/stores/blueprintStore";
import { useWeeklyReviewStore } from "@/stores/weeklyReviewStore";
import { useCheckpointStore } from "@/stores/checkpointStore";
import { useNotificationStore } from "@/stores/notificationStore";

const stores = [
  useSettingsStore,
  useGoalStore,
  useWaterStore,
  useWorkoutStore,
  useHabitStore,
  useProgressStore,
  useCalendarStore,
  useBlueprintStore,
  useWeeklyReviewStore,
  useCheckpointStore,
  useNotificationStore,
];

export async function waitForForgeHydration(): Promise<void> {
  await Promise.all(
    stores.map(
      (useStore) =>
        new Promise<void>((resolve) => {
          if (useStore.persist.hasHydrated()) {
            resolve();
            return;
          }
          const unsub = useStore.persist.onFinishHydration(() => {
            unsub();
            resolve();
          });
        })
    )
  );
}
