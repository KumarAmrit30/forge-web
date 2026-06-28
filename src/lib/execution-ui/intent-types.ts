/**
 * Presentation-layer types for the Execution UX.
 * These are UI-only — never pass ExecutionIntent to the Execution Engine.
 */

/** Category label shown in execution preview UI. */
export type IntentCategory =
  | "hydration"
  | "workout"
  | "nutrition"
  | "sleep"
  | "reflection"
  | "routine"
  | "settings"
  | "calendar"
  | "notifications"
  | "sync"
  | "general";

/** App screen affected by a proposed change — user-facing labels derived separately. */
export type IntentScreen =
  | "home"
  | "today"
  | "calendar"
  | "progress"
  | "forge"
  | "settings";

/** A labeled row in the execution preview breakdown. */
export type IntentPreviewSection = {
  label: string;
  value: string;
};

/**
 * Opaque engine contract attached to an intent for use at confirmation time only.
 * Created by intent-builder via the execution adapter layer.
 */
export type IntentExecutionRequest = {
  id: string;
  handlerId: string;
  category: string;
  actionType: string;
  payload: Record<string, unknown>;
  source: string;
  metadata?: {
    conversationId?: string;
    messageId?: string;
    capabilityId?: string | null;
    recommendationId?: string;
    actionLabel?: string;
  };
};

/** Presentation model for a proposed Forge change — review before execution. */
export type ExecutionIntent = {
  id: string;
  title: string;
  summary: string;
  reason: string;
  category: IntentCategory;
  currentValue: string;
  proposedValue: string;
  affectedScreens: IntentScreen[];
  estimatedImpact: string;
  reversible: boolean;
  previewSections: IntentPreviewSection[];
  /** Engine contract — pass to runExecution() only after user confirms. */
  executionRequest: IntentExecutionRequest;
};

/** User-facing label for an affected screen. */
export type IntentScreenLabel = {
  id: IntentScreen;
  label: string;
};

/** Timeline entry derived from execution history — reflection-oriented, not analytics. */
export type ExecutionTimelineEntry = {
  id: string;
  title: string;
  relativeDay: string;
  timestamp: string;
  category: IntentCategory;
  reversible: boolean;
  undone: boolean;
  historyEntryId: string;
};

/** Flow status for execution UX state machine. */
export type ExecutionFlowStatus =
  | "idle"
  | "reviewing"
  | "executing"
  | "success"
  | "error";

/** Result summary surfaced in UI after engine completes. */
export type ExecutionFlowResult = {
  success: boolean;
  message: string;
  historyEntryId?: string;
  undoAvailable: boolean;
  intentId: string;
};
