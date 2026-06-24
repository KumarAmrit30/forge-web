"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  WorkoutPlan,
  WorkoutCycleState,
  WorkoutSession,
  WorkoutDay,
  Exercise,
} from "@/types";
import { todayKey } from "@/lib/date-utils";
import { generateId } from "@/lib/id";

type WorkoutState = {
  plan: WorkoutPlan;
  cycle: WorkoutCycleState;
  sessions: Record<string, WorkoutSession>;
  setPlan: (plan: WorkoutPlan) => void;
  updateDay: (dayId: string, updates: Partial<WorkoutDay>) => void;
  addDay: (day: WorkoutDay) => void;
  removeDay: (dayId: string) => void;
  reorderDays: (dayIds: string[]) => void;
  getNextWorkout: () => WorkoutDay | null;
  getTodaySession: () => WorkoutSession | undefined;
  updateSession: (session: WorkoutSession) => void;
  completeWorkout: (session: WorkoutSession) => void;
  resetCycle: () => void;
};

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      plan: { days: [] },
      cycle: { currentIndex: 0, nextWorkoutDayId: "" },
      sessions: {},
      setPlan: (plan) => {
        const firstDay = plan.days[0];
        set({
          plan,
          cycle: {
            currentIndex: 0,
            nextWorkoutDayId: firstDay?.id ?? "",
          },
        });
      },
      updateDay: (dayId, updates) =>
        set((state) => ({
          plan: {
            days: state.plan.days.map((d) =>
              d.id === dayId ? { ...d, ...updates } : d
            ),
          },
        })),
      addDay: (day) =>
        set((state) => ({
          plan: { days: [...state.plan.days, day] },
        })),
      removeDay: (dayId) =>
        set((state) => ({
          plan: {
            days: state.plan.days.filter((d) => d.id !== dayId),
          },
        })),
      reorderDays: (dayIds) =>
        set((state) => {
          const map = new Map(state.plan.days.map((d) => [d.id, d]));
          const days = dayIds
            .map((id, i) => {
              const d = map.get(id);
              return d ? { ...d, order: i } : null;
            })
            .filter(Boolean) as WorkoutDay[];
          return { plan: { days } };
        }),
      getNextWorkout: () => {
        const { plan, cycle } = get();
        return plan.days[cycle.currentIndex] ?? null;
      },
      getTodaySession: () => {
        const date = todayKey();
        return get().sessions[date];
      },
      updateSession: (session) =>
        set((state) => ({
          sessions: { ...state.sessions, [session.date]: session },
        })),
      completeWorkout: (session) => {
        const { plan, cycle } = get();
        const completedSession = { ...session, completed: true };
        const nextIndex = (cycle.currentIndex + 1) % plan.days.length;
        const nextDay = plan.days[nextIndex];
        set((state) => ({
          sessions: {
            ...state.sessions,
            [session.date]: completedSession,
          },
          cycle: {
            currentIndex: nextIndex,
            lastCompletedDayId: plan.days[cycle.currentIndex]?.id,
            lastCompletedDate: session.date,
            nextWorkoutDayId: nextDay?.id ?? "",
          },
        }));
      },
      resetCycle: () => {
        const firstDay = get().plan.days[0];
        set({
          cycle: {
            currentIndex: 0,
            nextWorkoutDayId: firstDay?.id ?? "",
          },
        });
      },
    }),
    { name: "forge-workout" }
  )
);

export function getWorkoutSnapshot() {
  const s = useWorkoutStore.getState();
  return { plan: s.plan, cycle: s.cycle, sessions: s.sessions };
}

export function hydrateWorkout(data: ReturnType<typeof getWorkoutSnapshot>) {
  useWorkoutStore.setState(data);
}

export function createExerciseFromSeed(
  name: string,
  sets: number,
  reps: string,
  rest?: string,
  notes?: string
): Exercise {
  const restSeconds = rest?.includes("3 min")
    ? 180
    : rest?.includes("2-3 min")
      ? 150
      : rest?.includes("90 sec")
        ? 90
        : rest?.includes("45-60")
          ? 52
          : 90;
  const modifiers: Exercise["modifiers"] = [];
  if (notes?.toLowerCase().includes("drop")) modifiers.push("dropset");
  if (notes?.toLowerCase().includes("failure")) modifiers.push("failure");
  if (notes?.toLowerCase().includes("superset")) modifiers.push("superset");

  return {
    id: generateId(),
    name,
    targetSets: sets,
    targetReps: reps,
    restSeconds,
    notes,
    modifiers: modifiers.length ? modifiers : undefined,
  };
}
