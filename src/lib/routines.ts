import { useSettingsStore } from "@/stores/settingsStore";

export type RoutinePeriod = "morning" | "day" | "night";

export function getMorningRoutineItems(): string[] {
  return useSettingsStore.getState().morningRoutineItems;
}

export function getNightRoutineItems(): string[] {
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
