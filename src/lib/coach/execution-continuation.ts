import type { ExecutionResult } from "@/lib/execution/execution-types";
import type { ExecutionIntent } from "@/lib/execution-ui/intent-types";

const ACKNOWLEDGEMENTS: Record<string, { success: string; followUp: string }> =
  {
    "update-water-goal": {
      success: "Hydration goal updated.",
      followUp:
        "We'll observe how this affects your routine over the coming days.",
    },
    "move-workout-schedule": {
      success: "Workout schedule adjusted.",
      followUp:
        "Your rotation on Today and Calendar now reflects the new order.",
    },
    "update-sleep-goal": {
      success: "Sleep target updated.",
      followUp:
        "We'll observe how this affects your recovery patterns over the coming days.",
    },
    "update-protein-goal": {
      success: "Protein goal updated.",
      followUp:
        "Progress and Today will track against the new target from here.",
    },
    "open-reflection": {
      success: "Reflection started.",
      followUp: "Take your time — there's no rush to finish.",
    },
    "update-routine": {
      success: "Routine updated.",
      followUp: "Your Today checklists now reflect the change.",
    },
    "update-settings-profile": {
      success: "Profile settings updated.",
      followUp: "Home and Settings will show the revised values.",
    },
    "mark-calendar-day": {
      success: "Calendar day marked.",
      followUp: "You'll see the note on Calendar and related views.",
    },
  };

const UNDO_ACKNOWLEDGEMENTS: Record<string, string> = {
  "update-water-goal": "Hydration goal restored to its previous value.",
  "move-workout-schedule": "Workout schedule restored.",
  "update-sleep-goal": "Sleep target restored.",
  "update-protein-goal": "Protein goal restored.",
  "open-reflection": "Reflection change reverted.",
  "update-routine": "Routine restored.",
  "update-settings-profile": "Profile settings restored.",
  "mark-calendar-day": "Calendar note removed.",
};

/** Deterministic post-execution acknowledgement — consumed by Conversation Manager, not UI components. */
export function buildExecutionAcknowledgement(
  result: ExecutionResult,
  intent: ExecutionIntent
): string {
  if (!result.success) {
    return result.message;
  }

  const copy = ACKNOWLEDGEMENTS[intent.executionRequest.handlerId];
  if (!copy) {
    return `${intent.title} applied.\n\nThe change is now active in Forge.`;
  }

  return `${copy.success}\n\n${copy.followUp}`;
}

/** Deterministic post-undo acknowledgement for conversation continuation. */
export function buildUndoAcknowledgement(
  result: ExecutionResult,
  handlerId: string
): string {
  if (!result.success) {
    return result.message;
  }

  return (
    UNDO_ACKNOWLEDGEMENTS[handlerId] ??
    "Change undone. Your previous settings are restored."
  );
}
