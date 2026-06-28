import type {
  BehaviorInsight,
  CoachCapabilityId,
  ForgeBrainResult,
  MemoryEntry,
  Pattern,
  Prediction,
  Recommendation,
  Trend,
} from "@/lib/brain";
import type { OptimizedBrainContext, ResolvedCapability } from "@/lib/coach/coach-types";

type SliceRules = {
  includeIdentity: boolean;
  includeTodayContext: boolean;
  includeMonthContext: boolean;
  includeWorkoutSessions: boolean;
  includeWaterLogs: boolean;
  includeProgressMetrics: boolean;
  includeMemory: boolean;
  patternCategories: Set<string> | null;
  trendMetrics: Set<string> | null;
  behaviorTypes: Set<string> | null;
  predictionTypes: Set<string> | null;
  recommendationCategories: Set<string> | null;
};

const DEFAULT_RULES: SliceRules = {
  includeIdentity: true,
  includeTodayContext: true,
  includeMonthContext: true,
  includeWorkoutSessions: true,
  includeWaterLogs: true,
  includeProgressMetrics: true,
  includeMemory: true,
  patternCategories: null,
  trendMetrics: null,
  behaviorTypes: null,
  predictionTypes: null,
  recommendationCategories: null,
};

const CAPABILITY_RULES: Partial<Record<CoachCapabilityId, Partial<SliceRules>>> =
  {
    "review-today": {
      includeMonthContext: false,
      includeProgressMetrics: false,
      includeMemory: false,
      patternCategories: new Set(["routine", "consistency", "workout"]),
      trendMetrics: new Set(["good_day_rate", "workout_completion_rate"]),
      predictionTypes: new Set(["workout_likelihood", "hydration_risk"]),
      recommendationCategories: new Set(["consistency", "workout", "hydration"]),
    },
    "plan-tomorrow": {
      includeMonthContext: false,
      includeProgressMetrics: false,
      patternCategories: new Set(["routine", "workout", "hydration", "sleep"]),
      trendMetrics: new Set([
        "workout_completion_rate",
        "hydration_avg_ml",
        "sleep_avg_hours",
      ]),
      predictionTypes: new Set([
        "workout_likelihood",
        "hydration_risk",
        "streak_maintenance",
      ]),
      recommendationCategories: new Set([
        "workout",
        "hydration",
        "routine",
        "consistency",
      ]),
    },
    "review-week": {
      includeProgressMetrics: false,
      patternCategories: new Set([
        "routine",
        "workout",
        "hydration",
        "consistency",
      ]),
      trendMetrics: null,
      behaviorTypes: new Set([
        "routine_chain",
        "consistency_chain",
        "hydration_chain",
      ]),
      predictionTypes: new Set(["momentum", "workout_likelihood"]),
    },
    "review-month": {
      includeTodayContext: false,
      patternCategories: new Set(["consistency", "workout", "reflection"]),
      trendMetrics: new Set([
        "good_day_rate",
        "workout_completion_rate",
        "hydration_goal_hit_rate",
      ]),
      predictionTypes: new Set(["momentum"]),
    },
    "explain-trend": {
      includeTodayContext: false,
      includeWorkoutSessions: false,
      includeWaterLogs: false,
      includeProgressMetrics: false,
      includeMemory: false,
      patternCategories: null,
      trendMetrics: null,
      behaviorTypes: null,
      predictionTypes: null,
      recommendationCategories: null,
    },
    "analyze-workout": {
      includeWaterLogs: false,
      includeProgressMetrics: false,
      includeMemory: false,
      patternCategories: new Set(["workout", "routine", "sleep"]),
      trendMetrics: new Set(["workout_completion_rate"]),
      behaviorTypes: new Set(["routine_chain", "recovery_chain"]),
      predictionTypes: new Set(["workout_likelihood", "momentum"]),
      recommendationCategories: new Set(["workout", "routine", "consistency"]),
    },
    "analyze-hydration": {
      includeWorkoutSessions: false,
      includeProgressMetrics: false,
      includeMemory: false,
      patternCategories: new Set(["hydration"]),
      trendMetrics: new Set(["hydration_avg_ml", "hydration_goal_hit_rate"]),
      behaviorTypes: new Set(["hydration_chain"]),
      predictionTypes: new Set(["hydration_risk"]),
      recommendationCategories: new Set(["hydration"]),
    },
    "adjust-routine": {
      includeWorkoutSessions: false,
      includeWaterLogs: false,
      includeProgressMetrics: false,
      patternCategories: new Set(["routine", "sleep", "reflection"]),
      trendMetrics: new Set(["sleep_avg_hours", "sleep_goal_hit_rate"]),
      behaviorTypes: new Set(["recovery_chain", "reflection_chain"]),
      predictionTypes: new Set(["streak_maintenance"]),
      recommendationCategories: new Set(["sleep", "routine", "reflection"]),
    },
    "generate-reflection": {
      includeWorkoutSessions: false,
      includeWaterLogs: false,
      includeProgressMetrics: false,
      patternCategories: new Set(["reflection", "consistency"]),
      trendMetrics: new Set(["reflection_completion_rate"]),
      behaviorTypes: new Set(["reflection_chain", "consistency_chain"]),
      recommendationCategories: new Set(["reflection", "consistency"]),
    },
    "compare-months": {
      includeTodayContext: false,
      includeWorkoutSessions: false,
      includeWaterLogs: false,
      trendMetrics: new Set([
        "good_day_rate",
        "workout_completion_rate",
        "hydration_avg_ml",
        "sleep_avg_hours",
      ]),
    },
    "plan-next-week": {
      patternCategories: new Set([
        "routine",
        "workout",
        "hydration",
        "consistency",
      ]),
      predictionTypes: new Set(["momentum", "workout_likelihood"]),
    },
  };

function mergeRules(capabilityId: CoachCapabilityId | null): SliceRules {
  const base = { ...DEFAULT_RULES };
  if (!capabilityId) return base;
  const override = CAPABILITY_RULES[capabilityId];
  if (!override) return base;
  return { ...base, ...override };
}

function filterPatterns(patterns: Pattern[], rules: SliceRules): Pattern[] {
  if (!rules.patternCategories) return patterns;
  return patterns.filter((pattern) =>
    rules.patternCategories?.has(pattern.category)
  );
}

function filterTrends(trends: Trend[], rules: SliceRules): Trend[] {
  if (!rules.trendMetrics) return trends;
  return trends.filter((trend) => rules.trendMetrics?.has(trend.metric));
}

function filterBehaviors(
  behaviors: BehaviorInsight[],
  rules: SliceRules
): BehaviorInsight[] {
  if (!rules.behaviorTypes) return behaviors;
  return behaviors.filter((behavior) =>
    rules.behaviorTypes?.has(behavior.type)
  );
}

function filterPredictions(
  predictions: Prediction[],
  rules: SliceRules
): Prediction[] {
  if (!rules.predictionTypes) return predictions;
  return predictions.filter((prediction) =>
    rules.predictionTypes?.has(prediction.type)
  );
}

function filterRecommendations(
  recommendations: Recommendation[],
  rules: SliceRules
): Recommendation[] {
  if (!rules.recommendationCategories) return recommendations;
  return recommendations.filter((recommendation) =>
    rules.recommendationCategories?.has(recommendation.category)
  );
}

function filterMemory(
  memory: MemoryEntry[],
  rules: SliceRules
): MemoryEntry[] {
  if (!rules.includeMemory) return [];
  return memory;
}

/**
 * Reduce prompt size by including only capability-relevant brain slices.
 */
export function optimizeContext(
  brain: ForgeBrainResult,
  resolved: ResolvedCapability
): OptimizedBrainContext {
  const rules = mergeRules(resolved.id);

  const { context, identity } = brain;

  return {
    today: context.today,
    settings: {
      profile: context.settings.profile,
      streak: context.settings.streak,
      morningRoutineItems: rules.includeIdentity
        ? context.settings.morningRoutineItems
        : [],
      nightRoutineItems: rules.includeIdentity
        ? context.settings.nightRoutineItems
        : [],
    },
    identity: rules.includeIdentity
      ? {
          title: identity.title,
          stage: identity.stage,
          level: identity.level,
          forgeInsight: identity.forgeInsight,
          monthlyReflection: identity.monthlyReflection,
        }
      : {
          title: identity.title,
          stage: identity.stage,
          level: identity.level,
          forgeInsight: identity.forgeInsight,
        },
    dayRecords: rules.includeTodayContext
      ? context.dayRecords.filter((record) => record.date === context.today)
      : [],
    monthRecords: rules.includeMonthContext ? context.monthRecords : [],
    workout: rules.includeWorkoutSessions
      ? {
          sessions: context.workout.sessions,
          nextWorkoutDayId: context.workout.nextWorkoutDayId,
        }
      : { sessions: {}, nextWorkoutDayId: context.workout.nextWorkoutDayId },
    water: rules.includeWaterLogs
      ? context.water
      : {
          dailyLogs: {},
          currentStreak: context.water.currentStreak,
          longestStreak: context.water.longestStreak,
        },
    progress: rules.includeProgressMetrics ? context.progress : null,
    patterns: filterPatterns(brain.patterns, rules),
    trends: filterTrends(brain.trends, rules),
    behaviors: filterBehaviors(brain.behaviors, rules),
    predictions: filterPredictions(brain.predictions, rules),
    recommendations: filterRecommendations(brain.recommendations, rules),
    memory: filterMemory(brain.memory, rules),
  };
}
