import type { Recommendation } from "@/lib/brain";
import { prioritizeFromRankedRecommendations } from "@/lib/conversation/action-prioritizer";
import { memoryAfterAssistantResponse } from "@/lib/conversation/conversation-memory";
import { capabilityCategoryFocus } from "@/lib/conversation/conversation-ranking";
import type {
  ConversationMemory,
  ConversationPlan,
  PlanConversationInput,
} from "@/lib/conversation/conversation-types";

function asRecommendations(
  items: Array<Record<string, unknown>>
): Recommendation[] {
  return items as unknown as Recommendation[];
}

/** Select the best follow-up from LLM output and orchestrator candidates. */
function selectFollowUp(input: PlanConversationInput): string | null {
  const { parsed, context } = input;
  const candidateQuestions = new Set(
    context.followUpCandidates.map((c) => c.question.toLowerCase())
  );

  for (const question of parsed.suggestedQuestions) {
    const normalized = question.toLowerCase();
    if (candidateQuestions.has(normalized)) {
      return question;
    }
  }

  if (context.followUpCandidates.length > 0) {
    return context.followUpCandidates[0].question;
  }

  return parsed.suggestedQuestions[0] ?? null;
}

/** Determine whether the conversation should continue or end. */
function resolveContinuation(input: PlanConversationInput): {
  shouldContinue: boolean;
  shouldEnd: boolean;
} {
  const { parsed, context, memory } = input;
  const hasFollowUp = selectFollowUp(input) !== null;
  const hasVisibleActions = parsed.actions.length > 0;
  const lowConfidence = parsed.confidence < 0.4;

  if (context.responseDepth === "brief" && memory.messageCount >= 4) {
    return { shouldContinue: false, shouldEnd: true };
  }

  if (lowConfidence && !hasFollowUp) {
    return { shouldContinue: false, shouldEnd: true };
  }

  return {
    shouldContinue: hasFollowUp || hasVisibleActions,
    shouldEnd: !hasFollowUp && !hasVisibleActions,
  };
}

/**
 * Plan post-LLM conversation flow — never calls AI.
 * Chooses follow-up, action cards, and continuation state.
 */
export function planConversation(input: PlanConversationInput): {
  plan: ConversationPlan;
  memory: ConversationMemory;
} {
  const { parsed, context, memory } = input;
  const selectedFollowUp = selectFollowUp(input);
  const { shouldContinue, shouldEnd } = resolveContinuation(input);

  const recommendations = asRecommendations(context.optimized.recommendations);
  const rankedIds = context.rankedRecommendations.map((r) => r.id);
  const categoryFocus = capabilityCategoryFocus(context.resolved.id);

  const prioritizedActions = prioritizeFromRankedRecommendations(
    recommendations,
    rankedIds,
    categoryFocus
  );

  const parsedActionIds = new Set(parsed.actions.map((a) => a.id));
  const visibleActions = prioritizedActions.map((action) => ({
    ...action,
    visible:
      action.visible ||
      parsedActionIds.has(action.id) ||
      parsedActionIds.has(action.sourceRecommendationId),
  }));

  const topRec = context.rankedRecommendations[0]?.recommendedAction ?? null;
  const referencedHabit =
    context.rankedRecommendations[0]?.category ??
    context.rankedInsights[0]?.category ??
    null;

  const updatedMemory = memoryAfterAssistantResponse(memory, {
    capabilityId: context.resolved.id,
    topRecommendation: topRec,
    selectedFollowUp,
    referencedHabit,
  });

  const plan: ConversationPlan = {
    selectedFollowUp,
    prioritizedActions: visibleActions.filter((a) => a.visible),
    shouldContinue,
    shouldEnd,
    summary: {
      topic: memory.currentTopic,
      capabilityId: context.resolved.id,
      messageCount: updatedMemory.messageCount,
      depth: context.responseDepth,
    },
  };

  return { plan, memory: updatedMemory };
}
