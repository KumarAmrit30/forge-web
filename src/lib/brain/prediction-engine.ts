import { format, parseISO } from "date-fns";
import { isChecklistComplete } from "@/lib/journey-data";
import {
  buildEvidence,
  confidenceFromObservations,
  confidenceLevelFrom,
  splitRollingWindows,
} from "@/lib/brain/heuristics";
import { isGoodDay, workoutCompleted } from "@/lib/brain/identity-engine";
import type {
  BehaviorInsight,
  ForgeContext,
  Pattern,
  Prediction,
  Trend,
} from "@/lib/brain/types";
import { generateId } from "@/lib/id";

const MIN_PREDICTION_CONFIDENCE = 0.25;

function predictWorkoutLikelihood(
  context: ForgeContext,
  patterns: Pattern[],
  behaviors: BehaviorInsight[],
  trends: Trend[]
): Prediction | null {
  const { dayRecords, workout, today } = context;
  const sessions = workout.sessions;
  const { recent } = splitRollingWindows(dayRecords, 14);

  if (recent.length < 3) return null;

  const baseRate =
    recent.filter((day) => workoutCompleted(day, sessions)).length /
    recent.length;

  const todayRecord = dayRecords.find((day) => day.date === today);
  const morningBoost =
    todayRecord && isChecklistComplete(todayRecord.morningChecklist) ? 0.12 : 0;

  const weekday = parseISO(today).getDay();
  const isWeekday = weekday >= 1 && weekday <= 5;
  const weekdayPattern = patterns.find(
    (pattern) => pattern.id === "pattern-weekday-workout"
  );
  const weekdayBoost =
    isWeekday && weekdayPattern ? weekdayPattern.confidence * 0.1 : 0;

  const workoutTrend = trends.find(
    (trend) => trend.metric === "workout_completion_rate"
  );
  const trendAdjust =
    workoutTrend?.direction === "improving"
      ? 0.08
      : workoutTrend?.direction === "declining"
        ? -0.1
        : 0;

  const morningBehavior = behaviors.find(
    (behavior) => behavior.type === "routine_chain"
  );
  const behaviorAdjust = morningBehavior ? -morningBehavior.confidence * 0.08 : 0;

  const likelihood = Math.min(
    0.95,
    Math.max(0.05, baseRate + morningBoost + weekdayBoost + trendAdjust + behaviorAdjust)
  );

  const confidence = confidenceFromObservations(
    recent.filter((day) => workoutCompleted(day, sessions)).length,
    recent.length,
    recent.length
  );
  if (confidence < MIN_PREDICTION_CONFIDENCE) return null;

  return {
    id: generateId(),
    type: "workout_likelihood",
    likelihood: Math.round(likelihood * 100) / 100,
    confidence,
    confidenceLevel: confidenceLevelFrom(confidence),
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
    supportingTrendIds: workoutTrend ? [workoutTrend.id] : [],
    evidence: [
      buildEvidence({
        source: "workout",
        timestamp: today,
        metric: "recent_workout_rate",
        value: Math.round(baseRate * 100),
        description: "recent_14d_workout_completion_rate_percent",
      }),
      buildEvidence({
        source: "calendar",
        timestamp: today,
        metric: "morning_routine_complete_today",
        value: todayRecord
          ? isChecklistComplete(todayRecord.morningChecklist)
            ? 1
            : 0
          : 0,
        description: "today_morning_routine_state",
      }),
    ],
  };
}

function predictHydrationRisk(
  context: ForgeContext,
  patterns: Pattern[],
  trends: Trend[]
): Prediction | null {
  const { dayRecords, settings, today } = context;
  const waterGoal = settings.profile.dailyWaterGoal;
  const { recent } = splitRollingWindows(dayRecords, 14);

  if (recent.length < 3) return null;

  const todayRecord = dayRecords.find((day) => day.date === today);
  const todayProgress = todayRecord ? todayRecord.waterMl / waterGoal : 0;

  const goalMissRate =
    recent.filter((day) => day.waterMl < waterGoal).length / recent.length;

  const hydrationTrend = trends.find(
    (trend) =>
      trend.metric === "hydration_avg_ml" ||
      trend.metric === "hydration_goal_hit_rate"
  );
  const trendRisk =
    hydrationTrend?.direction === "declining"
      ? 0.2
      : hydrationTrend?.direction === "improving"
        ? -0.1
        : 0;

  const weekdayPattern = patterns.find(
    (pattern) => pattern.id === "pattern-hydration-weekday"
  );
  const todayWeekday = format(parseISO(today), "EEEE");
  const weekdayRisk =
    weekdayPattern &&
    weekdayPattern.evidence.some((item) =>
      item.description.includes(todayWeekday.toLowerCase())
    )
      ? 0.12
      : 0;

  const likelihood = Math.min(
    0.95,
    Math.max(
      0.05,
      goalMissRate * 0.6 +
        (todayProgress < 0.5 ? 0.2 : 0) +
        trendRisk +
        weekdayRisk
    )
  );

  const confidence = confidenceFromObservations(
    recent.filter((day) => day.waterMl < waterGoal).length,
    recent.length,
    recent.length
  );
  if (confidence < MIN_PREDICTION_CONFIDENCE) return null;

  return {
    id: generateId(),
    type: "hydration_risk",
    likelihood: Math.round(likelihood * 100) / 100,
    confidence,
    confidenceLevel: confidenceLevelFrom(confidence),
    supportingPatternIds: weekdayPattern ? [weekdayPattern.id] : [],
    supportingBehaviorIds: [],
    supportingTrendIds: hydrationTrend ? [hydrationTrend.id] : [],
    evidence: [
      buildEvidence({
        source: "water",
        timestamp: today,
        metric: "hydration_goal_miss_rate",
        value: Math.round(goalMissRate * 100),
        description: "recent_14d_hydration_goal_miss_rate_percent",
      }),
      buildEvidence({
        source: "water",
        timestamp: today,
        metric: "today_hydration_progress",
        value: Math.round(todayProgress * 100),
        description: "today_hydration_progress_percent",
      }),
    ],
  };
}

function predictStreakMaintenance(
  context: ForgeContext,
  trends: Trend[]
): Prediction | null {
  const { dayRecords, settings, today } = context;
  const streak = settings.streak;
  if (streak < 1) return null;

  const todayRecord = dayRecords.find((day) => day.date === today);
  const todayOnTrack = todayRecord ? isGoodDay(todayRecord) : false;

  const consistencyTrend = trends.find(
    (trend) => trend.metric === "good_day_rate"
  );
  const trendBoost =
    consistencyTrend?.direction === "improving"
      ? 0.1
      : consistencyTrend?.direction === "declining"
        ? -0.12
        : 0;

  const base = Math.min(0.85, 0.35 + streak * 0.04);
  const likelihood = Math.min(
    0.95,
    Math.max(0.05, base + (todayOnTrack ? 0.15 : -0.1) + trendBoost)
  );

  const confidence = confidenceFromObservations(
    streak,
    Math.max(streak, settings.profile.dailySleepGoal),
    streak
  );
  if (confidence < MIN_PREDICTION_CONFIDENCE) return null;

  return {
    id: generateId(),
    type: "streak_maintenance",
    likelihood: Math.round(likelihood * 100) / 100,
    confidence,
    confidenceLevel: confidenceLevelFrom(confidence),
    supportingPatternIds: [],
    supportingBehaviorIds: [],
    supportingTrendIds: consistencyTrend ? [consistencyTrend.id] : [],
    evidence: [
      buildEvidence({
        source: "settings",
        timestamp: today,
        metric: "current_streak",
        value: streak,
        description: "current_active_streak_days",
      }),
      buildEvidence({
        source: "calendar",
        timestamp: today,
        metric: "today_good_day",
        value: todayOnTrack ? 1 : 0,
        description: "today_good_day_status",
      }),
    ],
  };
}

function predictMomentum(
  context: ForgeContext,
  trends: Trend[],
  behaviors: BehaviorInsight[]
): Prediction | null {
  const { dayRecords, today } = context;
  const { recent, previous } = splitRollingWindows(dayRecords, 14);

  if (recent.length < 3 || previous.length < 3) return null;

  const recentGood =
    recent.filter((day) => isGoodDay(day)).length / recent.length;
  const previousGood =
    previous.filter((day) => isGoodDay(day)).length / previous.length;

  const consistencyTrend = trends.find(
    (trend) => trend.metric === "good_day_rate"
  );
  const trendSignal =
    consistencyTrend?.direction === "improving"
      ? 0.15
      : consistencyTrend?.direction === "declining"
        ? -0.15
        : consistencyTrend?.direction === "recovering"
          ? 0.1
          : 0;

  const behaviorSignal =
    behaviors.find((behavior) => behavior.type === "consistency_chain")
      ?.confidence ?? 0;

  const delta = recentGood - previousGood;
  const likelihood = Math.min(
    0.95,
    Math.max(0.05, recentGood * 0.5 + delta * 0.3 + trendSignal + behaviorSignal * 0.1)
  );

  const confidence = confidenceFromObservations(
    recent.filter((day) => isGoodDay(day)).length,
    recent.length,
    recent.length
  );
  if (confidence < MIN_PREDICTION_CONFIDENCE) return null;

  return {
    id: generateId(),
    type: "momentum",
    likelihood: Math.round(likelihood * 100) / 100,
    confidence,
    confidenceLevel: confidenceLevelFrom(confidence),
    supportingPatternIds: [],
    supportingBehaviorIds: behaviors
      .filter((behavior) => behavior.type === "consistency_chain")
      .map((behavior) => behavior.id),
    supportingTrendIds: consistencyTrend ? [consistencyTrend.id] : [],
    evidence: [
      buildEvidence({
        source: "calendar",
        timestamp: today,
        metric: "recent_good_day_rate",
        value: Math.round(recentGood * 100),
        description: "recent_14d_good_day_rate_percent",
      }),
      buildEvidence({
        source: "calendar",
        timestamp: today,
        metric: "previous_good_day_rate",
        value: Math.round(previousGood * 100),
        description: "previous_14d_good_day_rate_percent",
      }),
    ],
  };
}

/**
 * Estimate near-future outcomes using deterministic heuristics.
 */
export function generatePredictions(
  context: ForgeContext,
  patterns: Pattern[],
  trends: Trend[],
  behaviors: BehaviorInsight[]
): Prediction[] {
  const predictions = [
    predictWorkoutLikelihood(context, patterns, behaviors, trends),
    predictHydrationRisk(context, patterns, trends),
    predictStreakMaintenance(context, trends),
    predictMomentum(context, trends, behaviors),
  ].filter((prediction): prediction is Prediction => prediction != null);

  return predictions.sort((a, b) => b.confidence - a.confidence);
}
