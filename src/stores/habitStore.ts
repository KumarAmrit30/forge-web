"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createHabit,
  duplicateHabit,
  isHabitDueOnDate,
  migrateHabitsIfNeeded,
  sortByOrder,
} from "@/lib/habit-utils";
import { syncHabitsToTodayRecord } from "@/lib/sync-habits";
import type { Habit, HabitCategory } from "@/types/habit";

type HabitState = {
  habits: Habit[];
  completions: Record<string, Record<string, boolean>>;
  categoryFilter: HabitCategory | "all";
  migratedToLibrary: boolean;
  createHabit: (habit: Habit) => Habit;
  updateHabit: (id: string, patch: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  duplicateHabitById: (id: string) => Habit | null;
  archiveHabit: (id: string) => void;
  restoreHabit: (id: string) => void;
  reorderHabits: (orderedIds: string[]) => void;
  toggleCompletion: (habitId: string, date: string) => void;
  isCompleted: (habitId: string, date: string) => boolean;
  setCategoryFilter: (cat: HabitCategory | "all") => void;
  setHabits: (habits: Habit[]) => void;
  getHabit: (id: string) => Habit | undefined;
  getActiveHabits: () => Habit[];
  getArchivedHabits: () => Habit[];
  getDueHabitsForDate: (date?: Date) => Habit[];
  getFilteredHabits: () => Habit[];
};

function touchHabit(habit: Habit, patch: Partial<Habit>): Habit {
  return { ...habit, ...patch, updatedAt: new Date().toISOString() };
}

function afterMutation(mutator: () => void): void {
  mutator();
  syncHabitsToTodayRecord();
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      completions: {},
      categoryFilter: "all",
      migratedToLibrary: false,

      createHabit: (habit) => {
        afterMutation(() => set({ habits: [...get().habits, habit] }));
        return habit;
      },

      updateHabit: (id, patch) => {
        afterMutation(() => {
          set({
            habits: get().habits.map((habit) =>
              habit.id === id ? touchHabit(habit, patch) : habit
            ),
          });
        });
      },

      deleteHabit: (id) => {
        afterMutation(() => {
          set({ habits: get().habits.filter((habit) => habit.id !== id) });
        });
      },

      duplicateHabitById: (id) => {
        const source = get().habits.find((habit) => habit.id === id);
        if (!source) return null;
        const copy = duplicateHabit(source, get().habits.length);
        afterMutation(() => set({ habits: [...get().habits, copy] }));
        return copy;
      },

      archiveHabit: (id) => {
        get().updateHabit(id, { archived: true });
      },

      restoreHabit: (id) => {
        get().updateHabit(id, { archived: false });
      },

      reorderHabits: (orderedIds) => {
        afterMutation(() => {
          const map = new Map(get().habits.map((habit) => [habit.id, habit]));
          const reordered = orderedIds
            .map((habitId, index) => {
              const habit = map.get(habitId);
              return habit ? touchHabit(habit, { order: index }) : null;
            })
            .filter((habit): habit is Habit => habit !== null);
          const untouched = get().habits.filter((habit) => !orderedIds.includes(habit.id));
          set({ habits: [...reordered, ...untouched] });
        });
      },

      toggleCompletion: (habitId, date) => {
        set((state) => {
          const dayCompletions = state.completions[date] ?? {};
          const current = dayCompletions[habitId] ?? false;
          return {
            completions: {
              ...state.completions,
              [date]: { ...dayCompletions, [habitId]: !current },
            },
          };
        });
        syncHabitsToTodayRecord();
      },

      isCompleted: (habitId, date) => get().completions[date]?.[habitId] ?? false,

      setCategoryFilter: (cat) => set({ categoryFilter: cat }),

      setHabits: (habits) => {
        afterMutation(() => set({ habits, migratedToLibrary: true }));
      },

      getHabit: (id) => get().habits.find((habit) => habit.id === id),

      getActiveHabits: () =>
        sortByOrder(get().habits.filter((habit) => !habit.archived)),

      getArchivedHabits: () =>
        sortByOrder(get().habits.filter((habit) => habit.archived)),

      getDueHabitsForDate: (date = new Date()) => {
        const { habits, categoryFilter } = get();
        return sortByOrder(
          habits.filter((habit) => {
            if (!isHabitDueOnDate(habit, date)) return false;
            if (categoryFilter !== "all" && habit.category !== categoryFilter) {
              return false;
            }
            return true;
          })
        );
      },

      getFilteredHabits: () => get().getDueHabitsForDate(),
    }),
    {
      name: "forge-habits",
      merge: (persisted, current) => {
        const stored = persisted as Partial<HabitState> | undefined;
        const habits = migrateHabitsIfNeeded(stored?.habits ?? []);
        return {
          ...current,
          ...stored,
          habits,
          migratedToLibrary: stored?.migratedToLibrary ?? habits.length > 0,
        };
      },
    }
  )
);

export function getHabitSnapshot() {
  const state = useHabitStore.getState();
  return {
    habits: state.habits,
    completions: state.completions,
    categoryFilter: state.categoryFilter,
    migratedToLibrary: state.migratedToLibrary,
  };
}

export function hydrateHabits(data: ReturnType<typeof getHabitSnapshot>) {
  useHabitStore.setState({
    ...data,
    habits: migrateHabitsIfNeeded(data.habits),
    migratedToLibrary: true,
  });
  syncHabitsToTodayRecord();
}

export function migrateHabitsFromStorageIfNeeded(): void {
  const state = useHabitStore.getState();
  if (state.migratedToLibrary) return;
  const migrated = migrateHabitsIfNeeded(state.habits);
  useHabitStore.setState({ habits: migrated, migratedToLibrary: true });
  syncHabitsToTodayRecord();
}

/** Seed helper — replace habits with structured library entries. */
export function seedHabits(
  items: Array<{ title: string; category: HabitCategory }>
): void {
  const habits = items.map((item, index) =>
    createHabit({ title: item.title, category: item.category, order: index })
  );
  useHabitStore.getState().setHabits(habits);
}

// Backward-compatible aliases
export const addHabit = (habit: Habit) => useHabitStore.getState().createHabit(habit);
export const removeHabit = (id: string) => useHabitStore.getState().deleteHabit(id);
