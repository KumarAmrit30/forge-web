import { collectForgeContext } from "@/lib/brain/context-engine";
import {
  buildIdentityProfile,
  identityContextFromForgeContext,
} from "@/lib/brain/identity-engine";
import { detectPatterns } from "@/lib/brain/pattern-engine";
import { detectTrends } from "@/lib/brain/trend-engine";
import { analyzeBehaviors } from "@/lib/brain/behavior-engine";
import { generatePredictions } from "@/lib/brain/prediction-engine";
import { generateRecommendations } from "@/lib/brain/recommendation-engine";
import { getActiveMemory } from "@/lib/brain/memory-engine";
import { buildPromptPayload } from "@/lib/brain/prompt-builder";
import { listCapabilities } from "@/lib/brain/capability-registry";
import type {
  CoachCapabilityId,
  ForgeBrainResult,
  ForgeContext,
} from "@/lib/brain/types";

export type RunForgeBrainOptions = {
  question?: string;
  capabilityId?: CoachCapabilityId;
  context?: ForgeContext;
};

/**
 * Run the full Forge Brain pipeline.
 * Deterministic, store-driven, and independent of Gemini.
 */
export function runForgeBrain(
  options: RunForgeBrainOptions = {}
): ForgeBrainResult {
  const context = options.context ?? collectForgeContext();
  const identity = buildIdentityProfile(
    identityContextFromForgeContext(context)
  );
  const patterns = detectPatterns(context);
  const trends = detectTrends(context, patterns);
  const behaviors = analyzeBehaviors(context, patterns);
  const predictions = generatePredictions(
    context,
    patterns,
    trends,
    behaviors
  );
  const recommendations = generateRecommendations({
    identity,
    patterns,
    trends,
    behaviors,
    predictions,
  });
  const memory = getActiveMemory(context);
  const capabilities = listCapabilities();

  const promptPayload =
    options.question != null
      ? buildPromptPayload({
          question: options.question,
          capabilityId: options.capabilityId ?? null,
          context,
          identity,
          patterns,
          trends,
          behaviors,
          predictions,
          recommendations,
          memory,
          capabilities,
        })
      : null;

  return {
    context,
    identity,
    patterns,
    trends,
    behaviors,
    predictions,
    recommendations,
    memory,
    promptPayload,
  };
}

export {
  buildForgeContext,
  collectForgeContext,
  readStoreSnapshots,
} from "@/lib/brain/context-engine";

export {
  buildIdentityProfile,
  identityContextFromForgeContext,
  determineGrowthStage,
  determineIdentityTitle,
  determineHeroReflection,
  determineMonthlyReflection,
  determineTimelineEvents,
  determineHabitEvolution,
  determineMilestones,
  determineForgeInsight,
  goodDayCount,
  workoutCompleted,
  workoutConsistency,
  hydrationAvg,
  sleepAvg,
  isGoodDay,
} from "@/lib/brain/identity-engine";

export type {
  IdentityContext,
  IdentityResult,
  MonthlyReflectionResult,
  TimelineEventResult,
  HabitEvolutionResult,
  MilestoneResult,
  MilestoneIconId,
} from "@/lib/brain/identity-engine";

export type { IdentityDayRecord } from "@/lib/brain/types";

export { detectPatterns } from "@/lib/brain/pattern-engine";
export { detectTrends } from "@/lib/brain/trend-engine";
export { analyzeBehaviors } from "@/lib/brain/behavior-engine";
export { generatePredictions } from "@/lib/brain/prediction-engine";
export { generateRecommendations } from "@/lib/brain/recommendation-engine";
export type { RecommendationInput } from "@/lib/brain/recommendation-engine";

export {
  createMemoryStore,
  getActiveMemory,
  memoryStore,
} from "@/lib/brain/memory-engine";
export type { MemoryStore } from "@/lib/brain/memory-engine";

export { buildPromptPayload } from "@/lib/brain/prompt-builder";
export type { PromptBuilderInput } from "@/lib/brain/prompt-builder";

export {
  getCapability,
  invokeCapabilityHandler,
  listCapabilities,
} from "@/lib/brain/capability-registry";

export {
  buildEvidence,
  confidenceFromObservations,
  confidenceLevelFrom,
  confidenceFromTrendWindow,
  splitRollingWindows,
  percentDelta,
  daySpan,
} from "@/lib/brain/heuristics";
export type { EvidenceInput } from "@/lib/brain/heuristics";

export type {
  CoachCapabilityId,
  ForgeBrainResult,
  ForgeContext,
  ForgeCalendarContext,
  ForgeWorkoutContext,
  ForgeWaterContext,
  ForgeSettingsContext,
  ForgeProgressContext,
  IdentityProfile,
  Pattern,
  Trend,
  BehaviorInsight,
  Prediction,
  Recommendation,
  MemoryEntry,
  CoachCapability,
  PromptPayload,
  Evidence,
  GrowthStage,
  IdentityLevel,
  PatternCategory,
  TrendDirection,
  RecommendationPriority,
  ConfidenceLevel,
  BehaviorType,
  PredictionType,
  MemoryCategory,
  RequiredContextSlice,
} from "@/lib/brain/types";

export type { ForgeContextSource } from "@/lib/brain/context-engine";
