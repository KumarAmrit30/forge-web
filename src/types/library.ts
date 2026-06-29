/** Shared types for Routine + Habit library editors. */

export type LibraryReminder = {
  enabled: boolean;
  time: string;
};

export const LIBRARY_COLOR_PRESETS = [
  "#5fd4a4",
  "#6eb5ff",
  "#c792ea",
  "#f07178",
  "#e5c07b",
  "#89ddff",
  "#ff9e64",
  "#95e6cb",
] as const;

export type LibraryIconId =
  | "sun"
  | "moon"
  | "sparkles"
  | "heart"
  | "droplets"
  | "dumbbell"
  | "coffee"
  | "bed"
  | "leaf"
  | "star"
  | "utensils"
  | "brain"
  | "target"
  | "flame"
  | "book"
  | "zap";

export const LIBRARY_WEEKDAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
] as const;

export type LibraryFrequencyType = "daily" | "weekly" | "custom";

export type LibraryFrequency = {
  type: LibraryFrequencyType;
  /** 0 = Sunday … 6 = Saturday */
  daysOfWeek: number[];
};
