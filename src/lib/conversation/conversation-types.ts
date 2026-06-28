import type {
  BehaviorInsight,
  CoachCapabilityId,
  ForgeBrainResult,
  Pattern,
  Prediction,
  Recommendation,
  Trend,
} from "@/lib/brain";
import type { ConversationModeId } from "@/lib/personality/personality-types";
import type { OptimizedBrainContext, ResolvedCapability } from "@/lib/coach/coach-types";

/** Target response depth chosen by the orchestrator — LLM must not decide this. */
export type ResponseDepth = "brief" | "moderate" | "extended";

/** Source type for a ranked insight derived from Brain output. */
export type InsightSourceType = "pattern" | "behavior" | "trend";

/** A Brain-derived insight ranked for surfacing in the prompt. */
export type RankedInsight = {
  id: string;
  sourceType: InsightSourceType;
  score: number;
  confidence: number;
  category: string;
  description: string;
  relatedIds: string[];
};

/** A Brain recommendation ranked for surfacing — recommendation content is never modified. */
export type RankedRecommendation = {
  id: string;
  score: number;
  priority: Recommendation["priority"];
  category: Recommendation["category"];
  reason: string;
  recommendedAction: string;
  confidence: number;
};

/** A ranked pattern retained for prompt context. */
export type RankedPattern = {
  id: string;
  score: number;
  item: Pattern;
};

/** A ranked behavior insight retained for prompt context. */
export type RankedBehavior = {
  id: string;
  score: number;
  item: BehaviorInsight;
};

/** A ranked prediction retained for prompt context. */
export type RankedPrediction = {
  id: string;
  score: number;
  item: Prediction;
};

/** A ranked trend retained for prompt context. */
export type RankedTrend = {
  id: string;
  score: number;
  item: Trend;
};

/** A follow-up question candidate the LLM may choose from — orchestrator selects the pool. */
export type FollowUpCandidate = {
  id: string;
  question: string;
  score: number;
  source: "capability" | "recommendation" | "pattern" | "memory" | "continuity";
};

/** Session-only memory — survives messages within a session, not across sessions. */
export type ConversationMemory = {
  currentTopic: string | null;
  lastRecommendation: string | null;
  lastFollowUp: string | null;
  referencedHabit: string | null;
  previousCapability: CoachCapabilityId | null;
  messageCount: number;
};

/** Orchestrated context consumed by Prompt Builder instead of raw Brain slices. */
export type ConversationContext = {
  resolved: ResolvedCapability;
  modeId: ConversationModeId;
  optimized: OptimizedBrainContext;
  rankedInsights: RankedInsight[];
  rankedRecommendations: RankedRecommendation[];
  rankedPatterns: RankedPattern[];
  rankedBehaviors: RankedBehavior[];
  rankedPredictions: RankedPrediction[];
  rankedTrends: RankedTrend[];
  followUpCandidates: FollowUpCandidate[];
  responseDepth: ResponseDepth;
  insightLimit: number;
  recommendationLimit: number;
  followUpLimit: number;
  orchestrationMeta: {
    duplicatesRemoved: number;
    observationsMerged: number;
  };
};

/** A prioritized action derived from Brain recommendations — does not modify recommendations. */
export type ActionPriority = {
  id: string;
  label: string;
  actionType: string;
  score: number;
  visible: boolean;
  order: number;
  sourceRecommendationId: string;
};

/** Summary of the current conversation arc. */
export type ConversationSummary = {
  topic: string | null;
  capabilityId: CoachCapabilityId | null;
  messageCount: number;
  depth: ResponseDepth;
};

/** Post-LLM plan — determines follow-ups, actions, and conversation continuation. */
export type ConversationPlan = {
  selectedFollowUp: string | null;
  prioritizedActions: ActionPriority[];
  shouldContinue: boolean;
  shouldEnd: boolean;
  summary: ConversationSummary;
};

/** Input to the response composer. */
export type ComposeConversationInput = {
  brain: ForgeBrainResult;
  resolved: ResolvedCapability;
  optimized: OptimizedBrainContext;
  memory: ConversationMemory;
  userMessage: string;
};

/** Input to the conversation planner (runs after LLM parse). */
export type PlanConversationInput = {
  parsed: {
    summary: string;
    insights: string[];
    recommendations: string[];
    suggestedQuestions: string[];
    actions: Array<{ id: string; label: string; actionType: string }>;
    confidence: number;
  };
  context: ConversationContext;
  memory: ConversationMemory;
};
