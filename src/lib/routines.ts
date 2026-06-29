import { useSettingsStore } from "@/stores/settingsStore";
import { useRoutineStore } from "@/stores/routineStore";
import { sortByOrder, titlesFromChecklistItems } from "@/lib/routine-utils";

export type RoutinePeriod = "morning" | "day" | "night";

function getTitlesForPeriod(period: "morning" | "night"): string[] {
  const routines = sortByOrder(
    useRoutineStore
      .getState()
      .routines.filter((routine) => !routine.archived && routine.period === period)
  );
  return routines.flatMap((routine) => titlesFromChecklistItems(routine.checklistItems));
}

export function getMorningRoutineItems(): string[] {
  const fromStore = getTitlesForPeriod("morning");
  if (fromStore.length > 0) return fromStore;
  return useSettingsStore.getState().morningRoutineItems;
}

export function getNightRoutineItems(): string[] {
  const fromStore = getTitlesForPeriod("night");
  if (fromStore.length > 0) return fromStore;
  return useSettingsStore.getState().nightRoutineItems;
}

export function buildChecklistRecord(
  items: string[],
  existing?: Record<string, boolean>
): Record<string, boolean> {
  const record: Record<string, boolean> = {};
  for (const item of items) {
    record[item] = existing?.[item] ?? false;
  }
  return record;
}

export function mergeRoutineChecklist(
  period: RoutinePeriod,
  existing?: Record<string, boolean>
): Record<string, boolean> {
  const items =
    period === "morning"
      ? getMorningRoutineItems()
      : period === "night"
        ? getNightRoutineItems()
        : [];
  return buildChecklistRecord(items, existing);
}
