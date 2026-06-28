import type { CoachCapabilityId } from "@/lib/brain";
import type {
  ExecutionHandlerId,
  ExecutionValueSnapshot,
} from "@/lib/execution/execution-types";
import { VALIDATION_RULES } from "@/lib/execution/execution-validation-rules";

/** Default payload for a handler when conversation adapters omit explicit values. */
export function buildDefaultPayload(
  handlerId: ExecutionHandlerId,
  label: string
): ExecutionValueSnapshot {
  switch (handlerId) {
    case "update-water-goal":
      return { deltaMl: VALIDATION_RULES.waterGoal.defaultDeltaMl };
    case "move-workout-schedule":
      return { shiftDays: VALIDATION_RULES.workoutShift.defaultDays };
    case "update-sleep-goal":
      return { targetHours: 8 };
    case "update-protein-goal":
      return { targetGrams: 130 };
    case "open-reflection":
      return { mode: "guided", label };
    case "update-routine":
      return {};
    case "mark-calendar-day":
      return { note: label };
    default:
      return { label };
  }
}

/** Map UI capability back to orchestration actionType for registry fallback. */
export function capabilityToActionType(
  capabilityId?: CoachCapabilityId
): string {
  const map: Partial<Record<CoachCapabilityId, string>> = {
    "analyze-hydration": "hydration",
    "analyze-workout": "workout",
    "adjust-routine": "routine",
    "generate-reflection": "reflection",
    "review-week": "consistency",
  };
  return capabilityId ? (map[capabilityId] ?? "general") : "general";
}
