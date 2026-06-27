import { isChecklistComplete } from "@/lib/journey-data";
import {
  buildEvidence,
  confidenceFromObservations,
  confidenceLevelFrom,
  daySpan,
} from "@/lib/brain/heuristics";
import { workoutCompleted } from "@/lib/brain/identity-engine";
import type {
  BehaviorInsight,
  ForgeContext,
  Pattern,
} from "@/lib/brain/types";
import { generateId } from "@/lib/id";

const MIN_BEHAVIOR_CONFIDENCE = 0.25;

function relatedPatternIds(
  patterns: Pattern[],
  descriptions: string[]
): string[] {
  return patterns
    .filter((pattern) => descriptions.includes(pattern.description))
    .map((pattern) => pattern.id);
}

function detectSleepMorningWorkoutChain(
  context: ForgeContext,
  patterns: Pattern[]
): BehaviorInsight | null {
  const { dayRecords, workout, settings } = context;
  const sessions = workout.sessions;
  const sleepGoal = settings.profile.dailySleepGoal;

  const matches = dayRecords.filter((day) => {
    const sleepBelow =
      (day.sleepHours ?? 0) > 0 && (day.sleepHours ?? 0) < sleepGoal;
    const morningIncomplete = !isChecklistComplete(day.morningChecklist);
    const workoutMissed = !workoutCompleted(day, sessions);
    return sleepBelow && morningIncomplete && workoutMissed;
  });

  if (matches.length < 2) return null;

  const eligible = dayRecords.filter(
    (day) => (day.sleepHours ?? 0) > 0 && (day.sleepHours ?? 0) < sleepGoal
  );
  if (eligible.length < 3) return null;

  const confidence = confidenceFromObservations(
    matches.length,
    eligible.length,
    daySpan(matches)
  );
  if (confidence < MIN_BEHAVIOR_CONFIDENCE) return null;

  return {
    id: generateId(),
    type: "recovery_chain",
    trigger: "sleep_below_goal",
    action: "morning_routine_incomplete",
    outcome: "workout_not_completed",
    confidence,
    confidenceLevel: confidenceLevelFrom(confidence),
    evidence: matches.slice(0, 5).map((day) =>
      buildEvidence({
        source: "calendar",
        timestamp: day.date,
        metric: "sleep_hours",
        value: day.sleepHours ?? 0,
        description: "observed_sleep_morning_workout_chain",
      })
    ),
    relatedPatternIds: relatedPatternIds(patterns, [
      "adequate_sleep_associated_with_workout_days",
      "morning_routine_precedes_workout_completion",
    ]),
  };
}

function detectWorkoutHydrationReflectionChain(
  context: ForgeContext,
  patterns: Pattern[]
): BehaviorInsight | null {
  const { dayRecords, workout } = context;
  const sessions = workout.sessions;

  const workoutDays = dayRecords.filter((day) => workoutCompleted(day, sessions));
  if (workoutDays.length < 3) return null;

  const restDays = dayRecords.filter(
    (day) => !workoutCompleted(day, sessions) && day.waterMl > 0
  );
  const restAvg =
    restDays.length > 0
      ? restDays.reduce((sum, day) => sum + day.waterMl, 0) / restDays.length
      : 0;

  const matches = workoutDays.filter((day) => {
    const hydrationElevated = restAvg <= 0 || day.waterMl >= restAvg * 1.05;
    const reflectionComplete = isChecklistComplete(day.nightChecklist);
    return hydrationElevated && reflectionComplete;
  });

  if (matches.length < 2) return null;

  const confidence = confidenceFromObservations(
    matches.length,
    workoutDays.length,
    daySpan(matches)
  );
  if (confidence < MIN_BEHAVIOR_CONFIDENCE) return null;

  return {
    id: generateId(),
    type: "hydration_chain",
    trigger: "workout_completed",
    action: "hydration_elevated",
    outcome: "reflection_completed",
    confidence,
    confidenceLevel: confidenceLevelFrom(confidence),
    evidence: matches.slice(0, 5).map((day) =>
      buildEvidence({
        source: "calendar",
        timestamp: day.date,
        metric: "water_ml",
        value: day.waterMl,
        description: "observed_workout_hydration_reflection_chain",
      })
    ),
    relatedPatternIds: relatedPatternIds(patterns, [
      "hydration_elevated_on_workout_days",
    ]),
  };
}

function detectMorningSkipWorkoutChain(
  context: ForgeContext,
  patterns: Pattern[]
): BehaviorInsight | null {
  const { dayRecords, workout } = context;
  const sessions = workout.sessions;

  const pairs = dayRecords.slice(1).map((day, index) => ({
    date: day.date,
    prevMorning: isChecklistComplete(dayRecords[index].morningChecklist),
    morningSkipped: !isChecklistComplete(day.morningChecklist),
    workoutMissed: !workoutCompleted(day, sessions),
  }));

  const morningSkipped = pairs.filter((pair) => pair.morningSkipped);
  if (morningSkipped.length < 3) return null;

  const matches = morningSkipped.filter((pair) => pair.workoutMissed);
  if (matches.length < 2) return null;

  const confidence = confidenceFromObservations(
    matches.length,
    morningSkipped.length,
    daySpan(matches.map((pair) => ({ date: pair.date })))
  );
  if (confidence < MIN_BEHAVIOR_CONFIDENCE) return null;

  return {
    id: generateId(),
    type: "routine_chain",
    trigger: "morning_routine_incomplete",
    action: "workout_day_reached",
    outcome: "workout_not_completed",
    confidence,
    confidenceLevel: confidenceLevelFrom(confidence),
    evidence: matches.slice(0, 5).map((pair) =>
      buildEvidence({
        source: "calendar",
        timestamp: pair.date,
        metric: "workout_completion",
        value: 0,
        description: "observed_morning_skip_workout_chain",
      })
    ),
    relatedPatternIds: relatedPatternIds(patterns, [
      "morning_routine_precedes_workout_completion",
    ]),
  };
}

function detectPoorSleepReflectionChain(
  context: ForgeContext,
  patterns: Pattern[]
): BehaviorInsight | null {
  const { dayRecords, settings } = context;
  const sleepGoal = settings.profile.dailySleepGoal;

  const poorSleepDays = dayRecords.filter(
    (day) =>
      (day.sleepHours ?? 0) > 0 && (day.sleepHours ?? 0) < sleepGoal
  );
  if (poorSleepDays.length < 3) return null;

  const matches = poorSleepDays.filter(
    (day) => !isChecklistComplete(day.nightChecklist)
  );
  if (matches.length < 2) return null;

  const confidence = confidenceFromObservations(
    matches.length,
    poorSleepDays.length,
    daySpan(poorSleepDays)
  );
  if (confidence < MIN_BEHAVIOR_CONFIDENCE) return null;

  return {
    id: generateId(),
    type: "reflection_chain",
    trigger: "sleep_below_goal",
    action: "evening_reached",
    outcome: "reflection_not_completed",
    confidence,
    confidenceLevel: confidenceLevelFrom(confidence),
    evidence: matches.slice(0, 5).map((day) =>
      buildEvidence({
        source: "calendar",
        timestamp: day.date,
        metric: "night_checklist",
        value: 0,
        description: "observed_poor_sleep_reflection_skip_chain",
      })
    ),
    relatedPatternIds: relatedPatternIds(patterns, [
      "reflection_skipped_after_poor_sleep",
    ]),
  };
}

function detectConsistencyChain(
  context: ForgeContext,
  patterns: Pattern[]
): BehaviorInsight | null {
  const { dayRecords } = context;
  if (dayRecords.length < 7) return null;

  const sorted = [...dayRecords].sort((a, b) => a.date.localeCompare(b.date));
  let run = 0;
  let bestRun = 0;
  let bestEnd = sorted[0]?.date ?? context.today;

  for (const day of sorted) {
    const morningDone = isChecklistComplete(day.morningChecklist);
    const reflectionDone = isChecklistComplete(day.nightChecklist);
    if (morningDone && reflectionDone) {
      run++;
      if (run > bestRun) {
        bestRun = run;
        bestEnd = day.date;
      }
    } else {
      run = 0;
    }
  }

  if (bestRun < 3) return null;

  const confidence = confidenceFromObservations(
    bestRun,
    sorted.length,
    bestRun
  );
  if (confidence < MIN_BEHAVIOR_CONFIDENCE) return null;

  return {
    id: generateId(),
    type: "consistency_chain",
    trigger: "morning_routine_complete",
    action: "day_progressed",
    outcome: "reflection_completed_same_day",
    confidence,
    confidenceLevel: confidenceLevelFrom(confidence),
    evidence: [
      buildEvidence({
        source: "calendar",
        timestamp: bestEnd,
        metric: "routine_reflection_streak_days",
        value: bestRun,
        description: "observed_morning_to_reflection_consistency_run",
      }),
    ],
    relatedPatternIds: relatedPatternIds(patterns, []),
  };
}

/**
 * Explain observed behavioral relationships as trigger → action → outcome chains.
 * Correlation only — never claims causation.
 */
export function analyzeBehaviors(
  context: ForgeContext,
  patterns: Pattern[]
): BehaviorInsight[] {
  const behaviors = [
    detectSleepMorningWorkoutChain(context, patterns),
    detectWorkoutHydrationReflectionChain(context, patterns),
    detectMorningSkipWorkoutChain(context, patterns),
    detectPoorSleepReflectionChain(context, patterns),
    detectConsistencyChain(context, patterns),
  ].filter((behavior): behavior is BehaviorInsight => behavior != null);

  return behaviors.sort((a, b) => b.confidence - a.confidence);
}
