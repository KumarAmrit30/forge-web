import type {
  ExecutionCategory,
  ExecutionHandlerId,
  ExecutionRegistryEntry,
} from "@/lib/execution/execution-types";

/** Central registry — maps recommendation categories and labels to handler ids. No business logic. */
export const EXECUTION_REGISTRY: ExecutionRegistryEntry[] = [
  {
    handlerId: "update-water-goal",
    category: "hydration",
    actionTypes: ["hydration"],
    labelPatterns: [
      /hydration/i,
      /water/i,
      /drink/i,
      /increase.*goal/i,
    ],
    description: "Increase Hydration Goal → UpdateWaterGoalHandler",
  },
  {
    handlerId: "move-workout-schedule",
    category: "workout",
    actionTypes: ["workout"],
    labelPatterns: [
      /workout/i,
      /train/i,
      /move.*workout/i,
      /tomorrow.*workout/i,
      /gym/i,
    ],
    description: "Move Workout → UpdateWorkoutScheduleHandler",
  },
  {
    handlerId: "update-sleep-goal",
    category: "sleep",
    actionTypes: ["sleep"],
    labelPatterns: [/sleep/i, /rest/i, /bedtime/i],
    description: "Adjust Sleep Goal → UpdateSleepGoalHandler",
  },
  {
    handlerId: "update-protein-goal",
    category: "nutrition",
    actionTypes: ["nutrition", "consistency"],
    labelPatterns: [/protein/i, /nutrition/i, /macro/i],
    description: "Adjust Protein Goal → UpdateProteinGoalHandler",
  },
  {
    handlerId: "open-reflection",
    category: "reflection",
    actionTypes: ["reflection"],
    labelPatterns: [/reflect/i, /journal/i, /begin reflection/i],
    description: "Begin Reflection → OpenReflectionHandler",
  },
  {
    handlerId: "update-routine",
    category: "routine",
    actionTypes: ["routine"],
    labelPatterns: [/routine/i, /morning/i, /evening/i, /habit/i],
    description: "Update Routine → UpdateRoutineHandler",
  },
  {
    handlerId: "update-settings-profile",
    category: "settings",
    actionTypes: ["settings"],
    labelPatterns: [/profile/i, /settings/i, /goal/i],
    description: "Update Settings → UpdateSettingsProfileHandler",
  },
  {
    handlerId: "mark-calendar-day",
    category: "calendar",
    actionTypes: ["calendar", "consistency"],
    labelPatterns: [/calendar/i, /day/i, /schedule/i, /mark/i],
    description: "Mark Calendar Day → MarkCalendarDayHandler",
  },
  {
    handlerId: "schedule-notification",
    category: "notifications",
    actionTypes: ["notifications"],
    labelPatterns: [/notify/i, /reminder/i, /alert/i],
    description: "Schedule Notification → ScheduleNotificationHandler (placeholder)",
  },
  {
    handlerId: "queue-sync",
    category: "sync",
    actionTypes: ["sync"],
    labelPatterns: [/sync/i, /cloud/i, /backup/i],
    description: "Queue Sync → QueueSyncHandler (placeholder)",
  },
];

export function listRegistryEntries(): ExecutionRegistryEntry[] {
  return [...EXECUTION_REGISTRY];
}

export function getRegistryEntryByHandlerId(
  handlerId: ExecutionHandlerId
): ExecutionRegistryEntry | undefined {
  return EXECUTION_REGISTRY.find((entry) => entry.handlerId === handlerId);
}

/** Resolve handler from orchestration actionType and label — deterministic, not LLM-driven. */
export function resolveRegistryEntry(input: {
  actionType: string;
  label: string;
}): ExecutionRegistryEntry | undefined {
  const normalizedType = input.actionType.trim().toLowerCase();
  const label = input.label.trim();

  const byLabel = EXECUTION_REGISTRY.find((entry) =>
    entry.labelPatterns.some((pattern) => pattern.test(label))
  );
  if (byLabel) return byLabel;

  return EXECUTION_REGISTRY.find((entry) =>
    entry.actionTypes.some((type) => type === normalizedType)
  );
}

export function listHandlersForCategory(
  category: ExecutionCategory
): ExecutionRegistryEntry[] {
  return EXECUTION_REGISTRY.filter((entry) => entry.category === category);
}
