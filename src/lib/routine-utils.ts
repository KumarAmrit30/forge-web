import { generateId } from "@/lib/id";
import type {
  Routine,
  RoutineChecklistItem,
  RoutineIconId,
  RoutinePeriod,
  RoutineSchedule,
} from "@/types/routine";

export function defaultSchedule(period: RoutinePeriod): RoutineSchedule {
  return {
    type: "daily",
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    time: period === "morning" ? "07:00" : "21:00",
  };
}

export function defaultIcon(period: RoutinePeriod): RoutineIconId {
  return period === "morning" ? "sun" : "moon";
}

export function createChecklistItem(
  title: string,
  order: number,
  partial: Partial<RoutineChecklistItem> = {}
): RoutineChecklistItem {
  return {
    id: generateId(),
    title,
    description: partial.description,
    estimatedMinutes: partial.estimatedMinutes,
    optional: partial.optional ?? false,
    order,
  };
}

export function createRoutine(
  partial: Partial<Routine> & Pick<Routine, "title" | "period">
): Routine {
  const now = new Date().toISOString();
  const period = partial.period;
  return {
    id: partial.id ?? generateId(),
    title: partial.title,
    description: partial.description ?? "",
    icon: partial.icon ?? defaultIcon(period),
    color: partial.color ?? "#5fd4a4",
    period,
    schedule: partial.schedule ?? defaultSchedule(period),
    reminder: partial.reminder ?? { enabled: false, time: defaultSchedule(period).time },
    notes: partial.notes ?? "",
    checklistItems: partial.checklistItems ?? [],
    order: partial.order ?? 0,
    archived: partial.archived ?? false,
    createdAt: partial.createdAt ?? now,
    updatedAt: partial.updatedAt ?? now,
  };
}

export function duplicateRoutine(source: Routine, order: number): Routine {
  const now = new Date().toISOString();
  return {
    ...source,
    id: generateId(),
    title: `${source.title} (Copy)`,
    checklistItems: source.checklistItems.map((item, index) => ({
      ...item,
      id: generateId(),
      order: index,
    })),
    order,
    archived: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export function reindexItems<T extends { order: number }>(items: T[]): T[] {
  return items.map((item, index) => ({ ...item, order: index }));
}

export function titlesFromChecklistItems(items: RoutineChecklistItem[]): string[] {
  return sortByOrder(items).map((item) => item.title);
}

export function checklistItemsFromTitles(titles: string[]): RoutineChecklistItem[] {
  return titles.map((title, index) => createChecklistItem(title, index));
}

export function migrateLegacyRoutineTitles(
  morning: string[],
  night: string[],
  existing: Routine[] = []
): Routine[] {
  if (existing.length > 0) return existing;

  const routines: Routine[] = [];
  if (morning.length > 0) {
    routines.push(
      createRoutine({
        title: "Morning Routine",
        period: "morning",
        order: 0,
        checklistItems: checklistItemsFromTitles(morning),
      })
    );
  }
  if (night.length > 0) {
    routines.push(
      createRoutine({
        title: "Evening Routine",
        period: "night",
        order: routines.length,
        checklistItems: checklistItemsFromTitles(night),
      })
    );
  }
  return routines;
}
