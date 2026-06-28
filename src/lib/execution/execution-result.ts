import type {
  AffectedScreen,
  AffectedStore,
  ExecutionEvent,
  ExecutionHandlerId,
  ExecutionCategory,
  ExecutionResult,
  ExecutionValidationError,
} from "@/lib/execution/execution-types";

/** Build a standardized success result. */
export function buildSuccessResult(input: {
  requestId: string;
  handlerId: ExecutionHandlerId;
  category: ExecutionCategory;
  undoAvailable: boolean;
  historyEntryId?: string;
  affectedStores: AffectedStore[];
  affectedScreens: AffectedScreen[];
  events: ExecutionEvent[];
  message?: string;
}): ExecutionResult {
  return {
    success: true,
    requestId: input.requestId,
    handlerId: input.handlerId,
    category: input.category,
    undoAvailable: input.undoAvailable,
    historyEntryId: input.historyEntryId,
    affectedStores: input.affectedStores,
    affectedScreens: input.affectedScreens,
    events: input.events,
    message: input.message ?? "Execution completed successfully.",
  };
}

/** Build a standardized failure result — never wraps raw exceptions. */
export function buildFailureResult(input: {
  requestId: string;
  handlerId?: ExecutionHandlerId;
  category?: ExecutionCategory;
  validationErrors?: ExecutionValidationError[];
  message: string;
  events?: ExecutionEvent[];
}): ExecutionResult {
  return {
    success: false,
    requestId: input.requestId,
    handlerId: input.handlerId,
    category: input.category,
    validationErrors: input.validationErrors,
    undoAvailable: false,
    affectedStores: [],
    affectedScreens: [],
    events: input.events ?? [],
    message: input.message,
  };
}
