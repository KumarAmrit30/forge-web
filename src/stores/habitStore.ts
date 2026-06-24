"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Habit, HabitCategory } from "@/types";

type HabitState = {
  habits: Habit[];
  completions: Record<string, Record<string, boolean>>;
  categoryFilter: HabitCategory | "all";
  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  removeHabit: (id: string) => void;
  toggleCompletion: (habitId: string, date: string) => void;
  isCompleted: (habitId: string, date: string) => boolean;
  setCategoryFilter: (cat: HabitCategory | "all") => void;
  setHabits: (habits: Habit[]) => void;
  getFilteredHabits: () => Habit[];
};

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      completions: {},
      categoryFilter: "all",
      addHabit: (habit) =>
        set({ habits: [...get().habits, habit] }),
      updateHabit: (id, updates) =>
        set({
          habits: get().habits.map((h) =>
            h.id === id ? { ...h, ...updates } : h
          ),
        }),
      removeHabit: (id) =>
        set({ habits: get().habits.filter((h) => h.id !== id) }),
      toggleCompletion: (habitId, date) =>
        set((state) => {
          const dayCompletions = state.completions[date] ?? {};
          const current = dayCompletions[habitId] ?? false;
          return {
            completions: {
              ...state.completions,
              [date]: { ...dayCompletions, [habitId]: !current },
            },
          };
        }),
      isCompleted: (habitId, date) =>
        get().completions[date]?.[habitId] ?? false,
      setCategoryFilter: (cat) => set({ categoryFilter: cat }),
      setHabits: (habits) => set({ habits }),
      getFilteredHabits: () => {
        const { habits, categoryFilter } = get();
        if (categoryFilter === "all") return habits.filter((h) => h.active);
        return habits.filter(
          (h) => h.active && h.category === categoryFilter
        );
      },
    }),
    { name: "forge-habits" }
  )
);

export function getHabitSnapshot() {
  const s = useHabitStore.getState();
  return {
    habits: s.habits,
    completions: s.completions,
    categoryFilter: s.categoryFilter,
  };
}

export function hydrateHabits(data: ReturnType<typeof getHabitSnapshot>) {
  useHabitStore.setState(data);
}
