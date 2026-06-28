import type {
  ExecutionEvent,
  ExecutionHandlerId,
  ExecutionCategory,
  ExecutionValueSnapshot,
} from "@/lib/execution/execution-types";

const EVENT_TYPE_MAP: Record<ExecutionHandlerId, string> = {
  "update-water-goal": "HydrationGoalUpdated",
  "move-workout-schedule": "WorkoutMoved",
  "update-sleep-goal": "SleepGoalChanged",
  "update-protein-goal": "NutritionGoalChanged",
  "open-reflection": "ReflectionStarted",
  "update-routine": "RoutineUpdated",
  "update-settings-profile": "SettingsProfileUpdated",
  "mark-calendar-day": "CalendarDayMarked",
  "schedule-notification": "NotificationScheduled",
  "queue-sync": "SyncQueued",
};

/** Generate structured internal events after execution or undo. */
export function createExecutionEvent(input: {
  handlerId: ExecutionHandlerId;
  category: ExecutionCategory;
  payload: ExecutionValueSnapshot;
  typeOverride?: string;
}): ExecutionEvent {
  return {
    type: input.typeOverride ?? EVENT_TYPE_MAP[input.handlerId] ?? "ExecutionCompleted",
    category: input.category,
    handlerId: input.handlerId,
    timestamp: new Date().toISOString(),
    payload: input.payload,
  };
}

export function createUndoEvent(input: {
  handlerId: ExecutionHandlerId;
  category: ExecutionCategory;
  payload: ExecutionValueSnapshot;
}): ExecutionEvent {
  return createExecutionEvent({
    ...input,
    typeOverride: `${EVENT_TYPE_MAP[input.handlerId] ?? "ExecutionCompleted"}Undone`,
  });
}

/** Subscribe hook point for future notification scheduler — no-op for now. */
export type ExecutionEventListener = (event: ExecutionEvent) => void;

const listeners = new Set<ExecutionEventListener>();

export function subscribeExecutionEvents(
  listener: ExecutionEventListener
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function dispatchExecutionEvent(event: ExecutionEvent): void {
  for (const listener of listeners) {
    listener(event);
  }
}
