import {
  getHistoryEntry,
  markHistoryUndone,
  recordExecutionHistory,
} from "@/lib/execution/execution-history";
import { undoHandler, isHandlerSupported } from "@/lib/execution/execution-executor";
import {
  createUndoEvent,
  dispatchExecutionEvent,
} from "@/lib/execution/execution-events";
import {
  buildFailureResult,
  buildSuccessResult,
} from "@/lib/execution/execution-result";
import {
  buildValidationContext,
  validateExecutionRequest,
} from "@/lib/execution/execution-validator";
import type {
  ExecutionRequest,
  ExecutionResult,
  UndoOperation,
} from "@/lib/execution/execution-types";

/** Reverse a prior execution using stored history snapshots. */
export function undoExecution(operation: UndoOperation): ExecutionResult {
  const entry = getHistoryEntry(operation.historyEntryId);

  if (!entry) {
    return buildFailureResult({
      requestId: operation.historyEntryId,
      message: "History entry not found. Undo unavailable.",
    });
  }

  if (entry.undone) {
    return buildFailureResult({
      requestId: entry.requestId,
      handlerId: entry.handlerId,
      category: entry.category,
      message: "This execution has already been undone.",
    });
  }

  if (!entry.undoAvailable) {
    return buildFailureResult({
      requestId: entry.requestId,
      handlerId: entry.handlerId,
      category: entry.category,
      message: "Undo is not available for this execution.",
    });
  }

  const undoRequest: ExecutionRequest = {
    id: `undo-${entry.id}`,
    handlerId: entry.handlerId,
    category: entry.category,
    actionType: entry.category,
    payload: entry.previousValues,
    source: "undo",
    metadata: entry.metadata,
  };

  const validation = validateExecutionRequest(
    undoRequest,
    buildValidationContext()
  );
  if (!validation.valid) {
    return buildFailureResult({
      requestId: entry.requestId,
      handlerId: entry.handlerId,
      category: entry.category,
      validationErrors: validation.errors,
      message: "Undo validation failed.",
    });
  }

  if (!isHandlerSupported(entry.handlerId)) {
    return buildFailureResult({
      requestId: entry.requestId,
      handlerId: entry.handlerId,
      category: entry.category,
      message: `Handler "${entry.handlerId}" does not support undo.`,
    });
  }

  const executorOutput = undoHandler(
    entry.handlerId,
    entry.previousValues,
    entry.newValues
  );

  const marked = markHistoryUndone(entry.id);
  if (!marked) {
    return buildFailureResult({
      requestId: entry.requestId,
      handlerId: entry.handlerId,
      category: entry.category,
      message: "Failed to mark history entry as undone.",
    });
  }

  const undoEvent = createUndoEvent({
    handlerId: entry.handlerId,
    category: entry.category,
    payload: executorOutput.newValues,
  });
  dispatchExecutionEvent(undoEvent);

  recordExecutionHistory({
    requestId: undoRequest.id,
    handlerId: entry.handlerId,
    category: entry.category,
    source: "undo",
    previousValues: entry.newValues,
    newValues: entry.previousValues,
    metadata: entry.metadata,
    undoAvailable: false,
  });

  return buildSuccessResult({
    requestId: entry.requestId,
    handlerId: entry.handlerId,
    category: entry.category,
    undoAvailable: false,
    historyEntryId: entry.id,
    affectedStores: executorOutput.affectedStores,
    affectedScreens: executorOutput.affectedScreens,
    events: [undoEvent],
    message: "Undo completed successfully.",
  });
}
