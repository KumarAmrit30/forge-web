import { generateId } from "@/lib/id";
import type { Habit, HabitCategory, LegacyHabit } from "@/types/habit";
import type { LibraryFrequency, LibraryIconId } from "@/types/library";

const DAY_NAME_TO_INDEX: Record<string, number> = {
  Sun: 0,
  Sunday: 0,
  Mon: 1,
  Monday: 1,
  Tue: 2,
  Tuesday: 2,
  Wed: 3,
  Wednesday: 3,
  Thu: 4,
  Thursday: 4,
  Fri: 5,
  Friday: 5,
  Sat: 6,
  Saturday: 6,
};

export function defaultHabitIcon(category: HabitCategory): LibraryIconId {
  switch (category) {
    case "Fitness":
      return "dumbbell";
    case "Health":
      return "heart";
    case "Mindset":
      return "brain";
    case "Career":
      return "target";
    case "Learning":
      return "book";
    default:
      return "sparkles";
  }
}

export function defaultHabitColor(category: HabitCategory): string {
  switch (category) {
    case "Fitness":
      return "#6eb5ff";
    case "Health":
      return "#5fd4a4";
    case "Mindset":
      return "#c792ea";
    case "Career":
      return "#e5c07b";
    case "Learning":
      return "#89ddff";
    default:
      return "#95e6cb";
  }
}

export function defaultFrequency(): LibraryFrequency {
  return { type: "daily", daysOfWeek: [0, 1, 2, 3, 4, 5, 6] };
}

export function createHabit(
  partial: Partial<Habit> & Pick<Habit, "title" | "category">
): Habit {
  const now = new Date().toISOString();
  return {
    id: partial.id ?? generateId(),
    title: partial.title,
    description: partial.description ?? "",
    icon: partial.icon ?? defaultHabitIcon(partial.category),
    color: partial.color ?? defaultHabitColor(partial.category),
    category: partial.category,
    frequency: partial.frequency ?? defaultFrequency(),
    reminder: partial.reminder ?? { enabled: false, time: "09:00" },
    notes: partial.notes ?? "",
    order: partial.order ?? 0,
    archived: partial.archived ?? false,
    createdAt: partial.createdAt ?? now,
    updatedAt: partial.updatedAt ?? now,
  };
}

export function duplicateHabit(source: Habit, order: number): Habit {
  const now = new Date().toISOString();
  return {
    ...source,
    id: generateId(),
    title: `${source.title} (Copy)`,
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

export function migrateLegacyHabit(legacy: LegacyHabit, order: number): Habit {
  const weeklyDays =
    legacy.frequency === "weekly" && legacy.weeklyDays?.length
      ? legacy.weeklyDays
          .map((day) => DAY_NAME_TO_INDEX[day])
          .filter((day): day is number => typeof day === "number")
      : [0, 1, 2, 3, 4, 5, 6];

  return createHabit({
    id: legacy.id,
    title: legacy.title,
    category: legacy.category,
    icon: defaultHabitIcon(legacy.category),
    color: defaultHabitColor(legacy.category),
    frequency:
      legacy.frequency === "weekly"
        ? { type: "weekly", daysOfWeek: weeklyDays.length ? weeklyDays : [1, 3, 5] }
        : defaultFrequency(),
    archived: !legacy.active,
    order,
  });
}

export function isLegacyHabit(value: unknown): value is LegacyHabit {
  if (!value || typeof value !== "object") return false;
  const habit = value as LegacyHabit;
  return (
    typeof habit.id === "string" &&
    typeof habit.title === "string" &&
    typeof habit.active === "boolean" &&
    (habit.frequency === "daily" || habit.frequency === "weekly") &&
    !("archived" in habit)
  );
}

export function isHabitDueOnDate(habit: Habit, date = new Date()): boolean {
  if (habit.archived) return false;
  if (habit.frequency.type === "daily") return true;
  return habit.frequency.daysOfWeek.includes(date.getDay());
}

export function migrateHabitsIfNeeded(habits: unknown[]): Habit[] {
  if (habits.length === 0) return [];
  if (!isLegacyHabit(habits[0])) {
    return habits as Habit[];
  }
  return (habits as LegacyHabit[]).map((habit, index) =>
    migrateLegacyHabit(habit, index)
  );
}
