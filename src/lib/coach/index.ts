export { useForgeConversation } from "@/lib/coach/conversation-manager";
export type { ForgeConversation } from "@/lib/coach/conversation-manager";

export { resolveCapability } from "@/lib/coach/capability-resolver";
export { optimizeContext } from "@/lib/coach/context-optimizer";
export { buildCoachPrompt } from "@/lib/coach/prompt-builder";
export { LLM_MODEL_CONFIG } from "@/lib/coach/model-config";
export type { LLMModelConfig } from "@/lib/coach/model-config";

export {
  validateCoachResponseJson,
  createGracefulErrorResponse,
  COACH_RESPONSE_JSON_SCHEMA,
  STRICT_JSON_RETRY_INSTRUCTION,
} from "@/lib/coach/json-validator";

export { validateVertexEnvironment } from "@/lib/coach/vertex-config";

export { createLLMProvider, SUPPORTED_PROVIDERS } from "@/lib/coach/providers/provider-factory";
export type {
  LLMProvider,
  LLMProviderName,
  LLMProviderError,
  LLMProviderErrorCode,
} from "@/lib/coach/providers/base-provider";

export {
  buildForgeCoachViewModel,
  resolveStarterQuestion,
  capabilityForStarter,
} from "@/lib/coach/coach-prompts";

export {
  createInitialConversationState,
  createUserMessage,
  createAssistantMessage,
} from "@/lib/coach/coach-session";

export { mapRecommendationsToActions } from "@/lib/coach/coach-actions";

export {
  parseCoachResponse,
  formatParsedResponse,
} from "@/lib/coach/response-parser";

export { createLLMClient, llmClient } from "@/lib/coach/llm-client";

export type {
  CoachMessage,
  CoachMessageRole,
  CoachResponse,
  ParsedCoachResponse,
  CoachAction,
  ConversationStarter,
  ForgeCoachHero,
  ForgeCoachViewModel,
  ConversationState,
  ResolvedCapability,
  OptimizedBrainContext,
  ForgeCoachPrompt,
  CoachConversationTurn,
  LLMClient,
  LLMClientRequest,
  LLMClientResponse,
  LLMStreamHandlers,
  LLMClientErrorCode,
  CoachGenerationResult,
} from "@/lib/coach/coach-types";
