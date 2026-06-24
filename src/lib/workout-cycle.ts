import type { WorkoutPlan, WorkoutCycleState, WorkoutDay } from "@/types";

export function getNextWorkoutDay(
  plan: WorkoutPlan,
  cycle: WorkoutCycleState
): WorkoutDay | null {
  if (!plan.days.length) return null;
  return plan.days[cycle.currentIndex] ?? plan.days[0];
}

export function advanceCycle(
  plan: WorkoutPlan,
  cycle: WorkoutCycleState,
  completedDate: string
): WorkoutCycleState {
  const nextIndex = (cycle.currentIndex + 1) % plan.days.length;
  const currentDay = plan.days[cycle.currentIndex];
  const nextDay = plan.days[nextIndex];
  return {
    currentIndex: nextIndex,
    lastCompletedDayId: currentDay?.id,
    lastCompletedDate: completedDate,
    nextWorkoutDayId: nextDay?.id ?? "",
  };
}

export function isRestDay(day: WorkoutDay | null): boolean {
  return day?.isRestDay ?? false;
}

export function getWorkoutCompletionRate(
  sessions: Record<string, { completed?: boolean }>,
  days: number
): number {
  const dates = Object.keys(sessions).sort().slice(-days);
  if (!dates.length) return 0;
  const completed = dates.filter((d) => sessions[d]?.completed).length;
  return Math.round((completed / days) * 100);
}
