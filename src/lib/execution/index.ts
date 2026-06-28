import { generateId } from "@/lib/id";
import type { ActionPriority } from "@/lib/conversation/conversation-types";
import type { ExperienceActionCard } from "@/lib/coach/conversation-experience";
import { createExecutionRequest, runExecution } from "@/lib/execution/execution-engine";
import {
  buildDefaultPayload,
  capabilityToActionType,
} from "@/lib/execution/execution-payloads";
import { resolveRegistryEntry } from "@/lib/execution/execution-registry";
import { buildFailureResult } from "@/lib/execution/execution-result";
import type {
  ConversationActionInput,
  ExecutionRequest,
} from "@/lib/execution/execution-types";

export type {
  AffectedScreen,
  AffectedStore,
  ConversationActionInput,
  ExecutionCategory,
  ExecutionEvent,
  ExecutionHandlerId,
  ExecutionHistoryEntry,
  ExecutionMetadata,
  ExecutionRequest,
  ExecutionResult,
  ExecutionSource,
  ExecutionValidationError,
  ExecutionValidationResult,
  ExecutionValueSnapshot,
  UndoOperation,
} from "@/lib/execution/execution-types";

export {
  VALIDATION_RULES,
  VALIDATION_RULE_DOCS,
} from "@/lib/execution/execution-validation-rules";

export {
  buildDefaultPayload,
  capabilityToActionType,
} from "@/lib/execution/execution-payloads";

export {
  EXECUTION_REGISTRY,
  getRegistryEntryByHandlerId,
  listHandlersForCategory,
  listRegistryEntries,
  resolveRegistryEntry,
} from "@/lib/execution/execution-registry";

export {
  buildValidationContext,
  validateExecutionRequest,
} from "@/lib/execution/execution-validator";

export {
  createExecutionRequest,
  runExecution,
} from "@/lib/execution/execution-engine";

export {
  executeHandler,
  getExecutionHandler,
  isHandlerSupported,
  undoHandler,
} from "@/lib/execution/execution-executor";

export {
  clearExecutionHistory,
  cloneHistoryEntries,
  exportExecutionHistory,
  getHistoryEntry,
  importExecutionHistory,
  listExecutionHistory,
  recordExecutionHistory,
} from "@/lib/execution/execution-history";

export { undoExecution } from "@/lib/execution/undo-manager";

export {
  buildFailureResult,
  buildSuccessResult,
} from "@/lib/execution/execution-result";

export {
  createExecutionEvent,
  createUndoEvent,
  dispatchExecutionEvent,
  subscribeExecutionEvents,
} from "@/lib/execution/execution-events";

/**
 * Resolve a conversation prioritized action into an ExecutionRequest.
 * Conversation Orchestrator ends here — Execution Engine begins here.
 */
export function buildExecutionRequestFromConversationAction(
  input: ConversationActionInput
): ExecutionRequest | null {
  const entry = resolveRegistryEntry({
    actionType: input.actionType,
    label: input.label,
  });

  if (!entry) return null;

  return createExecutionRequest({
    handlerId: entry.handlerId,
    category: entry.category,
    actionType: input.actionType,
    payload: buildDefaultPayload(entry.handlerId, input.label),
    source: "conversation-action",
    metadata: {
      conversationId: input.conversationId,
      messageId: input.messageId,
      capabilityId: input.capabilityId,
      recommendationId: input.sourceRecommendationId,
      actionLabel: input.label,
    },
  });
}

/** Adapter from Conversation Orchestrator ActionPriority. */
export function buildExecutionRequestFromPrioritizedAction(
  action: ActionPriority,
  context?: {
    conversationId?: string;
    messageId?: string;
    capabilityId?: ConversationActionInput["capabilityId"];
  }
): ExecutionRequest | null {
  return buildExecutionRequestFromConversationAction({
    id: action.id,
    label: action.label,
    actionType: action.actionType,
    sourceRecommendationId: action.sourceRecommendationId,
    capabilityId: context?.capabilityId,
    conversationId: context?.conversationId,
    messageId: context?.messageId,
  });
}

/** Adapter from Forge UI ExperienceActionCard. */
export function buildExecutionRequestFromExperienceCard(
  card: ExperienceActionCard,
  context?: {
    conversationId?: string;
    messageId?: string;
  }
): ExecutionRequest | null {
  return buildExecutionRequestFromConversationAction({
    id: card.id,
    label: card.title,
    actionType: capabilityToActionType(card.capabilityId),
    capabilityId: card.capabilityId,
    conversationId: context?.conversationId,
    messageId: context?.messageId,
  });
}

/** Execute a conversation action end-to-end if resolvable. */
export function executeConversationAction(
  action: ActionPriority,
  context?: Parameters<typeof buildExecutionRequestFromPrioritizedAction>[1]
) {
  const request = buildExecutionRequestFromPrioritizedAction(action, context);
  if (!request) {
    return buildFailureResult({
      requestId: generateId(),
      message: "No execution handler matched this conversation action.",
    });
  }
  return runExecution(request);
}
