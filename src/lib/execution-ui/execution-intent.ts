import { listExecutionHistory } from "@/lib/execution";
import {
  formatIntentScreen,
} from "@/lib/execution-ui/intent-builder";
import type {
  ExecutionIntent,
  ExecutionTimelineEntry,
  IntentCategory,
  IntentScreen,
} from "@/lib/execution-ui/intent-types";

export type {
  ExecutionFlowResult,
  ExecutionFlowStatus,
  ExecutionIntent,
  ExecutionTimelineEntry,
  IntentCategory,
  IntentExecutionRequest,
  IntentPreviewSection,
  IntentScreen,
  IntentScreenLabel,
} from "@/lib/execution-ui/intent-types";

export {
  buildExecutionIntent,
  formatIntentScreen,
  readCalendarDayNote,
  toActionPriority,
} from "@/lib/execution-ui/intent-builder";

/** Map UI intent screens to display labels. */
export function getIntentScreenLabels(
  screens: IntentScreen[]
): Array<{ id: IntentScreen; label: string }> {
  return screens.map((id) => ({ id, label: formatIntentScreen(id) }));
}

/** Whether an intent can proceed to confirmation (has valid engine contract). */
export function isIntentExecutable(intent: ExecutionIntent): boolean {
  return Boolean(intent.executionRequest?.id && intent.executionRequest.handlerId);
}

function toIntentCategory(category: string): IntentCategory {
  const allowed: IntentCategory[] = [
    "hydration",
    "workout",
    "nutrition",
    "sleep",
    "reflection",
    "routine",
    "settings",
    "calendar",
    "notifications",
    "sync",
  ];
  return allowed.includes(category as IntentCategory)
    ? (category as IntentCategory)
    : "general";
}

function formatRelativeDay(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const startOfTarget = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfTarget.getTime()) / 86_400_000
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString(undefined, { weekday: "long" });
}

const HISTORY_TITLES: Record<string, string> = {
  "update-water-goal": "Hydration goal adjusted",
  "move-workout-schedule": "Workout moved",
  "update-sleep-goal": "Sleep target updated",
  "update-protein-goal": "Protein goal adjusted",
  "open-reflection": "Reflection started",
  "update-routine": "Routine updated",
  "update-settings-profile": "Profile updated",
  "mark-calendar-day": "Calendar day marked",
};

/** Build reflection-oriented timeline entries from execution history. */
export function buildExecutionTimeline(
  limit = 12
): ExecutionTimelineEntry[] {
  return listExecutionHistory(limit)
    .filter((entry) => entry.source !== "undo")
    .map((entry) => ({
      id: entry.id,
      historyEntryId: entry.id,
      title:
        HISTORY_TITLES[entry.handlerId] ??
        entry.metadata?.actionLabel ??
        "Change applied",
      relativeDay: formatRelativeDay(entry.timestamp),
      timestamp: entry.timestamp,
      category: toIntentCategory(entry.category),
      reversible: entry.undoAvailable && !entry.undone,
      undone: entry.undone,
    }));
}

/** Group timeline entries by relative day label. */
export function groupTimelineByDay(
  entries: ExecutionTimelineEntry[]
): Array<{ day: string; entries: ExecutionTimelineEntry[] }> {
  const groups = new Map<string, ExecutionTimelineEntry[]>();
  for (const entry of entries) {
    const list = groups.get(entry.relativeDay) ?? [];
    list.push(entry);
    groups.set(entry.relativeDay, list);
  }
  return [...groups.entries()].map(([day, items]) => ({ day, entries: items }));
}
