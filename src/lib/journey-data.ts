import { assetPublicPath } from "@/lib/asset-catalog";
import type { DayRecord, Profile, WorkoutDay } from "@/types";

export type JourneyStepId =
  | "morning"
  | "workout"
  | "hydration"
  | "nutrition"
  | "reflection"
  | "sleep";

export type DailyJourneyStep = {
  id: JourneyStepId;
  label: string;
  complete: boolean;
};

export type JourneyStepStatus = "completed" | "current" | "upcoming";

export type JourneyStepWithStatus = DailyJourneyStep & {
  status: JourneyStepStatus;
};

export const HOME_JOURNEY_STEP_IDS: JourneyStepId[] = [
  "morning",
  "workout",
  "hydration",
  "reflection",
];

export const TODAY_JOURNEY_STEP_IDS: JourneyStepId[] = [
  "morning",
  "workout",
  "hydration",
  "nutrition",
  "reflection",
  "sleep",
];

export function isChecklistComplete(
  checklist: Record<string, boolean>
): boolean {
  const keys = Object.keys(checklist);
  if (!keys.length) return false;
  return keys.every((key) => checklist[key]);
}

export function shortWorkoutTitle(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

export function workoutSubtitle(name: string): string {
  const match = name.match(/\(([^)]+)\)\s*$/);
  return match?.[1] ?? "";
}

export function formatLiters(ml: number, decimals = 1): string {
  const liters = ml / 1000;
  if (liters >= 1) {
    return `${liters.toFixed(decimals).replace(/\.0$/, "")}L`;
  }
  return `${ml}ml`;
}

export function formatWaterGoalLabel(ml: number): string {
  return `${formatLiters(ml)} Water`;
}

export function formatWaterProgress(currentMl: number, goalMl: number): string {
  return `${formatLiters(currentMl)} / ${formatLiters(goalMl)}`;
}

export function estimateWorkoutDurationMinutes(
  exerciseCount: number,
  isRestDay: boolean
): number {
  if (isRestDay) return 30;
  if (!exerciseCount) return 45;
  const minutes = Math.min(75, Math.max(35, exerciseCount * 5 + 10));
  return Math.round(minutes / 5) * 5;
}

export function getMealLabel(hour = new Date().getHours()): string {
  if (hour < 11) return "Breakfast";
  if (hour < 15) return "Lunch";
  if (hour < 18) return "Afternoon Meal";
  return "Dinner";
}

export type JourneyInput = {
  record: DayRecord;
  profile: Profile;
  nextDay: WorkoutDay | null;
  isRestDay: boolean;
  waterMl: number;
};

function isStepComplete(
  id: JourneyStepId,
  input: JourneyInput
): boolean {
  const { record, profile, isRestDay, waterMl } = input;

  switch (id) {
    case "morning":
      return isChecklistComplete(record.morningChecklist);
    case "workout":
      return isRestDay || Boolean(record.workoutCompletion?.completed);
    case "hydration":
      return waterMl >= profile.dailyWaterGoal;
    case "nutrition":
      return (record.proteinG ?? 0) >= profile.dailyProteinGoal;
    case "reflection":
      return isChecklistComplete(record.nightChecklist);
    case "sleep":
      return (record.sleepHours ?? 0) >= profile.dailySleepGoal;
  }
}

function stepLabel(id: JourneyStepId, input: JourneyInput): string {
  const { profile, nextDay, isRestDay } = input;

  switch (id) {
    case "morning":
      return "Morning Routine";
    case "workout":
      return isRestDay || !nextDay
        ? "Recovery"
        : shortWorkoutTitle(nextDay.name);
    case "hydration":
      return formatWaterGoalLabel(profile.dailyWaterGoal);
    case "nutrition":
      return getMealLabel();
    case "reflection":
      return "Evening Reflection";
    case "sleep":
      return `${profile.dailySleepGoal} Hours Sleep`;
  }
}

export function buildDailyJourney(
  input: JourneyInput,
  stepIds: JourneyStepId[] = TODAY_JOURNEY_STEP_IDS
): DailyJourneyStep[] {
  return stepIds.map((id) => ({
    id,
    label: stepLabel(id, input),
    complete: isStepComplete(id, input),
  }));
}

export function annotateJourneyStatus(
  steps: DailyJourneyStep[]
): JourneyStepWithStatus[] {
  const currentIndex = steps.findIndex((s) => !s.complete);

  return steps.map((step, index) => {
    if (step.complete) {
      return { ...step, status: "completed" as const };
    }
    if (currentIndex === -1) {
      return { ...step, status: "upcoming" as const };
    }
    if (index === currentIndex) {
      return { ...step, status: "current" as const };
    }
    return { ...step, status: "upcoming" as const };
  });
}

export function getCurrentJourneyStep(
  steps: DailyJourneyStep[]
): DailyJourneyStep | null {
  return steps.find((s) => !s.complete) ?? null;
}

export function getNextJourneyStep(
  steps: DailyJourneyStep[],
  current: DailyJourneyStep | null
): DailyJourneyStep | null {
  if (!current) return null;
  const currentIndex = steps.findIndex((s) => s.id === current.id);
  if (currentIndex === -1) return null;
  return steps[currentIndex + 1] ?? null;
}

export function journeyIllustration(id: JourneyStepId, isRestDay: boolean): string {
  switch (id) {
    case "morning":
      return assetPublicPath("misc/routine.svg");
    case "workout":
      return isRestDay
        ? assetPublicPath("wellness/recovery.svg")
        : assetPublicPath("wellness/workout.svg");
    case "hydration":
      return assetPublicPath("wellness/hydration.svg");
    case "nutrition":
      return assetPublicPath("wellness/healthy-meal.svg");
    case "reflection":
      return assetPublicPath("reflections/journal.svg");
    case "sleep":
      return assetPublicPath("wellness/sleep.svg");
  }
}

export function countCompletedSteps(steps: DailyJourneyStep[]): number {
  return steps.filter((s) => s.complete).length;
}
