import type {
  BehaviorInsight,
  Pattern,
  Prediction,
  Recommendation,
  Trend,
} from "@/lib/brain";
import { resolveConversationMode } from "@/lib/personality";
import { isTopicContinuation } from "@/lib/conversation/conversation-memory";
import {
  capabilityCategoryFocus,
  deriveRankedInsights,
  depthFromModeLength,
  limitsFromMode,
  mergeSimilarInsights,
  rankBehaviors,
  rankPatterns,
  rankPredictions,
  rankRecommendations,
  rankTrends,
} from "@/lib/conversation/conversation-ranking";
import type {
  ComposeConversationInput,
  ConversationContext,
  FollowUpCandidate,
} from "@/lib/conversation/conversation-types";

const CAPABILITY_FOLLOW_UPS: Partial<
  Record<string, { question: string; score: number }[]>
> = {
  "review-today": [
    { question: "What should I focus on for the rest of today?", score: 4 },
    { question: "How does today compare to yesterday?", score: 3 },
  ],
  "review-week": [
    { question: "Which habit had the most impact this week?", score: 4 },
    { question: "What pattern stands out from this week?", score: 3 },
  ],
  "plan-tomorrow": [
    { question: "What is the one priority for tomorrow?", score: 4 },
  ],
  "generate-reflection": [
    { question: "How have my routines changed recently?", score: 4 },
  ],
};

function asPatterns(items: Array<Record<string, unknown>>): Pattern[] {
  return items as unknown as Pattern[];
}

function asBehaviors(items: Array<Record<string, unknown>>): BehaviorInsight[] {
  return items as unknown as BehaviorInsight[];
}

function asPredictions(items: Array<Record<string, unknown>>): Prediction[] {
  return items as unknown as Prediction[];
}

function asTrends(items: Array<Record<string, unknown>>): Trend[] {
  return items as unknown as Trend[];
}

function asRecommendations(
  items: Array<Record<string, unknown>>
): Recommendation[] {
  return items as unknown as Recommendation[];
}

function buildFollowUpCandidates(
  input: ComposeConversationInput,
  topRecommendation: { recommendedAction: string; category: string } | null,
  topInsight: { category: string } | null
): FollowUpCandidate[] {
  const candidates: FollowUpCandidate[] = [];
  const { resolved, memory, userMessage } = input;

  if (resolved.id && CAPABILITY_FOLLOW_UPS[resolved.id]) {
    for (const item of CAPABILITY_FOLLOW_UPS[resolved.id]!) {
      candidates.push({
        id: `cap-${resolved.id}-${candidates.length}`,
        question: item.question,
        score: item.score,
        source: "capability",
      });
    }
  }

  if (topRecommendation) {
    candidates.push({
      id: `rec-followup-${candidates.length}`,
      question: `Tell me more about: ${topRecommendation.recommendedAction}`,
      score: 3,
      source: "recommendation",
    });
  }

  if (topInsight) {
    candidates.push({
      id: `pattern-followup-${candidates.length}`,
      question: `Explain the ${topInsight.category} pattern in more detail.`,
      score: 2,
      source: "pattern",
    });
  }

  if (memory.lastFollowUp && isTopicContinuation(memory, resolved.id)) {
    candidates.push({
      id: `continuity-${candidates.length}`,
      question: memory.lastFollowUp,
      score: 1,
      source: "continuity",
    });
  }

  if (memory.referencedHabit) {
    candidates.push({
      id: `memory-habit-${candidates.length}`,
      question: `How is my ${memory.referencedHabit} habit progressing?`,
      score: 2,
      source: "memory",
    });
  }

  if (candidates.length === 0 && userMessage) {
    candidates.push({
      id: "default-open",
      question: "What else would you like to explore?",
      score: 1,
      source: "capability",
    });
  }

  return candidates.sort((a, b) => b.score - a.score);
}

/**
 * Compose ConversationContext from Brain output.
 * Deterministic — never calls Groq, never writes English prose, never touches UI.
 */
export function composeConversationContext(
  input: ComposeConversationInput
): ConversationContext {
  const { resolved, optimized } = input;
  const mode = resolveConversationMode(resolved.id);
  const categoryFocus = capabilityCategoryFocus(resolved.id);
  const depth = depthFromModeLength(mode.length);
  const limits = limitsFromMode(
    depth,
    mode.recommendationIntensity,
    mode.reflectionIntensity
  );

  const patterns = asPatterns(optimized.patterns);
  const behaviors = asBehaviors(optimized.behaviors);
  const predictions = asPredictions(optimized.predictions);
  const trends = asTrends(optimized.trends);
  const recommendations = asRecommendations(optimized.recommendations);

  const rankedPatterns = rankPatterns(patterns).slice(0, limits.insightLimit);
  const rankedBehaviors = rankBehaviors(behaviors).slice(0, limits.insightLimit);
  const rankedPredictions = rankPredictions(predictions).slice(
    0,
    limits.recommendationLimit + 1
  );
  const rankedTrends = rankTrends(trends).slice(0, limits.insightLimit);

  const rawInsights = deriveRankedInsights(
    rankedPatterns.map((r) => r.item),
    rankedBehaviors.map((r) => r.item),
    rankedTrends.map((r) => r.item)
  );
  const { merged: rankedInsights, mergeCount } = mergeSimilarInsights(rawInsights);
  const duplicatesRemoved = rawInsights.length - rankedInsights.length;

  const rankedRecommendations = rankRecommendations(
    recommendations,
    categoryFocus
  ).slice(0, limits.recommendationLimit);

  const topRec = rankedRecommendations[0] ?? null;
  const topInsight = rankedInsights[0] ?? null;

  const followUpCandidates = buildFollowUpCandidates(
    input,
    topRec,
    topInsight
  ).slice(0, limits.followUpLimit);

  return {
    resolved,
    modeId: mode.id,
    optimized,
    rankedInsights: rankedInsights.slice(0, limits.insightLimit),
    rankedRecommendations,
    rankedPatterns,
    rankedBehaviors,
    rankedPredictions,
    rankedTrends,
    followUpCandidates,
    responseDepth: depth,
    insightLimit: limits.insightLimit,
    recommendationLimit: limits.recommendationLimit,
    followUpLimit: limits.followUpLimit,
    orchestrationMeta: {
      duplicatesRemoved,
      observationsMerged: mergeCount,
    },
  };
}
