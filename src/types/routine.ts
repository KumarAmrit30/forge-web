export type RoutinePeriod = "morning" | "night";

export type RoutineScheduleType = "daily" | "weekly";

export type RoutineSchedule = {
  type: RoutineScheduleType;
  /** 0 = Sunday … 6 = Saturday */
  daysOfWeek: number[];
  time: string;
};

export type RoutineReminder = {
  enabled: boolean;
  time: string;
};

export type RoutineIconId =
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
  | "brain";

export type RoutineChecklistItem = {
  id: string;
  title: string;
  description?: string;
  /** Estimated duration in minutes */
  estimatedMinutes?: number;
  optional: boolean;
  order: number;
};

export type Routine = {
  id: string;
  title: string;
  description?: string;
  icon: RoutineIconId;
  color: string;
  period: RoutinePeriod;
  schedule: RoutineSchedule;
  reminder: RoutineReminder;
  notes?: string;
  checklistItems: RoutineChecklistItem[];
  order: number;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

export const ROUTINE_COLOR_PRESETS = [
  "#5fd4a4",
  "#6eb5ff",
  "#c792ea",
  "#f07178",
  "#e5c07b",
  "#89ddff",
  "#ff9e64",
  "#95e6cb",
] as const;

export const ROUTINE_WEEKDAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
] as const;
