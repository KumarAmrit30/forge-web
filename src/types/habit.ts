import type { HabitCategory } from "@/types";
import type {
  LibraryFrequency,
  LibraryIconId,
  LibraryReminder,
} from "@/types/library";

export type { HabitCategory };

export type Habit = {
  id: string;
  title: string;
  description?: string;
  icon: LibraryIconId;
  color: string;
  category: HabitCategory;
  frequency: LibraryFrequency;
  reminder: LibraryReminder;
  notes?: string;
  order: number;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Legacy shape persisted before Sprint 9.2. */
export type LegacyHabit = {
  id: string;
  title: string;
  category: HabitCategory;
  frequency: "daily" | "weekly";
  weeklyDays?: string[];
  active: boolean;
};

export const HABIT_CATEGORIES = [
  "Health",
  "Fitness",
  "Mindset",
  "Career",
  "Learning",
  "Custom",
] as const;
