import { useSettingsStore } from "@/stores/settingsStore";
import { useRoutineStore } from "@/stores/routineStore";
import {
  checklistItemsFromTitles,
  createRoutine,
  sortByOrder,
  titlesFromChecklistItems,
} from "@/lib/routine-utils";
import type { RoutinePeriod } from "@/types/routine";

/** Sync legacy settings string arrays from the structured routine store. */
export function syncLegacyArraysFromRoutines(): void {
  const { getActiveRoutinesByPeriod } = useRoutineStore.getState();
  const morning = getActiveRoutinesByPeriod("morning").flatMap((routine) =>
    titlesFromChecklistItems(routine.checklistItems)
  );
  const night = getActiveRoutinesByPeriod("night").flatMap((routine) =>
    titlesFromChecklistItems(routine.checklistItems)
  );
  useSettingsStore.getState().setRoutineItems(morning, night);
}

/** Import coach/legacy string arrays into default period routines. */
export function importLegacyRoutineArrays(morning: string[], night: string[]): void {
  const store = useRoutineStore.getState();
  const active = store.routines.filter((routine) => !routine.archived);

  const upsertPeriod = (period: RoutinePeriod, titles: string[]) => {
    const periodRoutines = sortByOrder(
      active.filter((routine) => routine.period === period)
    );
    const primary = periodRoutines[0];

    if (primary) {
      store.updateRoutine(primary.id, {
        checklistItems: checklistItemsFromTitles(titles),
      });
      return;
    }

    store.createRoutine(
      createRoutine({
        title: period === "morning" ? "Morning Routine" : "Evening Routine",
        period,
        order: store.routines.length,
        checklistItems: checklistItemsFromTitles(titles),
      })
    );
  };

  upsertPeriod("morning", morning);
  upsertPeriod("night", night);
  syncLegacyArraysFromRoutines();
}

/** One-time migration from settings arrays when routine store is empty. */
export function migrateRoutinesFromSettingsIfNeeded(): void {
  const routineState = useRoutineStore.getState();
  if (routineState.routines.length > 0 || routineState.migratedFromSettings) return;

  const settings = useSettingsStore.getState();
  const { morningRoutineItems, nightRoutineItems } = settings;
  if (morningRoutineItems.length === 0 && nightRoutineItems.length === 0) {
    useRoutineStore.setState({ migratedFromSettings: true });
    return;
  }

  importLegacyRoutineArrays(morningRoutineItems, nightRoutineItems);
  useRoutineStore.setState({ migratedFromSettings: true });
}
