"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createChecklistItem,
  createRoutine,
  duplicateRoutine,
  reindexItems,
  sortByOrder,
} from "@/lib/routine-utils";
import { syncLegacyArraysFromRoutines } from "@/lib/routine-sync";
import type {
  Routine,
  RoutineChecklistItem,
  RoutinePeriod,
} from "@/types/routine";

type RoutineState = {
  routines: Routine[];
  migratedFromSettings: boolean;
  createRoutine: (routine: Routine) => Routine;
  updateRoutine: (id: string, patch: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  duplicateRoutineById: (id: string) => Routine | null;
  archiveRoutine: (id: string) => void;
  restoreRoutine: (id: string) => void;
  reorderRoutines: (orderedIds: string[]) => void;
  addChecklistItem: (
    routineId: string,
    item: Partial<RoutineChecklistItem> & Pick<RoutineChecklistItem, "title">
  ) => RoutineChecklistItem | null;
  updateChecklistItem: (
    routineId: string,
    itemId: string,
    patch: Partial<RoutineChecklistItem>
  ) => void;
  deleteChecklistItem: (routineId: string, itemId: string) => void;
  reorderChecklistItems: (routineId: string, orderedIds: string[]) => void;
  getRoutine: (id: string) => Routine | undefined;
  getActiveRoutinesByPeriod: (period: RoutinePeriod) => Routine[];
  getArchivedRoutines: () => Routine[];
  setRoutines: (routines: Routine[]) => void;
};

function touchRoutine(routine: Routine, patch: Partial<Routine>): Routine {
  return {
    ...routine,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
}

function afterMutation(mutator: () => void): void {
  mutator();
  syncLegacyArraysFromRoutines();
}

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set, get) => ({
      routines: [],
      migratedFromSettings: false,

      createRoutine: (routine) => {
        afterMutation(() => {
          set({ routines: [...get().routines, routine] });
        });
        return routine;
      },

      updateRoutine: (id, patch) => {
        afterMutation(() => {
          set({
            routines: get().routines.map((routine) =>
              routine.id === id ? touchRoutine(routine, patch) : routine
            ),
          });
        });
      },

      deleteRoutine: (id) => {
        afterMutation(() => {
          set({ routines: get().routines.filter((routine) => routine.id !== id) });
        });
      },

      duplicateRoutineById: (id) => {
        const source = get().routines.find((routine) => routine.id === id);
        if (!source) return null;
        const copy = duplicateRoutine(source, get().routines.length);
        afterMutation(() => {
          set({ routines: [...get().routines, copy] });
        });
        return copy;
      },

      archiveRoutine: (id) => {
        get().updateRoutine(id, { archived: true });
      },

      restoreRoutine: (id) => {
        get().updateRoutine(id, { archived: false });
      },

      reorderRoutines: (orderedIds) => {
        afterMutation(() => {
          const map = new Map(get().routines.map((routine) => [routine.id, routine]));
          const reordered = orderedIds
            .map((routineId, index) => {
              const routine = map.get(routineId);
              return routine ? touchRoutine(routine, { order: index }) : null;
            })
            .filter((routine): routine is Routine => routine !== null);

          const untouched = get().routines.filter(
            (routine) => !orderedIds.includes(routine.id)
          );
          set({ routines: [...reordered, ...untouched] });
        });
      },

      addChecklistItem: (routineId, item) => {
        const routine = get().routines.find((entry) => entry.id === routineId);
        if (!routine) return null;

        const next = createChecklistItem(item.title, routine.checklistItems.length, item);
        get().updateRoutine(routineId, {
          checklistItems: [...routine.checklistItems, next],
        });
        return next;
      },

      updateChecklistItem: (routineId, itemId, patch) => {
        const routine = get().routines.find((entry) => entry.id === routineId);
        if (!routine) return;

        get().updateRoutine(routineId, {
          checklistItems: routine.checklistItems.map((item) =>
            item.id === itemId ? { ...item, ...patch } : item
          ),
        });
      },

      deleteChecklistItem: (routineId, itemId) => {
        const routine = get().routines.find((entry) => entry.id === routineId);
        if (!routine) return;

        get().updateRoutine(routineId, {
          checklistItems: reindexItems(
            routine.checklistItems.filter((item) => item.id !== itemId)
          ),
        });
      },

      reorderChecklistItems: (routineId, orderedIds) => {
        const routine = get().routines.find((entry) => entry.id === routineId);
        if (!routine) return;

        const map = new Map(routine.checklistItems.map((item) => [item.id, item]));
        const reordered = orderedIds
          .map((itemId, index) => {
            const item = map.get(itemId);
            return item ? { ...item, order: index } : null;
          })
          .filter((item): item is RoutineChecklistItem => item !== null);

        get().updateRoutine(routineId, { checklistItems: reordered });
      },

      getRoutine: (id) => get().routines.find((routine) => routine.id === id),

      getActiveRoutinesByPeriod: (period) =>
        sortByOrder(get().routines.filter((routine) => !routine.archived && routine.period === period)),

      getArchivedRoutines: () =>
        sortByOrder(get().routines.filter((routine) => routine.archived)),

      setRoutines: (routines) => {
        afterMutation(() => set({ routines }));
      },
    }),
    { name: "forge-routines" }
  )
);

export function getRoutineSnapshot() {
  const state = useRoutineStore.getState();
  return {
    routines: state.routines,
    migratedFromSettings: state.migratedFromSettings,
  };
}

export function hydrateRoutines(data: ReturnType<typeof getRoutineSnapshot>) {
  useRoutineStore.setState(data);
  syncLegacyArraysFromRoutines();
}

/** Seed helper — replace all routines for a period. */
export function seedPeriodRoutine(
  period: RoutinePeriod,
  title: string,
  itemTitles: string[]
): void {
  const store = useRoutineStore.getState();
  const remaining = store.routines.filter(
    (routine) => routine.period !== period || routine.archived
  );
  const routine = createRoutine({
    title,
    period,
    order: remaining.filter((entry) => !entry.archived).length,
    checklistItems: itemTitles.map((itemTitle, index) =>
      createChecklistItem(itemTitle, index)
    ),
  });
  store.setRoutines([...remaining, routine]);
}
