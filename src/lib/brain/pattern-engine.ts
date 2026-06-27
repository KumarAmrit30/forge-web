import { format, parseISO } from "date-fns";
import { isChecklistComplete } from "@/lib/journey-data";
import {
  buildEvidence,
  confidenceFromObservations,
  confidenceLevelFrom,
  daySpan,
} from "@/lib/brain/heuristics";
import { workoutCompleted } from "@/lib/brain/identity-engine";
import type { ForgeContext, Pattern } from "@/lib/brain/types";
import type { WorkoutSession } from "@/types";

const MIN_PATTERN_CONFIDENCE = 0.25;

function detectMorningWorkoutPattern(context: ForgeContext): Pattern | null {
  const { dayRecords, workout } = context;
  const sessions = workout.sessions;
  if (dayRecords.length < 5) return null;

  const pairs = dayRecords.slice(1).map((day, index) => ({
    date: day.date,
    prevMorning: isChecklistComplete(dayRecords[index].morningChecklist),
    workout: workoutCompleted(day, sessions),
  }));

  const withMorning = pairs.filter((pair) => pair.prevMorning);
  if (withMorning.length < 3) return null;

  const hits = withMorning.filter((pair) => pair.workout);
  const withoutMorning = pairs.filter((pair) => !pair.prevMorning);
  const missRate =
    withoutMorning.length > 0
      ? withoutMorning.filter((pair) => pair.workout).length /
        withoutMorning.length
      : 0;
  const hitRate = hits.length / withMorning.length;

  if (hitRate < 0.6 || hitRate - missRate < 0.2) return null;

  const confidence = confidenceFromObservations(
    hits.length,
    withMorning.length,
    daySpan(withMorning)
  );

  const evidence = hits.slice(0, 5).map((pair) =>
    buildEvidence({
      source: "calendar",
      timestamp: pair.date,
      metric: "workout_completion",
      value: 1,
      description: "morning_routine_complete_before_workout_day",
    })
  );

  return {
    id: "pattern-morning-workout",
    category: "routine",
    confidence,
    confidenceLevel: confidenceLevelFrom(confidence),
    description: "morning_routine_precedes_workout_completion",
    relatedMetrics: ["morning_checklist", "workout_completion"],
    evidence,
  };
}

function detectHydrationWorkoutPattern(context: ForgeContext): Pattern | null {
  const { dayRecords, workout, settings } = context;
  const sessions = workout.sessions;
  const workoutDays = dayRecords.filter(
    (day) => workoutCompleted(day, sessions) && day.waterMl > 0
  );
  const restDays = dayRecords.filter(
    (day) => !workoutCompleted(day, sessions) && day.waterMl > 0
  );

  if (workoutDays.length < 3 || restDays.length < 3) return null;

  const workoutAvg =
    workoutDays.reduce((sum, day) => sum + day.waterMl, 0) / workoutDays.length;
  const restAvg =
    restDays.reduce((sum, day) => sum + day.waterMl, 0) / restDays.length;

  if (workoutAvg <= restAvg * 1.08) return null;

  const confidence = confidenceFromObservations(
    workoutDays.length,
    dayRecords.filter((day) => day.waterMl > 0).length,
    daySpan(workoutDays)
  );

  const evidence = [
    buildEvidence({
      source: "water",
      timestamp: context.today,
      metric: "hydration_workout_day_avg_ml",
      value: Math.round(workoutAvg),
      description: "avg_hydration_on_workout_days",
    }),
    buildEvidence({
      source: "water",
      timestamp: context.today,
      metric: "hydration_rest_day_avg_ml",
      value: Math.round(restAvg),
      description: "avg_hydration_on_rest_days",
    }),
    buildEvidence({
      source: "settings",
      timestamp: context.today,
      metric: "daily_water_goal_ml",
      value: settings.profile.dailyWaterGoal,
      description: "profile_water_goal",
    }),
  ];

  return {
    id: "pattern-hydration-workout",
    category: "hydration",
    confidence,
    confidenceLevel: confidenceLevelFrom(confidence),
    description: "hydration_elevated_on_workout_days",
    relatedMetrics: ["water_ml", "workout_completion"],
    evidence,
  };
}

function detectReflectionSleepPattern(context: ForgeContext): Pattern | null {
  const { dayRecords, settings } = context;
  const sleepGoal = settings.profile.dailySleepGoal;

  const poorSleepDays = dayRecords.filter(
    (day) =>
      (day.sleepHours ?? 0) > 0 &&
      (day.sleepHours ?? 0) < sleepGoal &&
      !isChecklistComplete(day.nightChecklist)
  );
  const poorSleepTotal = dayRecords.filter(
    (day) => (day.sleepHours ?? 0) > 0 && (day.sleepHours ?? 0) < sleepGoal
  );

  if (poorSleepTotal.length < 4 || poorSleepDays.length < 3) return null;

  const skipRate = poorSleepDays.length / poorSleepTotal.length;
  if (skipRate < 0.5) return null;

  const confidence = confidenceFromObservations(
    poorSleepDays.length,
    poorSleepTotal.length,
    daySpan(poorSleepTotal)
  );

  const evidence = poorSleepDays.slice(0, 5).map((day) =>
    buildEvidence({
      source: "calendar",
      timestamp: day.date,
      metric: "sleep_hours",
      value: day.sleepHours ?? 0,
      description: "reflection_incomplete_after_sleep_below_goal",
    })
  );

  return {
    id: "pattern-reflection-sleep",
    category: "reflection",
    confidence,
    confidenceLevel: confidenceLevelFrom(confidence),
    description: "reflection_skipped_after_poor_sleep",
    relatedMetrics: ["sleep_hours", "night_checklist"],
    evidence,
  };
}

function detectWeekdayWorkoutPattern(context: ForgeContext): Pattern | null {
  const { dayRecords, workout } = context;
  const sessions: Record<string, WorkoutSession> = workout.sessions;

  const weekday = dayRecords.filter((day) => {
    const dayIndex = parseISO(day.date).getDay();
    return dayIndex >= 1 && dayIndex <= 5;
  });
  const weekend = dayRecords.filter((day) => {
    const dayIndex = parseISO(day.date).getDay();
    return dayIndex === 0 || dayIndex === 6;
  });

  if (weekday.length < 5 || weekend.length < 2) return null;

  const weekdayHits = weekday.filter((day) =>
    workoutCompleted(day, sessions)
  ).length;
  const weekendHits = weekend.filter((day) =>
    workoutCompleted(day, sessions)
  ).length;
  const weekdayRate = weekdayHits / weekday.length;
  const weekendRate = weekendHits / weekend.length;

  if (weekdayRate < 0.35 || weekdayRate - weekendRate < 0.15) return null;

  const confidence = confidenceFromObservations(
    weekdayHits,
    weekday.length,
    daySpan(weekday)
  );

  const evidence = [
    buildEvidence({
      source: "workout",
      timestamp: context.today,
      metric: "weekday_workout_rate",
      value: Math.round(weekdayRate * 100),
      description: "workout_completion_rate_weekdays_percent",
    }),
    buildEvidence({
      source: "workout",
      timestamp: context.today,
      metric: "weekend_workout_rate",
      value: Math.round(weekendRate * 100),
      description: "workout_completion_rate_weekends_percent",
    }),
  ];

  return {
    id: "pattern-weekday-workout",
    category: "workout",
    confidence,
    confidenceLevel: confidenceLevelFrom(confidence),
    description: "workout_consistency_higher_on_weekdays",
    relatedMetrics: ["workout_completion", "weekday"],
    evidence,
  };
}

function detectHydrationWeekdayPattern(context: ForgeContext): Pattern | null {
  const { dayRecords } = context;
  const byWeekday = new Map<string, number[]>();

  for (const day of dayRecords) {
    if (day.waterMl <= 0) continue;
    const weekday = format(parseISO(day.date), "EEEE");
    const values = byWeekday.get(weekday) ?? [];
    values.push(day.waterMl);
    byWeekday.set(weekday, values);
  }

  if (byWeekday.size < 4) return null;

  const averages = [...byWeekday.entries()]
    .filter(([, values]) => values.length >= 2)
    .map(([name, values]) => ({
      name,
      avg: values.reduce((sum, value) => sum + value, 0) / values.length,
      count: values.length,
    }))
    .sort((a, b) => a.avg - b.avg);

  if (averages.length < 2) return null;

  const lowest = averages[0];
  const highest = averages[averages.length - 1];
  if (highest.avg <= 0) return null;

  const drop = (highest.avg - lowest.avg) / highest.avg;
  if (drop < 0.18) return null;

  const confidence = confidenceFromObservations(
    lowest.count,
    dayRecords.filter((day) => day.waterMl > 0).length,
    daySpan(dayRecords)
  );

  const evidence = [
    buildEvidence({
      source: "water",
      timestamp: context.today,
      metric: "lowest_weekday_hydration_avg_ml",
      value: Math.round(lowest.avg),
      description: `lowest_hydration_weekday_${lowest.name.toLowerCase()}`,
    }),
    buildEvidence({
      source: "water",
      timestamp: context.today,
      metric: "highest_weekday_hydration_avg_ml",
      value: Math.round(highest.avg),
      description: `highest_hydration_weekday_${highest.name.toLowerCase()}`,
    }),
  ];

  return {
    id: "pattern-hydration-weekday",
    category: "hydration",
    confidence,
    confidenceLevel: confidenceLevelFrom(confidence),
    description: "hydration_varies_by_weekday",
    relatedMetrics: ["water_ml", "weekday"],
    evidence,
  };
}

function detectSleepWorkoutPattern(context: ForgeContext): Pattern | null {
  const { dayRecords, workout, settings } = context;
  const sessions = workout.sessions;
  const sleepGoal = settings.profile.dailySleepGoal;

  const workoutDays = dayRecords.filter(
    (day) => workoutCompleted(day, sessions) && (day.sleepHours ?? 0) > 0
  );
  if (workoutDays.length < 5) return null;

  const goodSleepWorkouts = workoutDays.filter(
    (day) => (day.sleepHours ?? 0) >= sleepGoal
  );
  const shortSleepWorkouts = workoutDays.filter(
    (day) => (day.sleepHours ?? 0) < sleepGoal
  );

  if (goodSleepWorkouts.length < 3 || shortSleepWorkouts.length < 2) return null;

  const goodRate = goodSleepWorkouts.length / workoutDays.length;
  if (goodRate < 0.55) return null;

  const confidence = confidenceFromObservations(
    goodSleepWorkouts.length,
    workoutDays.length,
    daySpan(workoutDays)
  );

  const evidence = goodSleepWorkouts.slice(0, 4).map((day) =>
    buildEvidence({
      source: "calendar",
      timestamp: day.date,
      metric: "sleep_hours",
      value: day.sleepHours ?? 0,
      description: "workout_day_with_sleep_at_or_above_goal",
    })
  );

  return {
    id: "pattern-sleep-workout",
    category: "sleep",
    confidence,
    confidenceLevel: confidenceLevelFrom(confidence),
    description: "adequate_sleep_associated_with_workout_days",
    relatedMetrics: ["sleep_hours", "workout_completion"],
    evidence,
  };
}

/** Detect structured recurring relationships from historical day records. */
export function detectPatterns(context: ForgeContext): Pattern[] {
  const patterns: Pattern[] = [];
  const detectors = [
    detectMorningWorkoutPattern,
    detectHydrationWorkoutPattern,
    detectReflectionSleepPattern,
    detectWeekdayWorkoutPattern,
    detectHydrationWeekdayPattern,
    detectSleepWorkoutPattern,
  ];

  for (const detect of detectors) {
    const pattern = detect(context);
    if (pattern && pattern.confidence >= MIN_PATTERN_CONFIDENCE) {
      patterns.push(pattern);
    }
  }

  return patterns.sort((a, b) => b.confidence - a.confidence);
}
