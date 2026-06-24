"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Goal } from "@/types";

type GoalState = {
  goals: Goal[];
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  setGoals: (goals: Goal[]) => void;
};

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      goals: [],
      addGoal: (goal) => set({ goals: [...get().goals, goal] }),
      updateGoal: (id, updates) =>
        set({
          goals: get().goals.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        }),
      removeGoal: (id) =>
        set({ goals: get().goals.filter((g) => g.id !== id) }),
      setGoals: (goals) => set({ goals }),
    }),
    { name: "forge-goals" }
  )
);

export function getGoalSnapshot() {
  return { goals: useGoalStore.getState().goals };
}

export function hydrateGoals(data: ReturnType<typeof getGoalSnapshot>) {
  useGoalStore.setState(data);
}
