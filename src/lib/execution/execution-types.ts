import type { CoachCapabilityId } from "@/lib/brain";

/** Domain category for an executable Forge action. */
export type ExecutionCategory =
  | "hydration"
  | "workout"
  | "nutrition"
  | "sleep"
  | "reflection"
  | "routine"
  | "settings"
  | "calendar"
  | "notifications"
  | "sync";

/** Registered handler identifier — maps to executor implementation. */
export type ExecutionHandlerId =
  | "update-water-goal"
  | "move-workout-schedule"
  | "update-sleep-goal"
  | "update-protein-goal"
  | "open-reflection"
  | "update-routine"
  | "update-settings-profile"
  | "mark-calendar-day"
  | "schedule-notification"
  | "queue-sync";

/** Origin of an execution request — never LLM-direct. */
export type ExecutionSource =
  | "conversation-action"
  | "conversation-recommendation"
  | "manual"
  | "system"
  | "undo";

/** Forge store identifiers that may be affected by execution. */
export type AffectedStore =
  | "settings"
  | "water"
  | "workout"
  | "calendar"
  | "progress"
  | "notification"
  | "habit"
  | "checkpoint";

/** App screens that should refresh after execution. */
export type AffectedScreen =
  | "home"
  | "today"
  | "calendar"
  | "progress"
  | "forge"
  | "settings";

/** Structured validation error — never thrown as exceptions. */
export type ExecutionValidationError = {
  code: string;
  message: string;
  field?: string;
};

/** Result of pre-execution validation. */
export type ExecutionValidationResult =
  | { valid: true }
  | { valid: false; errors: ExecutionValidationError[] };

/** Snapshot of values before and after mutation for undo. */
export type ExecutionValueSnapshot = Record<string, unknown>;

/** Metadata linking execution to conversation context. */
export type ExecutionMetadata = {
  conversationId?: string;
  messageId?: string;
  capabilityId?: CoachCapabilityId | null;
  recommendationId?: string;
  actionLabel?: string;
};

/** Incoming request to the Execution Engine — LLM never constructs these directly. */
export type ExecutionRequest = {
  id: string;
  handlerId: ExecutionHandlerId;
  category: ExecutionCategory;
  actionType: string;
  payload: ExecutionValueSnapshot;
  source: ExecutionSource;
  metadata?: ExecutionMetadata;
};

/** Output from the executor after applying mutations. */
export type ExecutorOutput = {
  previousValues: ExecutionValueSnapshot;
  newValues: ExecutionValueSnapshot;
  affectedStores: AffectedStore[];
  affectedScreens: AffectedScreen[];
};

/** Handler contract implemented by the executor — not registered in the registry. */
export type ExecutionHandler = {
  id: ExecutionHandlerId;
  category: ExecutionCategory;
  supported: boolean;
  execute: (payload: ExecutionValueSnapshot) => ExecutorOutput;
  undo: (
    previousValues: ExecutionValueSnapshot,
    newValues: ExecutionValueSnapshot
  ) => ExecutorOutput;
};

/** Registry entry — maps recommendation signals to a handler id. */
export type ExecutionRegistryEntry = {
  handlerId: ExecutionHandlerId;
  category: ExecutionCategory;
  /** Matches ActionPriority.actionType from conversation orchestration. */
  actionTypes: string[];
  /** Optional label patterns for finer routing. */
  labelPatterns: RegExp[];
  description: string;
};

/** Record stored after every successful execution. */
export type ExecutionHistoryEntry = {
  id: string;
  requestId: string;
  handlerId: ExecutionHandlerId;
  category: ExecutionCategory;
  timestamp: string;
  source: ExecutionSource;
  previousValues: ExecutionValueSnapshot;
  newValues: ExecutionValueSnapshot;
  metadata?: ExecutionMetadata;
  undoAvailable: boolean;
  undone: boolean;
};

/** Request to reverse a prior execution. */
export type UndoOperation = {
  historyEntryId: string;
  source: ExecutionSource;
};

/** Structured internal event emitted after execution or undo. */
export type ExecutionEvent = {
  type: string;
  category: ExecutionCategory;
  handlerId: ExecutionHandlerId;
  timestamp: string;
  payload: ExecutionValueSnapshot;
};

/** Standard result returned by the engine and undo manager. */
export type ExecutionResult = {
  success: boolean;
  requestId: string;
  handlerId?: ExecutionHandlerId;
  category?: ExecutionCategory;
  validationErrors?: ExecutionValidationError[];
  undoAvailable: boolean;
  historyEntryId?: string;
  affectedStores: AffectedStore[];
  affectedScreens: AffectedScreen[];
  events: ExecutionEvent[];
  message: string;
};

/** Input for resolving a conversation prioritized action into an execution request. */
export type ConversationActionInput = {
  id: string;
  label: string;
  actionType: string;
  sourceRecommendationId?: string;
  capabilityId?: CoachCapabilityId;
  conversationId?: string;
  messageId?: string;
};

/** Context passed to validation for store snapshot checks. */
export type ValidationContext = {
  clientAvailable: boolean;
  settingsGoal?: {
    dailyWaterGoal: number;
    dailySleepGoal: number;
    dailyProteinGoal: number;
  };
};
