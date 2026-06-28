import { generateId } from "@/lib/id";
import { executeHandler, isHandlerSupported } from "@/lib/execution/execution-executor";
import {
  createExecutionEvent,
  dispatchExecutionEvent,
} from "@/lib/execution/execution-events";
import { recordExecutionHistory } from "@/lib/execution/execution-history";
import {
  buildFailureResult,
  buildSuccessResult,
} from "@/lib/execution/execution-result";
import { getRegistryEntryByHandlerId } from "@/lib/execution/execution-registry";
import {
  buildValidationContext,
  validateExecutionRequest,
} from "@/lib/execution/execution-validator";
import type {
  ExecutionRequest,
  ExecutionResult,
} from "@/lib/execution/execution-types";

/** Public Execution Engine API — validate, execute, record, emit events. */
export function runExecution(request: ExecutionRequest): ExecutionResult {
  const registryEntry = getRegistryEntryByHandlerId(request.handlerId);
  if (!registryEntry) {
    return buildFailureResult({
      requestId: request.id,
      message: `Handler "${request.handlerId}" is not registered.`,
    });
  }

  const validation = validateExecutionRequest(
    request,
    buildValidationContext()
  );
  if (!validation.valid) {
    return buildFailureResult({
      requestId: request.id,
      handlerId: request.handlerId,
      category: request.category,
      validationErrors: validation.errors,
      message: "Execution validation failed.",
    });
  }

  if (!isHandlerSupported(request.handlerId)) {
    return buildFailureResult({
      requestId: request.id,
      handlerId: request.handlerId,
      category: request.category,
      message: `Handler "${request.handlerId}" is not yet implemented.`,
    });
  }

  const executorOutput = executeHandler(request.handlerId, request.payload);
  const undoAvailable =
    Object.keys(executorOutput.previousValues).length > 0 ||
    request.handlerId === "open-reflection";

  const historyEntry = recordExecutionHistory({
    requestId: request.id,
    handlerId: request.handlerId,
    category: request.category,
    source: request.source,
    previousValues: executorOutput.previousValues,
    newValues: executorOutput.newValues,
    metadata: request.metadata,
    undoAvailable,
  });

  const event = createExecutionEvent({
    handlerId: request.handlerId,
    category: request.category,
    payload: executorOutput.newValues,
  });
  dispatchExecutionEvent(event);

  return buildSuccessResult({
    requestId: request.id,
    handlerId: request.handlerId,
    category: request.category,
    undoAvailable,
    historyEntryId: historyEntry.id,
    affectedStores: executorOutput.affectedStores,
    affectedScreens: executorOutput.affectedScreens,
    events: [event],
  });
}

/** Create a new execution request with a generated id. */
export function createExecutionRequest(
  input: Omit<ExecutionRequest, "id">
): ExecutionRequest {
  return { ...input, id: generateId() };
}
