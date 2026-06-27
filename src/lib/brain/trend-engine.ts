import { isChecklistComplete } from "@/lib/journey-data";
import {
  buildEvidence,
  confidenceFromTrendWindow,
  confidenceLevelFrom,
  percentDelta,
  splitRollingWindows,
} from "@/lib/brain/heuristics";
import { isGoodDay, workoutCompleted } from "@/lib/brain/identity-engine";
import type {
  ForgeContext,
  Pattern,
  Trend,
  TrendDirection,
} from "@/lib/brain/types";

const WINDOW_DAYS = 14;

type MetricSample = {
  metric: string;
  recentValue: number;
  previousValue: number;
  recentCount: number;
  previousCount: number;
  evidenceMetric: string;
  category: string;
};

function resolveDirection(
  deltaPercent: number | null,
  recentValue: number,
  previousValue: number,
  goalThreshold?: number
): TrendDirection {
  if (deltaPercent == null) return "stable";

  if (
    goalThreshold != null &&
    previousValue < goalThreshold &&
    recentValue >= previousValue &&
    deltaPercent >= 5
  ) {
    return "recovering";
  }

  if (Math.abs(deltaPercent) < 3) return "plateau";
  if (deltaPercent >= 8) return "improving";
  if (deltaPercent <= -8) return "declining";
  return "stable";
}

function computeMetricSamples(context: ForgeContext): MetricSample[] {
  const { dayRecords, workout, settings } = context;
  const { recent, previous } = splitRollingWindows(dayRecords, WINDOW_DAYS);
  const sessions = workout.sessions;
  const sleepGoal = settings.profile.dailySleepGoal;
  const waterGoal = settings.profile.dailyWaterGoal;

  const recentWorkoutRate =
    recent.length > 0
      ? recent.filter((day) => workoutCompleted(day, sessions)).length /
        recent.length
      : 0;
  const previousWorkoutRate =
    previous.length > 0
      ? previous.filter((day) => workoutCompleted(day, sessions)).length /
        previous.length
      : 0;

  const recentWaterDays = recent.filter((day) => day.waterMl > 0);
  const previousWaterDays = previous.filter((day) => day.waterMl > 0);
  const recentWaterAvg =
    recentWaterDays.length > 0
      ? recentWaterDays.reduce((sum, day) => sum + day.waterMl, 0) /
        recentWaterDays.length
      : 0;
  const previousWaterAvg =
    previousWaterDays.length > 0
      ? previousWaterDays.reduce((sum, day) => sum + day.waterMl, 0) /
        previousWaterDays.length
      : 0;

  const recentSleepDays = recent.filter((day) => (day.sleepHours ?? 0) > 0);
  const previousSleepDays = previous.filter((day) => (day.sleepHours ?? 0) > 0);
  const recentSleepAvg =
    recentSleepDays.length > 0
      ? recentSleepDays.reduce((sum, day) => sum + (day.sleepHours ?? 0), 0) /
        recentSleepDays.length
      : 0;
  const previousSleepAvg =
    previousSleepDays.length > 0
      ? previousSleepDays.reduce(
          (sum, day) => sum + (day.sleepHours ?? 0),
          0
        ) / previousSleepDays.length
      : 0;

  const recentGoodRate =
    recent.length > 0
      ? recent.filter((day) => isGoodDay(day)).length / recent.length
      : 0;
  const previousGoodRate =
    previous.length > 0
      ? previous.filter((day) => isGoodDay(day)).length / previous.length
      : 0;

  const recentReflectionRate =
    recent.length > 0
      ? recent.filter((day) => isChecklistComplete(day.nightChecklist)).length /
        recent.length
      : 0;
  const previousReflectionRate =
    previous.length > 0
      ? previous.filter((day) => isChecklistComplete(day.nightChecklist))
          .length / previous.length
      : 0;

  return [
    {
      metric: "workout_completion_rate",
      recentValue: recentWorkoutRate,
      previousValue: previousWorkoutRate,
      recentCount: recent.length,
      previousCount: previous.length,
      evidenceMetric: "workout_completion_rate_percent",
      category: "workout",
    },
    {
      metric: "hydration_avg_ml",
      recentValue: recentWaterAvg,
      previousValue: previousWaterAvg,
      recentCount: recentWaterDays.length,
      previousCount: previousWaterDays.length,
      evidenceMetric: "hydration_avg_ml",
      category: "hydration",
    },
    {
      metric: "sleep_avg_hours",
      recentValue: recentSleepAvg,
      previousValue: previousSleepAvg,
      recentCount: recentSleepDays.length,
      previousCount: previousSleepDays.length,
      evidenceMetric: "sleep_avg_hours",
      category: "sleep",
    },
    {
      metric: "good_day_rate",
      recentValue: recentGoodRate,
      previousValue: previousGoodRate,
      recentCount: recent.length,
      previousCount: previous.length,
      evidenceMetric: "good_day_rate_percent",
      category: "consistency",
    },
    {
      metric: "reflection_completion_rate",
      recentValue: recentReflectionRate,
      previousValue: previousReflectionRate,
      recentCount: recent.length,
      previousCount: previous.length,
      evidenceMetric: "reflection_completion_rate_percent",
      category: "reflection",
    },
    {
      metric: "hydration_goal_hit_rate",
      recentValue:
        recent.length > 0
          ? recent.filter((day) => day.waterMl >= waterGoal).length /
            recent.length
          : 0,
      previousValue:
        previous.length > 0
          ? previous.filter((day) => day.waterMl >= waterGoal).length /
            previous.length
          : 0,
      recentCount: recent.length,
      previousCount: previous.length,
      evidenceMetric: "hydration_goal_hit_rate_percent",
      category: "hydration",
    },
    {
      metric: "sleep_goal_hit_rate",
      recentValue:
        recent.length > 0
          ? recent.filter((day) => (day.sleepHours ?? 0) >= sleepGoal).length /
            recent.length
          : 0,
      previousValue:
        previous.length > 0
          ? previous.filter((day) => (day.sleepHours ?? 0) >= sleepGoal)
              .length / previous.length
          : 0,
      recentCount: recent.length,
      previousCount: previous.length,
      evidenceMetric: "sleep_goal_hit_rate_percent",
      category: "sleep",
    },
  ];
}

function buildTrend(
  context: ForgeContext,
  sample: MetricSample,
  goalThreshold?: number
): Trend | null {
  if (sample.recentCount < 3 || sample.previousCount < 3) return null;

  const delta =
    sample.metric.includes("rate") || sample.metric.includes("completion")
      ? percentDelta(sample.recentValue * 100, sample.previousValue * 100)
      : percentDelta(sample.recentValue, sample.previousValue);

  const confidence = confidenceFromTrendWindow(
    sample.recentCount,
    sample.previousCount,
    delta
  );
  if (confidence < 0.25) return null;

  const direction = resolveDirection(
    delta,
    sample.recentValue,
    sample.previousValue,
    goalThreshold
  );

  const displayRecent =
    sample.metric.includes("rate") || sample.metric.includes("completion")
      ? Math.round(sample.recentValue * 100)
      : Math.round(sample.recentValue * 10) / 10;
  const displayPrevious =
    sample.metric.includes("rate") || sample.metric.includes("completion")
      ? Math.round(sample.previousValue * 100)
      : Math.round(sample.previousValue * 10) / 10;

  return {
    id: `trend-${sample.metric}`,
    metric: sample.metric,
    direction,
    confidence,
    confidenceLevel: confidenceLevelFrom(confidence),
    windowDays: WINDOW_DAYS,
    deltaPercent: delta,
    evidence: [
      buildEvidence({
        source: "calendar",
        timestamp: context.today,
        metric: `${sample.evidenceMetric}_recent`,
        value: displayRecent,
        description: `recent_${WINDOW_DAYS}d_window`,
      }),
      buildEvidence({
        source: "calendar",
        timestamp: context.today,
        metric: `${sample.evidenceMetric}_previous`,
        value: displayPrevious,
        description: `previous_${WINDOW_DAYS}d_window`,
      }),
    ],
  };
}

/**
 * Detect long-term metric movement using rolling 14-day windows.
 */
export function detectTrends(
  context: ForgeContext,
  _patterns: Pattern[]
): Trend[] {
  void _patterns;

  const { settings } = context;
  const sleepGoal = settings.profile.dailySleepGoal;
  const waterGoal = settings.profile.dailyWaterGoal;
  const trends: Trend[] = [];

  for (const sample of computeMetricSamples(context)) {
    const goalThreshold =
      sample.metric === "sleep_avg_hours" ||
      sample.metric === "sleep_goal_hit_rate"
        ? sleepGoal
        : sample.metric === "hydration_avg_ml" ||
            sample.metric === "hydration_goal_hit_rate"
          ? waterGoal
          : undefined;

    const trend = buildTrend(context, sample, goalThreshold);
    if (trend) trends.push(trend);
  }

  return trends.sort((a, b) => b.confidence - a.confidence);
}
