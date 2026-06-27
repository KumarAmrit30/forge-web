import type {
  BehaviorInsight,
  IdentityProfile,
  Pattern,
  Prediction,
  Recommendation,
  RecommendationPriority,
  Trend,
} from "@/lib/brain/types";
import { confidenceLevelFrom } from "@/lib/brain/heuristics";
import { generateId } from "@/lib/id";

export type RecommendationInput = {
  identity: IdentityProfile;
  patterns: Pattern[];
  trends: Trend[];
  behaviors: BehaviorInsight[];
  predictions: Prediction[];
};

const MIN_RECOMMENDATION_CONFIDENCE = 0.35;

function priorityFromConfidence(
  confidence: number,
  direction?: string
): RecommendationPriority {
  if (direction === "declining" && confidence >= 0.55) return "high";
  if (confidence >= 0.75) return "high";
  if (confidence >= 0.55) return "medium";
  return "low";
}

function mergeEvidence(
  ...groups: Array<{ evidence: { id: string }[] }>
): Recommendation["evidence"] {
  const seen = new Set<string>();
  const merged: Recommendation["evidence"] = [];
  for (const group of groups) {
    for (const item of group.evidence) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      merged.push(item as Recommendation["evidence"][number]);
    }
  }
  return merged;
}

function recommendationsFromTrends(
  trends: Trend[],
  patterns: Pattern[],
  behaviors: BehaviorInsight[],
  predictions: Prediction[]
): Recommendation[] {
  const results: Recommendation[] = [];

  for (const trend of trends) {
    if (trend.confidence < MIN_RECOMMENDATION_CONFIDENCE) continue;
    if (trend.direction !== "declining" && trend.direction !== "plateau") {
      continue;
    }

    if (trend.metric === "hydration_avg_ml" || trend.metric === "hydration_goal_hit_rate") {
      results.push({
        id: generateId(),
        priority: priorityFromConfidence(trend.confidence, trend.direction),
        category: "hydration",
        reason: "hydration_metric_declining_or_plateau_14d_window",
        confidence: trend.confidence,
        confidenceLevel: confidenceLevelFrom(trend.confidence),
        recommendedAction: "increase_daily_water_logging",
        evidence: trend.evidence,
        supportingPatternIds: patterns
          .filter((pattern) => pattern.category === "hydration")
          .map((pattern) => pattern.id),
        supportingBehaviorIds: behaviors
          .filter((behavior) => behavior.type === "hydration_chain")
          .map((behavior) => behavior.id),
        supportingPredictionIds: predictions
          .filter((prediction) => prediction.type === "hydration_risk")
          .map((prediction) => prediction.id),
      });
    }

    if (trend.metric === "workout_completion_rate") {
      results.push({
        id: generateId(),
        priority: priorityFromConfidence(trend.confidence, trend.direction),
        category: "workout",
        reason: "workout_consistency_declining_or_plateau_14d_window",
        confidence: trend.confidence,
        confidenceLevel: confidenceLevelFrom(trend.confidence),
        recommendedAction: "prioritize_morning_routine_before_workout",
        evidence: trend.evidence,
        supportingPatternIds: patterns
          .filter((pattern) =>
            ["pattern-morning-workout", "pattern-weekday-workout"].includes(
              pattern.id
            )
          )
          .map((pattern) => pattern.id),
        supportingBehaviorIds: behaviors
          .filter((behavior) =>
            ["routine_chain", "recovery_chain"].includes(behavior.type)
          )
          .map((behavior) => behavior.id),
        supportingPredictionIds: predictions
          .filter((prediction) => prediction.type === "workout_likelihood")
          .map((prediction) => prediction.id),
      });
    }

    if (trend.metric === "sleep_avg_hours" || trend.metric === "sleep_goal_hit_rate") {
      results.push({
        id: generateId(),
        priority: priorityFromConfidence(trend.confidence, trend.direction),
        category: "sleep",
        reason: "sleep_metric_declining_or_plateau_14d_window",
        confidence: trend.confidence,
        confidenceLevel: confidenceLevelFrom(trend.confidence),
        recommendedAction: "protect_sleep_window_before_morning_routine",
        evidence: trend.evidence,
        supportingPatternIds: patterns
          .filter((pattern) => pattern.category === "sleep")
          .map((pattern) => pattern.id),
        supportingBehaviorIds: behaviors
          .filter((behavior) => behavior.type === "recovery_chain")
          .map((behavior) => behavior.id),
        supportingPredictionIds: [],
      });
    }

    if (trend.metric === "reflection_completion_rate") {
      results.push({
        id: generateId(),
        priority: priorityFromConfidence(trend.confidence, trend.direction),
        category: "reflection",
        reason: "reflection_completion_declining_or_plateau_14d_window",
        confidence: trend.confidence,
        confidenceLevel: confidenceLevelFrom(trend.confidence),
        recommendedAction: "schedule_evening_reflection_after_dinner",
        evidence: trend.evidence,
        supportingPatternIds: patterns
          .filter((pattern) => pattern.category === "reflection")
          .map((pattern) => pattern.id),
        supportingBehaviorIds: behaviors
          .filter((behavior) => behavior.type === "reflection_chain")
          .map((behavior) => behavior.id),
        supportingPredictionIds: [],
      });
    }
  }

  return results;
}

function recommendationsFromPatterns(
  patterns: Pattern[],
  behaviors: BehaviorInsight[],
  predictions: Prediction[]
): Recommendation[] {
  const results: Recommendation[] = [];

  const morningWorkout = patterns.find(
    (pattern) => pattern.id === "pattern-morning-workout"
  );
  if (
    morningWorkout &&
    morningWorkout.confidence >= MIN_RECOMMENDATION_CONFIDENCE
  ) {
    results.push({
      id: generateId(),
      priority: priorityFromConfidence(morningWorkout.confidence),
      category: "routine",
      reason: "morning_routine_associated_with_workout_completion",
      confidence: morningWorkout.confidence,
      confidenceLevel: confidenceLevelFrom(morningWorkout.confidence),
      recommendedAction: "complete_morning_routine_before_training_days",
      evidence: morningWorkout.evidence,
      supportingPatternIds: [morningWorkout.id],
      supportingBehaviorIds: behaviors
        .filter((behavior) => behavior.type === "routine_chain")
        .map((behavior) => behavior.id),
      supportingPredictionIds: predictions
        .filter((prediction) => prediction.type === "workout_likelihood")
        .map((prediction) => prediction.id),
    });
  }

  const hydrationWeekday = patterns.find(
    (pattern) => pattern.id === "pattern-hydration-weekday"
  );
  if (
    hydrationWeekday &&
    hydrationWeekday.confidence >= MIN_RECOMMENDATION_CONFIDENCE
  ) {
    results.push({
      id: generateId(),
      priority: priorityFromConfidence(hydrationWeekday.confidence),
      category: "hydration",
      reason: "hydration_drops_on_specific_weekday",
      confidence: hydrationWeekday.confidence,
      confidenceLevel: confidenceLevelFrom(hydrationWeekday.confidence),
      recommendedAction: "set_weekday_hydration_reminder",
      evidence: hydrationWeekday.evidence,
      supportingPatternIds: [hydrationWeekday.id],
      supportingBehaviorIds: [],
      supportingPredictionIds: predictions
        .filter((prediction) => prediction.type === "hydration_risk")
        .map((prediction) => prediction.id),
    });
  }

  return results;
}

function recommendationsFromPredictions(
  predictions: Prediction[],
  patterns: Pattern[],
  behaviors: BehaviorInsight[]
): Recommendation[] {
  const results: Recommendation[] = [];

  const hydrationRisk = predictions.find(
    (prediction) => prediction.type === "hydration_risk"
  );
  if (
    hydrationRisk &&
    hydrationRisk.likelihood >= 0.6 &&
    hydrationRisk.confidence >= MIN_RECOMMENDATION_CONFIDENCE
  ) {
    results.push({
      id: generateId(),
      priority: "high",
      category: "hydration",
      reason: "elevated_hydration_miss_risk_next_period",
      confidence: hydrationRisk.confidence,
      confidenceLevel: confidenceLevelFrom(hydrationRisk.confidence),
      recommendedAction: "front_load_water_intake_before_midday",
      evidence: hydrationRisk.evidence,
      supportingPatternIds: hydrationRisk.supportingPatternIds,
      supportingBehaviorIds: hydrationRisk.supportingBehaviorIds,
      supportingPredictionIds: [hydrationRisk.id],
    });
  }

  const workoutLikelihood = predictions.find(
    (prediction) => prediction.type === "workout_likelihood"
  );
  if (
    workoutLikelihood &&
    workoutLikelihood.likelihood < 0.45 &&
    workoutLikelihood.confidence >= MIN_RECOMMENDATION_CONFIDENCE
  ) {
    results.push({
      id: generateId(),
      priority: "medium",
      category: "workout",
      reason: "low_workout_likelihood_next_period",
      confidence: workoutLikelihood.confidence,
      confidenceLevel: confidenceLevelFrom(workoutLikelihood.confidence),
      recommendedAction: "pre_commit_workout_slot_in_calendar",
      evidence: workoutLikelihood.evidence,
      supportingPatternIds: workoutLikelihood.supportingPatternIds,
      supportingBehaviorIds: workoutLikelihood.supportingBehaviorIds,
      supportingPredictionIds: [workoutLikelihood.id],
    });
  }

  const momentum = predictions.find(
    (prediction) => prediction.type === "momentum"
  );
  if (
    momentum &&
    momentum.likelihood >= 0.65 &&
    momentum.confidence >= MIN_RECOMMENDATION_CONFIDENCE
  ) {
    results.push({
      id: generateId(),
      priority: "low",
      category: "consistency",
      reason: "positive_momentum_signal_detected",
      confidence: momentum.confidence,
      confidenceLevel: confidenceLevelFrom(momentum.confidence),
      recommendedAction: "maintain_current_routine_structure",
      evidence: mergeEvidence(momentum, ...patterns.slice(0, 1)),
      supportingPatternIds: patterns
        .filter((pattern) => pattern.category === "consistency")
        .map((pattern) => pattern.id),
      supportingBehaviorIds: behaviors
        .filter((behavior) => behavior.type === "consistency_chain")
        .map((behavior) => behavior.id),
      supportingPredictionIds: [momentum.id],
    });
  }

  return results;
}

function recommendationsFromIdentity(
  identity: IdentityProfile,
  trends: Trend[]
): Recommendation[] {
  if (identity.stage !== "early" && identity.stage !== "forming") return [];

  const consistencyTrend = trends.find(
    (trend) => trend.metric === "good_day_rate"
  );
  if (
    !consistencyTrend ||
    consistencyTrend.confidence < MIN_RECOMMENDATION_CONFIDENCE
  ) {
    return [];
  }

  return [
    {
      id: generateId(),
      priority: "medium",
      category: "consistency",
      reason: "identity_stage_early_forming_with_consistency_signal",
      confidence: consistencyTrend.confidence,
      confidenceLevel: confidenceLevelFrom(consistencyTrend.confidence),
      recommendedAction: "focus_on_daily_logging_consistency",
      evidence: consistencyTrend.evidence,
      supportingPatternIds: [],
      supportingBehaviorIds: [],
      supportingPredictionIds: [],
    },
  ];
}

/**
 * Produce structured recommendations backed by upstream evidence.
 */
export function generateRecommendations(
  input: RecommendationInput
): Recommendation[] {
  const { identity, patterns, trends, behaviors, predictions } = input;

  const recommendations = [
    ...recommendationsFromTrends(trends, patterns, behaviors, predictions),
    ...recommendationsFromPatterns(patterns, behaviors, predictions),
    ...recommendationsFromPredictions(predictions, patterns, behaviors),
    ...recommendationsFromIdentity(identity, trends),
  ];

  const seen = new Set<string>();
  return recommendations
    .filter((recommendation) => {
      if (recommendation.evidence.length === 0) return false;
      const key = `${recommendation.reason}:${recommendation.recommendedAction}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      const priorityRank = { high: 3, medium: 2, low: 1 };
      const diff = priorityRank[b.priority] - priorityRank[a.priority];
      return diff !== 0 ? diff : b.confidence - a.confidence;
    });
}
