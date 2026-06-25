import { useCalendarStore } from "@/stores/calendarStore";
import { useWaterStore } from "@/stores/waterStore";
import { useWorkoutStore } from "@/stores/workoutStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { calculateScore } from "@/lib/scoring";
import { syncGoalsFromDayRecord } from "@/lib/goals-sync";
import { refreshWaterStreaks } from "@/lib/streaks";
import {
  getMorningRoutineItems,
  getNightRoutineItems,
} from "@/lib/routines";
import type { DayRecord } from "@/types";
import { todayKey } from "@/lib/date-utils";

export function buildDefaultDayRecord(date: string): DayRecord {
  const morningItems = getMorningRoutineItems();
  const nightItems = getNightRoutineItems();

  const morningChecklist: Record<string, boolean> = {};
  morningItems.forEach((k) => (morningChecklist[k] = false));

  const nightChecklist: Record<string, boolean> = {};
  nightItems.forEach((k) => (nightChecklist[k] = false));

  return {
    date,
    waterMl: 0,
    waterEntries: [],
    proteinG: 0,
    sleepHours: 0,
    steps: 0,
    morningChecklist,
    dayChecklist: {},
    nightChecklist,
    habits: {},
    notes: "",
  };
}

export function getOrCreateTodayRecord(): DayRecord {
  const date = todayKey();
  const existing = useCalendarStore.getState().getDay(date);
  if (existing) {
    return reconcileRoutineChecklists(existing);
  }
  return buildDefaultDayRecord(date);
}

function reconcileRoutineChecklists(record: DayRecord): DayRecord {
  const morning = getMorningRoutineItems();
  const night = getNightRoutineItems();
  const morningChecklist: Record<string, boolean> = {};
  const nightChecklist: Record<string, boolean> = {};

  for (const item of morning) {
    morningChecklist[item] = record.morningChecklist[item] ?? false;
  }
  for (const item of night) {
    nightChecklist[item] = record.nightChecklist[item] ?? false;
  }

  return { ...record, morningChecklist, nightChecklist };
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
  syncGoalsFromDayRecord(merged);
  refreshWaterStreaks();

  return merged;
}

export function syncTodayFromStores(): DayRecord {
  return updateTodayRecord({});
}
