import { BACKUP_SCHEMA_VERSION } from "@/types";
import { getSettingsSnapshot, hydrateSettings } from "@/stores/settingsStore";
import { getGoalSnapshot, hydrateGoals } from "@/stores/goalStore";
import { getWaterSnapshot, hydrateWater } from "@/stores/waterStore";
import { getWorkoutSnapshot, hydrateWorkout } from "@/stores/workoutStore";
import { getHabitSnapshot, hydrateHabits } from "@/stores/habitStore";
import { getProgressSnapshot, hydrateProgress } from "@/stores/progressStore";
import { getCalendarSnapshot, hydrateCalendar } from "@/stores/calendarStore";
import { getBlueprintSnapshot, hydrateBlueprint } from "@/stores/blueprintStore";
import {
  getWeeklyReviewSnapshot,
  hydrateWeeklyReview,
} from "@/stores/weeklyReviewStore";
import {
  getCheckpointSnapshot,
  hydrateCheckpoints,
} from "@/stores/checkpointStore";
import {
  getNotificationSnapshot,
  hydrateNotifications,
} from "@/stores/notificationStore";
import {
  exportPhotosAsBase64,
  importPhotosFromBase64,
} from "@/lib/photo-storage";

type BackupData = {
  schemaVersion: number;
  exportedAt: string;
  appName: string;
  stores: {
    settings: ReturnType<typeof getSettingsSnapshot>;
    goals: ReturnType<typeof getGoalSnapshot>;
    water: ReturnType<typeof getWaterSnapshot>;
    workout: ReturnType<typeof getWorkoutSnapshot>;
    habits: ReturnType<typeof getHabitSnapshot>;
    progress: ReturnType<typeof getProgressSnapshot>;
    calendar: ReturnType<typeof getCalendarSnapshot>;
    blueprint: ReturnType<typeof getBlueprintSnapshot>;
    weeklyReview: ReturnType<typeof getWeeklyReviewSnapshot>;
    checkpoints: ReturnType<typeof getCheckpointSnapshot>;
    notifications: ReturnType<typeof getNotificationSnapshot>;
  };
  photos?: Record<string, string>;
};

function collectStoreData(): BackupData["stores"] {
  return {
    settings: getSettingsSnapshot(),
    goals: getGoalSnapshot(),
    water: getWaterSnapshot(),
    workout: getWorkoutSnapshot(),
    habits: getHabitSnapshot(),
    progress: getProgressSnapshot(),
    calendar: getCalendarSnapshot(),
    blueprint: getBlueprintSnapshot(),
    weeklyReview: getWeeklyReviewSnapshot(),
    checkpoints: getCheckpointSnapshot(),
    notifications: getNotificationSnapshot(),
  };
}

function hydrateAllStores(stores: BackupData["stores"]): void {
  hydrateSettings(stores.settings);
  hydrateGoals(stores.goals);
  hydrateWater(stores.water);
  hydrateWorkout(stores.workout);
  hydrateHabits(stores.habits);
  hydrateProgress(stores.progress);
  hydrateCalendar(stores.calendar);
  hydrateBlueprint(stores.blueprint);
  hydrateWeeklyReview(stores.weeklyReview);
  hydrateCheckpoints(stores.checkpoints);
  hydrateNotifications(stores.notifications);
}

export async function exportDataBackup(): Promise<void> {
  const backup: BackupData = {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    appName: "Forge",
    stores: collectStoreData(),
  };
  downloadJson(backup, "forge-backup.json");
}

export async function exportFullBackup(): Promise<void> {
  const photos = await exportPhotosAsBase64();
  const backup: BackupData = {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    appName: "Forge",
    stores: collectStoreData(),
    photos,
  };
  downloadJson(backup, "forge-backup-full.json");
}

export async function importBackup(file: File): Promise<void> {
  const text = await file.text();
  const backup = JSON.parse(text) as BackupData;

  if (backup.schemaVersion !== BACKUP_SCHEMA_VERSION) {
    throw new Error("Unsupported backup version");
  }

  hydrateAllStores(backup.stores);

  if (backup.photos) {
    await importPhotosFromBase64(backup.photos);
  }
}

function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
