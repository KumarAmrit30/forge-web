export type {
  ActionPriority,
  ComposeConversationInput,
  ConversationContext,
  ConversationMemory,
  ConversationPlan,
  ConversationSummary,
  FollowUpCandidate,
  InsightSourceType,
  PlanConversationInput,
  RankedBehavior,
  RankedInsight,
  RankedPattern,
  RankedPrediction,
  RankedRecommendation,
  RankedTrend,
  ResponseDepth,
} from "@/lib/conversation/conversation-types";

export {
  prioritizeActions,
  prioritizeFromRankedRecommendations,
} from "@/lib/conversation/action-prioritizer";

export {
  createConversationMemory,
  isTopicContinuation,
  memoryAfterAssistantResponse,
  memoryBeforeUserMessage,
  updateConversationMemory,
} from "@/lib/conversation/conversation-memory";

export { planConversation } from "@/lib/conversation/conversation-planner";

export {
  capabilityCategoryFocus,
  depthFromModeLength,
  deriveRankedInsights,
  limitsFromMode,
  mergeSimilarInsights,
  rankBehaviors,
  rankPatterns,
  rankPredictions,
  rankRecommendations,
  rankTrends,
  scoreBehavior,
  scorePattern,
  scorePrediction,
  scoreRecommendation,
  scoreTrend,
} from "@/lib/conversation/conversation-ranking";

export { composeConversationContext } from "@/lib/conversation/response-composer";

import type { CoachConversationTurn, ForgeCoachPrompt } from "@/lib/coach/coach-types";
import { buildCoachPrompt } from "@/lib/coach/prompt-builder";
import { optimizeContext } from "@/lib/coach/context-optimizer";
import { resolveCapability } from "@/lib/coach/capability-resolver";
import { runForgeBrain } from "@/lib/brain";
import type { CoachCapabilityId } from "@/lib/brain";
import type { ForgeContext } from "@/lib/brain/types";
import { composeConversationContext } from "@/lib/conversation/response-composer";
import type { ConversationMemory } from "@/lib/conversation/conversation-types";

export type OrchestrateConversationInput = {
  message: string;
  capabilityId?: CoachCapabilityId;
  conversationHistory?: CoachConversationTurn[];
  memory: ConversationMemory;
  strict?: boolean;
  context?: ForgeContext;
};

export type OrchestrateConversationResult = {
  prompt: ForgeCoachPrompt;
  conversationContext: ReturnType<typeof composeConversationContext>;
  brain: ReturnType<typeof runForgeBrain>;
};

/**
 * Full pre-LLM orchestration pipeline:
 * Capability Resolver → Brain → Context Optimizer → Response Composer → Prompt Builder
 */
export function orchestrateConversation(
  input: OrchestrateConversationInput
): OrchestrateConversationResult {
  const trimmed = input.message.trim();
  const resolved = resolveCapability(trimmed, input.capabilityId);
  const brain = runForgeBrain({
    question: trimmed,
    capabilityId: resolved.id ?? undefined,
    context: input.context,
  });
  const optimized = optimizeContext(brain, resolved);
  const conversationContext = composeConversationContext({
    brain,
    resolved,
    optimized,
    memory: input.memory,
    userMessage: trimmed,
  });
  const prompt = buildCoachPrompt({
    conversationContext,
    conversationHistory: input.conversationHistory ?? [],
    userMessage: trimmed,
    strict: input.strict,
  });

  return { prompt, conversationContext, brain };
}
