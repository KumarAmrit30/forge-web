import type { DayRecord, ScoreResult, ScoreBreakdown } from "@/types";
import { useSettingsStore } from "@/stores/settingsStore";
import { useWaterStore } from "@/stores/waterStore";
import { useWorkoutStore } from "@/stores/workoutStore";
import { useCalendarStore } from "@/stores/calendarStore";
import { todayKey } from "@/lib/date-utils";

const WEIGHTS = {
  workout: 25,
  protein: 20,
  water: 15,
  sleep: 15,
  steps: 10,
  hairRoutine: 7.5,
  skinRoutine: 7.5,
};

function pct(value: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, (value / target) * 100);
}

function scoreMetric(pctComplete: number, weight: number): number {
  return (pctComplete / 100) * weight;
}

function buildBreakdown(
  record: Partial<DayRecord>,
  targets: {
    protein: number;
    water: number;
    sleep: number;
    steps: number;
  },
  projected = false
): ScoreBreakdown {
  const morningDone = Object.values(record.morningChecklist ?? {}).filter(Boolean).length;
  const morningTotal = Object.keys(record.morningChecklist ?? {}).length || 3;
  const nightDone = Object.values(record.nightChecklist ?? {}).filter(Boolean).length;
  const nightTotal = Object.keys(record.nightChecklist ?? {}).length || 4;

  const workoutComplete = projected
    ? true
    : (record.workoutCompletion?.completed ?? false);

  const protein = projected
    ? targets.protein
    : (record.proteinG ?? 0);
  const water = projected
    ? targets.water
    : (record.waterMl ?? 0);
  const sleep = projected
    ? targets.sleep
    : (record.sleepHours ?? 0);
  const steps = projected
    ? targets.steps
    : (record.steps ?? 0);

  const skinMorning = projected ? morningTotal : morningDone;
  const hairNight = projected ? nightTotal : nightDone;

  const breakdown: ScoreBreakdown = {
    workout: workoutComplete ? WEIGHTS.workout : 0,
    protein: scoreMetric(pct(protein, targets.protein), WEIGHTS.protein),
    water: scoreMetric(pct(water, targets.water), WEIGHTS.water),
    sleep: scoreMetric(pct(sleep, targets.sleep), WEIGHTS.sleep),
    steps: scoreMetric(pct(steps, targets.steps), WEIGHTS.steps),
    hairRoutine: scoreMetric(
      pct(hairNight, nightTotal),
      WEIGHTS.hairRoutine
    ),
    skinRoutine: scoreMetric(
      pct(skinMorning, morningTotal),
      WEIGHTS.skinRoutine
    ),
    total: 0,
  };

  breakdown.total = Math.round(
    breakdown.workout +
      breakdown.protein +
      breakdown.water +
      breakdown.sleep +
      breakdown.steps +
      breakdown.hairRoutine +
      breakdown.skinRoutine
  );

  return breakdown;
}

export function calculateScore(record: Partial<DayRecord>): ScoreResult {
  const profile = useSettingsStore.getState().profile;
  const targets = {
    protein: profile.dailyProteinGoal,
    water: profile.dailyWaterGoal,
    sleep: profile.dailySleepGoal,
    steps: profile.dailyStepsGoal,
  };

  const current = buildBreakdown(record, targets, false);
  const projected = buildBreakdown(record, targets, true);

  return {
    current,
    projected,
    gap: projected.total - current.total,
  };
}

export function getTodayRecord(): Partial<DayRecord> {
  const date = todayKey();
  const existing = useCalendarStore.getState().getDay(date);
  const waterTotal = useWaterStore.getState().getTodayTotal();
  const waterEntries = useWaterStore.getState().getTodayEntries();
  const session = useWorkoutStore.getState().getTodaySession();

  return {
    ...existing,
    date,
    waterMl: waterTotal,
    waterEntries,
    workoutCompletion: session,
  };
}

export function calculateTodayScore(): ScoreResult {
  return calculateScore(getTodayRecord());
}

export { WEIGHTS };
