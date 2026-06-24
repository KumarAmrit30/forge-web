import { useCalendarStore } from "@/stores/calendarStore";
import { useWaterStore } from "@/stores/waterStore";
import { useWorkoutStore } from "@/stores/workoutStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { calculateScore } from "@/lib/scoring";
import type { DayRecord } from "@/types";
import { todayKey } from "@/lib/date-utils";

const DEFAULT_MORNING = [
  "Face Wash",
  "Moisturizer",
  "Sunscreen",
  "Breakfast",
];

const DEFAULT_NIGHT = [
  "Face Wash",
  "Moisturizer",
  "Apply Minoxidil",
  "Sleep Goal",
];

export function getDefaultDayRecord(date: string): DayRecord {
  const morningChecklist: Record<string, boolean> = {};
  DEFAULT_MORNING.forEach((k) => (morningChecklist[k] = false));

  const nightChecklist: Record<string, boolean> = {};
  DEFAULT_NIGHT.forEach((k) => (nightChecklist[k] = false));

  return {
    date,
    waterMl: 0,
    waterEntries: [],
    proteinG: 0,
    sleepHours: 0,
    steps: 0,
    morningChecklist,
    dayChecklist: {
      "Protein Goal": false,
      "Water Goal": false,
      "Step Goal": false,
    },
    nightChecklist,
    habits: {},
    notes: "",
  };
}

export function getOrCreateTodayRecord(): DayRecord {
  const date = todayKey();
  const existing = useCalendarStore.getState().getDay(date);
  if (existing) return { ...existing };
  return getDefaultDayRecord(date);
}

export function updateTodayRecord(updates: Partial<DayRecord>): DayRecord {
  const date = todayKey();
  const base = getOrCreateTodayRecord();
  const waterTotal = useWaterStore.getState().getTodayTotal();
  const waterEntries = useWaterStore.getState().getTodayEntries();
  const session = useWorkoutStore.getState().getTodaySession();

  const merged: DayRecord = {
    ...base,
    ...updates,
    date,
    waterMl: waterTotal,
    waterEntries,
    workoutCompletion: session ?? base.workoutCompletion,
  };

  const scores = calculateScore(merged);
  merged.dailyScore = scores.current.total;
  merged.projectedScore = scores.projected.total;

  useCalendarStore.getState().upsertDay(merged);
  useSettingsStore.getState().updateStreak(date);

  return merged;
}

export function syncTodayFromStores(): DayRecord {
  return updateTodayRecord({});
}
