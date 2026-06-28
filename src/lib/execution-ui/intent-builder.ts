import type { ActionPriority } from "@/lib/conversation/conversation-types";
import {
  buildExecutionRequestFromPrioritizedAction,
  resolveRegistryEntry,
} from "@/lib/execution";
import { getCalendarSnapshot } from "@/stores/calendarStore";
import { getSettingsSnapshot } from "@/stores/settingsStore";
import { getWorkoutSnapshot } from "@/stores/workoutStore";
import type {
  ExecutionIntent,
  IntentCategory,
  IntentExecutionRequest,
  IntentPreviewSection,
  IntentScreen,
} from "@/lib/execution-ui/intent-types";

const SCREEN_LABELS: Record<IntentScreen, string> = {
  home: "Home",
  today: "Today",
  calendar: "Calendar",
  progress: "Progress",
  forge: "Forge",
  settings: "Settings",
};

const HANDLER_SCREENS: Record<string, IntentScreen[]> = {
  "update-water-goal": ["today", "home", "progress"],
  "move-workout-schedule": ["today", "calendar"],
  "update-sleep-goal": ["today", "home"],
  "update-protein-goal": ["today", "progress"],
  "open-reflection": ["forge", "progress"],
  "update-routine": ["today", "home"],
  "update-settings-profile": ["settings", "home"],
  "mark-calendar-day": ["calendar", "today", "progress"],
  "schedule-notification": ["forge"],
  "queue-sync": ["settings"],
};

const HANDLER_IMPACT: Record<string, string> = {
  "update-water-goal":
    "Your daily water target and Today tracking will reflect the new goal.",
  "move-workout-schedule":
    "Your workout rotation order will shift — Today and Calendar will show the updated sequence.",
  "update-sleep-goal":
    "Sleep targets on Today and Home will use the new hours.",
  "update-protein-goal":
    "Protein tracking on Today and Progress will align to the new target.",
  "open-reflection":
    "A guided reflection will begin — no settings change, but Progress may note the session.",
  "update-routine":
    "Morning and evening routine checklists on Today will update.",
  "update-settings-profile":
    "Profile settings and related Home summaries will refresh.",
  "mark-calendar-day":
    "The selected day on Calendar, Today, and Progress will be annotated.",
  "schedule-notification": "Notification scheduling is not yet available.",
  "queue-sync": "Cloud sync is not yet available.",
};

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

function formatMl(ml: number): string {
  return `${ml.toLocaleString()} ml`;
}

function formatHours(hours: number): string {
  return `${hours} hours`;
}

function formatGrams(grams: number): string {
  return `${grams} g`;
}

function buildPreviewValues(
  handlerId: string,
  payload: Record<string, unknown>
): {
  currentValue: string;
  proposedValue: string;
  sections: IntentPreviewSection[];
} {
  const settings = getSettingsSnapshot();

  switch (handlerId) {
    case "update-water-goal": {
      const current = settings.profile.dailyWaterGoal;
      const delta =
        typeof payload.deltaMl === "number" ? payload.deltaMl : 250;
      const proposed =
        typeof payload.targetMl === "number"
          ? payload.targetMl
          : current + delta;
      return {
        currentValue: formatMl(current),
        proposedValue: formatMl(proposed),
        sections: [
          { label: "Daily water goal", value: `${formatMl(current)} → ${formatMl(proposed)}` },
        ],
      };
    }
    case "update-sleep-goal": {
      const current = settings.profile.dailySleepGoal;
      const proposed =
        typeof payload.targetHours === "number"
          ? payload.targetHours
          : current;
      return {
        currentValue: formatHours(current),
        proposedValue: formatHours(proposed),
        sections: [
          { label: "Sleep target", value: `${formatHours(current)} → ${formatHours(proposed)}` },
        ],
      };
    }
    case "update-protein-goal": {
      const current = settings.profile.dailyProteinGoal;
      const proposed =
        typeof payload.targetGrams === "number"
          ? payload.targetGrams
          : current + 10;
      return {
        currentValue: formatGrams(current),
        proposedValue: formatGrams(proposed),
        sections: [
          { label: "Protein target", value: `${formatGrams(current)} → ${formatGrams(proposed)}` },
        ],
      };
    }
    case "move-workout-schedule": {
      const snapshot = getWorkoutSnapshot();
      const names = snapshot.plan.days.map((day) => day.name);
      const shift =
        typeof payload.shiftDays === "number" ? payload.shiftDays : 1;
      const normalized =
        names.length > 0
          ? ((shift % names.length) + names.length) % names.length
          : 0;
      const rotated = [
        ...names.slice(normalized),
        ...names.slice(0, normalized),
      ];
      return {
        currentValue: names.join(" → ") || "No workouts scheduled",
        proposedValue: rotated.join(" → ") || "No change",
        sections: [
          {
            label: "Workout order",
            value: `Shift forward by ${shift} day${Math.abs(shift) === 1 ? "" : "s"}`,
          },
        ],
      };
    }
    case "update-routine": {
      const morning = settings.morningRoutineItems.join(", ") || "None set";
      const night = settings.nightRoutineItems.join(", ") || "None set";
      return {
        currentValue: `Morning: ${morning}`,
        proposedValue: `Evening: ${night}`,
        sections: [
          { label: "Morning routine", value: morning },
          { label: "Evening routine", value: night },
        ],
      };
    }
    case "mark-calendar-day": {
      const date =
        typeof payload.date === "string" ? payload.date : "Today";
      const note =
        typeof payload.note === "string" ? payload.note : "Marked by Forge";
      return {
        currentValue: "No note",
        proposedValue: note,
        sections: [{ label: "Calendar day", value: date }],
      };
    }
    case "open-reflection": {
      const mode =
        typeof payload.mode === "string" ? payload.mode : "guided";
      return {
        currentValue: "Not started",
        proposedValue: `${mode.charAt(0).toUpperCase()}${mode.slice(1)} reflection`,
        sections: [{ label: "Mode", value: mode }],
      };
    }
    default:
      return {
        currentValue: "Current state",
        proposedValue: "Proposed change",
        sections: [{ label: "Change", value: "Review before applying" }],
      };
  }
}

function toIntentExecutionRequest(
  request: NonNullable<
    ReturnType<typeof buildExecutionRequestFromPrioritizedAction>
  >
): IntentExecutionRequest {
  return {
    id: request.id,
    handlerId: request.handlerId,
    category: request.category,
    actionType: request.actionType,
    payload: request.payload,
    source: request.source,
    metadata: request.metadata
      ? {
          conversationId: request.metadata.conversationId,
          messageId: request.metadata.messageId,
          capabilityId: request.metadata.capabilityId ?? null,
          recommendationId: request.metadata.recommendationId,
          actionLabel: request.metadata.actionLabel,
        }
      : undefined,
  };
}

/** Convert an orchestrator ActionPriority into a presentation ExecutionIntent. Never mutates state. */
export function buildExecutionIntent(input: {
  action: ActionPriority;
  reason: string;
  conversationId?: string;
  messageId?: string;
  capabilityId?: string;
}): ExecutionIntent | null {
  const registryEntry = resolveRegistryEntry({
    actionType: input.action.actionType,
    label: input.action.label,
  });

  if (!registryEntry) return null;

  const executionRequest = buildExecutionRequestFromPrioritizedAction(
    input.action,
    {
      conversationId: input.conversationId,
      messageId: input.messageId,
      capabilityId: input.capabilityId as Parameters<
        typeof buildExecutionRequestFromPrioritizedAction
      >[1] extends { capabilityId?: infer C }
        ? C
        : never,
    }
  );

  if (!executionRequest) return null;

  const handlerId = executionRequest.handlerId;
  const preview = buildPreviewValues(
    handlerId,
    executionRequest.payload as Record<string, unknown>
  );
  const affectedScreens =
    HANDLER_SCREENS[handlerId] ?? (["today"] as IntentScreen[]);
  const reversible =
    handlerId !== "schedule-notification" && handlerId !== "queue-sync";

  return {
    id: input.action.id,
    title: input.action.label,
    summary: `Forge proposes updating your ${registryEntry.category} settings based on this recommendation.`,
    reason: input.reason,
    category: toIntentCategory(registryEntry.category),
    currentValue: preview.currentValue,
    proposedValue: preview.proposedValue,
    affectedScreens,
    estimatedImpact:
      HANDLER_IMPACT[handlerId] ?? "This change may affect your daily tracking.",
    reversible,
    previewSections: preview.sections,
    executionRequest: toIntentExecutionRequest(executionRequest),
  };
}

/** Resolve a user-facing screen label. */
export function formatIntentScreen(screen: IntentScreen): string {
  return SCREEN_LABELS[screen];
}

/** Build a minimal ActionPriority from parsed coach action fallback data. */
export function toActionPriority(input: {
  id: string;
  label: string;
  actionType: string;
}): ActionPriority {
  return {
    id: input.id,
    label: input.label,
    actionType: input.actionType,
    score: 0,
    visible: true,
    order: 0,
    sourceRecommendationId: "",
  };
}

/** Read current calendar context for intent previews — read-only. */
export function readCalendarDayNote(date: string): string | undefined {
  return getCalendarSnapshot().days[date]?.notes;
}
