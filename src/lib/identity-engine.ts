import { format, parseISO } from "date-fns";
import { assetPublicPath } from "@/lib/asset-catalog";
import { calculateScore } from "@/lib/scoring";
import { formatLiters, isChecklistComplete } from "@/lib/journey-data";
import type { DayRecord, Profile, WorkoutSession } from "@/types";

const GOOD_DAY_SCORE = 80;

export type IdentityDayRecord = DayRecord & { waterMl: number };

export type IdentityContext = {
  allRecords: IdentityDayRecord[];
  monthRecords: IdentityDayRecord[];
  prevMonthRecords: IdentityDayRecord[];
  profile: Profile;
  workoutSessions: Record<string, WorkoutSession>;
  streak: number;
};

export type GrowthStage = "early" | "forming" | "establishing" | "forged";

export type IdentityResult = {
  title: string;
  illustration: string;
  stage: GrowthStage;
};

export type MonthlyReflectionResult = {
  label: string;
  title: string;
  summary: string;
  highlights: string[];
};

export type TimelineEventResult = {
  id: string;
  label: string;
  date?: string;
  isHighlight?: boolean;
};

export type HabitEvolutionResult = {
  id: string;
  personality: string;
  habit: string;
  metric: string;
  summary: string;
};

export type MilestoneIconId =
  | "workout"
  | "streak"
  | "hydration"
  | "morning"
  | "consistency"
  | "reflection";

export type MilestoneResult = {
  id: string;
  icon: MilestoneIconId;
  label: string;
  achieved: boolean;
};

function dayScore(record: IdentityDayRecord): number {
  if (record.dailyScore != null) return record.dailyScore;
  return calculateScore({ ...record, waterMl: record.waterMl }).current.total;
}

function isGoodDay(record: IdentityDayRecord): boolean {
  return dayScore(record) >= GOOD_DAY_SCORE;
}

function workoutCompleted(
  record: IdentityDayRecord,
  sessions: Record<string, WorkoutSession>
): boolean {
  return Boolean(
    sessions[record.date]?.completed ?? record.workoutCompletion?.completed
  );
}

function workoutConsistency(
  days: IdentityDayRecord[],
  sessions: Record<string, WorkoutSession>
): number {
  if (!days.length) return 0;
  return Math.round(
    (days.filter((d) => workoutCompleted(d, sessions)).length / days.length) *
      100
  );
}

function hydrationAvg(days: IdentityDayRecord[]): number {
  if (!days.length) return 0;
  return days.reduce((s, d) => s + d.waterMl, 0) / days.length;
}

function sleepAvg(days: IdentityDayRecord[]): number {
  const withSleep = days.filter((d) => (d.sleepHours ?? 0) > 0);
  if (!withSleep.length) return 0;
  return (
    withSleep.reduce((s, d) => s + (d.sleepHours ?? 0), 0) / withSleep.length
  );
}

function reflectionCount(days: IdentityDayRecord[]): number {
  return days.filter((d) => isChecklistComplete(d.nightChecklist)).length;
}

function goodDayCount(days: IdentityDayRecord[]): number {
  return days.filter((d) => isGoodDay(d)).length;
}

function longestGoodDayStreak(days: IdentityDayRecord[]): number {
  let longest = 0;
  let run = 0;
  for (const day of days) {
    if (isGoodDay(day)) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }
  return longest;
}

function firstPromiseKept(
  days: IdentityDayRecord[],
  sessions: Record<string, WorkoutSession>
): IdentityDayRecord | undefined {
  return days.find(
    (d) =>
      isGoodDay(d) ||
      workoutCompleted(d, sessions) ||
      isChecklistComplete(d.morningChecklist)
  );
}

export function determineGrowthStage(ctx: IdentityContext): GrowthStage {
  const { allRecords, monthRecords } = ctx;
  const totalGood = goodDayCount(allRecords);
  const monthGood = goodDayCount(monthRecords);
  const consistency = monthRecords.length
    ? monthGood / monthRecords.length
    : 0;

  if (totalGood >= 30 && consistency >= 0.75) return "forged";
  if (totalGood >= 14 || monthGood >= 10) return "establishing";
  if (allRecords.length >= 7 || monthGood >= 4) return "forming";
  return "early";
}

export function determineIdentityTitle(ctx: IdentityContext): IdentityResult {
  const { monthRecords, allRecords, profile, workoutSessions } = ctx;
  const stage = determineGrowthStage(ctx);
  const workoutPct = workoutConsistency(monthRecords, workoutSessions);
  const goodCount = goodDayCount(monthRecords);
  const sleep = sleepAvg(monthRecords);
  const reflections = reflectionCount(monthRecords);
  const morningHits = monthRecords.filter((d) =>
    isChecklistComplete(d.morningChecklist)
  ).length;

  if (stage === "forged" || goodDayCount(allRecords) >= 30) {
    return {
      title: "Identity Forged",
      illustration: assetPublicPath("progress/strength.svg"),
      stage,
    };
  }

  if (workoutPct >= 65 && goodCount >= 12) {
    return {
      title: "Disciplined Builder",
      illustration: assetPublicPath("progress/strength.svg"),
      stage,
    };
  }

  if (workoutPct >= 55 && goodCount >= 8) {
    return {
      title: "Intentional Athlete",
      illustration: assetPublicPath("wellness/workout.svg"),
      stage,
    };
  }

  if (morningHits >= 10 && workoutPct >= 40) {
    return {
      title: "Reliable Finisher",
      illustration: assetPublicPath("misc/routine.svg"),
      stage,
    };
  }

  if (sleep >= profile.dailySleepGoal * 0.9 && goodCount >= 8) {
    return {
      title: "Calm Performer",
      illustration: assetPublicPath("wellness/sleep.svg"),
      stage,
    };
  }

  if (reflections >= 8 && goodCount >= 6) {
    return {
      title: "Consistent Creator",
      illustration: assetPublicPath("wellness/meditation.svg"),
      stage,
    };
  }

  if (goodCount >= 10 || workoutPct >= 45) {
    return {
      title: "Focused Performer",
      illustration: assetPublicPath("progress/muscle.svg"),
      stage,
    };
  }

  if (allRecords.length >= 3) {
    return {
      title: "Building Momentum",
      illustration: assetPublicPath("wellness/walking.svg"),
      stage,
    };
  }

  return {
    title: "Building Momentum",
    illustration: assetPublicPath("hero/morning.svg"),
    stage,
  };
}

export function determineHeroReflection(
  ctx: IdentityContext,
  identity: IdentityResult
): string[] {
  const { monthRecords, workoutSessions, allRecords } = ctx;
  const loggedDays = allRecords.length;
  const goodCount = goodDayCount(monthRecords);
  const workoutPct = workoutConsistency(monthRecords, workoutSessions);

  if (loggedDays >= 14 && goodCount >= 10) {
    return [
      "Forge sees consistency becoming part of who you are.",
      "The pattern in your logged days is starting to read like identity.",
    ];
  }

  if (workoutPct >= 50 && goodCount >= 6) {
    return [
      "Training days are appearing with regularity.",
      "Movement is becoming less of a decision and more of a default.",
    ];
  }

  if (loggedDays >= 7) {
    return [
      "Every logged day strengthens your identity.",
      "Forge is reading the rhythm you are quietly building.",
    ];
  }

  if (identity.stage === "early") {
    return [
      "Your record is still forming.",
      "Each entry adds another line to who you are becoming.",
    ];
  }

  return [
    "Every logged day strengthens your identity.",
    "Forge notices before the pattern feels obvious to you.",
  ];
}

export function determineMonthlyReflection(
  ctx: IdentityContext
): MonthlyReflectionResult {
  const { monthRecords, prevMonthRecords, profile, workoutSessions } = ctx;

  const consistency = monthRecords.length
    ? Math.round((goodDayCount(monthRecords) / monthRecords.length) * 100)
    : 0;

  const workoutNow = workoutConsistency(monthRecords, workoutSessions);
  const workoutPrev = workoutConsistency(prevMonthRecords, workoutSessions);
  const workoutDelta = workoutNow - workoutPrev;

  const waterNow = hydrationAvg(monthRecords);
  const waterPrev = hydrationAvg(prevMonthRecords);
  const waterDelta =
    waterPrev > 0 ? Math.round(((waterNow - waterPrev) / waterPrev) * 100) : 0;

  const sleepNow = sleepAvg(monthRecords);
  const reflections = reflectionCount(monthRecords);
  const morningHits = monthRecords.filter((d) =>
    isChecklistComplete(d.morningChecklist)
  ).length;

  let title = "Building Momentum";
  let summary = "Small wins are beginning to compound.";

  if (consistency >= 80) {
    title = "Excellent Month";
    summary = "Your strongest improvement this month has been consistency.";
  } else if (consistency >= 60) {
    title = "Momentum Growing";
    summary = "Your habits are aligning more often than not.";
  } else if (workoutDelta >= 15) {
    summary = "Workout consistency improved noticeably this month.";
  } else if (waterDelta >= 10) {
    summary = "Hydration moved in a clearer direction this month.";
  } else if (sleepNow >= profile.dailySleepGoal * 0.9) {
    summary = `You recover better when your sleep stays above ${profile.dailySleepGoal} hours.`;
  } else if (morningHits >= 8) {
    summary = "Your morning rhythm is holding more days than it misses.";
  } else if (reflections >= 6) {
    summary = "Evening reflection is appearing with more regularity.";
  }

  const highlights: string[] = [];
  if (workoutDelta > 0) highlights.push(`+${workoutDelta}% workout consistency`);
  else if (workoutNow >= 50) highlights.push(`${workoutNow}% workout consistency`);
  if (waterDelta > 0) highlights.push(`Hydration up ${waterDelta}%`);
  else if (waterNow >= profile.dailyWaterGoal * 0.85) {
    highlights.push("Strong hydration rhythm");
  }
  if (sleepNow >= profile.dailySleepGoal * 0.9) highlights.push("Better sleep");
  if (morningHits >= 6) highlights.push("Morning routine holding");
  if (!highlights.length && consistency > 0) {
    highlights.push(`${consistency}% good days`);
  }

  return {
    label: "This Month",
    title,
    summary,
    highlights: highlights.slice(0, 3),
  };
}

export function determineTimelineEvents(
  ctx: IdentityContext,
  identityTitle: string
): TimelineEventResult[] {
  const { allRecords, profile, workoutSessions } = ctx;
  const events: TimelineEventResult[] = [];

  events.push({
    id: "started",
    label: "Started Forge",
    date: profile.startDate,
  });

  const firstKept = firstPromiseKept(allRecords, workoutSessions);
  if (firstKept) {
    events.push({
      id: "first-promise",
      label: "First Promise Kept",
      date: firstKept.date,
    });
  }

  const firstMorning = allRecords.find((d) =>
    isChecklistComplete(d.morningChecklist)
  );
  if (firstMorning) {
    events.push({
      id: "morning-rhythm",
      label: "Morning Rhythm Established",
      date: firstMorning.date,
    });
  }

  const sevenDayStreak = longestGoodDayStreak(allRecords);
  if (sevenDayStreak >= 7) {
    const streakEnd = findStreakEndDate(allRecords, 7);
    events.push({
      id: "seven-days",
      label: "Seven Consistent Days",
      date: streakEnd,
    });
  }

  const monthWorkouts = ctx.monthRecords.filter((d) =>
    workoutCompleted(d, workoutSessions)
  ).length;
  if (monthWorkouts >= 4) {
    const fourthWorkout = allRecords.filter((d) =>
      workoutCompleted(d, workoutSessions)
    )[3];
    events.push({
      id: "workout-forming",
      label: "Workout Habit Forming",
      date: fourthWorkout?.date,
    });
  }

  const totalGood = goodDayCount(allRecords);
  if (totalGood >= 30) {
    events.push({ id: "30-good-days", label: "Thirty Good Days" });
  }

  events.push({
    id: "identity",
    label: identityTitle,
    isHighlight: true,
  });

  return events;
}

function findStreakEndDate(
  days: IdentityDayRecord[],
  target: number
): string | undefined {
  let run = 0;
  let endDate: string | undefined;
  for (const day of days) {
    if (isGoodDay(day)) {
      run++;
      endDate = day.date;
      if (run >= target) return endDate;
    } else {
      run = 0;
    }
  }
  return endDate;
}

export function determineHabitEvolution(
  ctx: IdentityContext
): HabitEvolutionResult[] {
  const { monthRecords, prevMonthRecords, profile, workoutSessions } = ctx;

  const workoutCount = monthRecords.filter((d) =>
    workoutCompleted(d, workoutSessions)
  ).length;
  const workoutPct = workoutConsistency(monthRecords, workoutSessions);
  const prevWorkoutPct = workoutConsistency(prevMonthRecords, workoutSessions);

  const waterAvg = hydrationAvg(monthRecords);
  const prevWater = hydrationAvg(prevMonthRecords);
  const waterDelta =
    prevWater > 0 ? Math.round(((waterAvg - prevWater) / prevWater) * 100) : 0;

  const sleep = sleepAvg(monthRecords);
  const sleepHits = monthRecords.filter(
    (d) => (d.sleepHours ?? 0) >= profile.dailySleepGoal
  ).length;

  const journals = reflectionCount(monthRecords);

  return [
    {
      id: "workout",
      personality: "Strongest Habit",
      habit: "Workout",
      metric: `${workoutCount} session${workoutCount === 1 ? "" : "s"}`,
      summary:
        workoutPct > prevWorkoutPct
          ? "Highest consistency this month."
          : workoutPct >= 50
            ? "Training rhythm is holding steady."
            : "Sessions are beginning to appear with intention.",
    },
    {
      id: "hydration",
      personality: "Building Momentum",
      habit: "Hydration",
      metric: waterAvg > 0 ? `${formatLiters(waterAvg)} average` : "—",
      summary:
        waterDelta > 0
          ? `Up ${waterDelta}% from last month.`
          : waterAvg >= profile.dailyWaterGoal
            ? "Daily target is within reach most days."
            : "Each log adds clarity to your pattern.",
    },
    {
      id: "sleep",
      personality: "Recovery Improving",
      habit: "Sleep",
      metric: sleep > 0 ? `${sleep.toFixed(1)} hours` : "—",
      summary:
        sleepHits >= monthRecords.length * 0.6
          ? "Your most stable habit."
          : sleep > 0
            ? "Rest is becoming more predictable."
            : "Sleep logs will reveal your rhythm.",
    },
    {
      id: "reflection",
      personality: "Evening Awareness",
      habit: "Reflection",
      metric: `${journals} journal${journals === 1 ? "" : "s"}`,
      summary:
        journals >= 8
          ? "You finish more days intentionally."
          : journals > 0
            ? "Evening clarity is taking shape."
            : "One reflection tonight adds signal.",
    },
  ];
}

export function determineMilestones(ctx: IdentityContext): MilestoneResult[] {
  const { allRecords, workoutSessions, streak } = ctx;

  const totalWorkouts = allRecords.filter((d) =>
    workoutCompleted(d, workoutSessions)
  ).length;
  const totalWaterMl = allRecords.reduce((s, d) => s + d.waterMl, 0);
  const totalWaterL = Math.floor(totalWaterMl / 1000);
  const morningMaster = allRecords.filter((d) =>
    isChecklistComplete(d.morningChecklist)
  ).length;
  const reflections = reflectionCount(allRecords);
  const consistency = goodDayCount(allRecords);

  return [
    {
      id: "morning-master",
      icon: "morning",
      label: "Morning Routine",
      achieved: morningMaster >= 14,
    },
    {
      id: "hydration",
      icon: "hydration",
      label: "Hydration",
      achieved: totalWaterL >= 100,
    },
    {
      id: "first-workout",
      icon: "workout",
      label: "First Workout",
      achieved: totalWorkouts >= 1,
    },
    {
      id: "reflection",
      icon: "reflection",
      label: "Reflection",
      achieved: reflections >= 10,
    },
    {
      id: "7-streak",
      icon: "streak",
      label: "7-Day Streak",
      achieved: streak >= 7,
    },
    {
      id: "consistency",
      icon: "consistency",
      label: "Consistency",
      achieved: consistency >= 30,
    },
  ];
}

export function determineForgeInsight(ctx: IdentityContext): string {
  const { allRecords, profile, workoutSessions } = ctx;

  if (allRecords.length < 5) {
    return "Forge is still learning your rhythm. A few more logged days will reveal clearer patterns.";
  }

  const morningWorkoutPattern = analyzeMorningWorkoutPattern(
    allRecords,
    workoutSessions
  );
  if (morningWorkoutPattern) return morningWorkoutPattern;

  const sleepWorkoutPattern = analyzeSleepWorkoutPattern(
    allRecords,
    profile,
    workoutSessions
  );
  if (sleepWorkoutPattern) return sleepWorkoutPattern;

  const hydrationWeekdayPattern = analyzeHydrationWeekdayPattern(allRecords);
  if (hydrationWeekdayPattern) return hydrationWeekdayPattern;

  const reflectionWorkoutPattern = analyzeReflectionWorkoutPattern(
    allRecords,
    workoutSessions
  );
  if (reflectionWorkoutPattern) return reflectionWorkoutPattern;

  const goodDays = goodDayCount(allRecords);
  if (goodDays >= 10) {
    return "Good days cluster when your morning routine completes first.";
  }

  return "Forge is still reading your patterns. Consistency in logging makes the signal clearer.";
}

function analyzeMorningWorkoutPattern(
  days: IdentityDayRecord[],
  sessions: Record<string, WorkoutSession>
): string | null {
  const pairs = days.slice(1).map((d, i) => ({
    prevMorning: isChecklistComplete(days[i].morningChecklist),
    workout: workoutCompleted(d, sessions),
  }));

  const withMorning = pairs.filter((p) => p.prevMorning);
  if (withMorning.length < 4) return null;

  const hitRate =
    withMorning.filter((p) => p.workout).length / withMorning.length;
  const withoutMorning = pairs.filter((p) => !p.prevMorning);
  const missRate =
    withoutMorning.length > 0
      ? withoutMorning.filter((p) => p.workout).length / withoutMorning.length
      : 0;

  if (hitRate >= 0.75 && hitRate - missRate >= 0.25) {
    return "You rarely miss workouts after completing your morning routine.";
  }
  return null;
}

function analyzeSleepWorkoutPattern(
  days: IdentityDayRecord[],
  profile: Profile,
  sessions: Record<string, WorkoutSession>
): string | null {
  const withWorkout = days.filter((d) => workoutCompleted(d, sessions));
  if (withWorkout.length < 5) return null;

  const goodSleepWorkouts = withWorkout.filter(
    (d) => (d.sleepHours ?? 0) >= profile.dailySleepGoal
  ).length;
  const shortSleepWorkouts = withWorkout.filter(
    (d) => (d.sleepHours ?? 0) > 0 && (d.sleepHours ?? 0) < profile.dailySleepGoal
  ).length;

  if (goodSleepWorkouts >= 3 && shortSleepWorkouts >= 2) {
    const goodRate = goodSleepWorkouts / withWorkout.length;
    if (goodRate >= 0.55) {
      return `Sleep above ${profile.dailySleepGoal} hours usually leads to stronger workout days.`;
    }
  }
  return null;
}

function analyzeHydrationWeekdayPattern(
  days: IdentityDayRecord[]
): string | null {
  const byWeekday = new Map<string, number[]>();

  for (const day of days) {
    if (day.waterMl <= 0) continue;
    const weekday = format(parseISO(day.date), "EEEE");
    const list = byWeekday.get(weekday) ?? [];
    list.push(day.waterMl);
    byWeekday.set(weekday, list);
  }

  if (byWeekday.size < 4) return null;

  const averages = [...byWeekday.entries()]
    .filter(([, vals]) => vals.length >= 2)
    .map(([name, vals]) => ({
      name,
      avg: vals.reduce((a, b) => a + b, 0) / vals.length,
    }))
    .sort((a, b) => a.avg - b.avg);

  if (averages.length < 2) return null;

  const lowest = averages[0];
  const highest = averages[averages.length - 1];
  if (highest.avg <= 0) return null;

  const drop = (highest.avg - lowest.avg) / highest.avg;
  if (drop >= 0.2) {
    return `Hydration tends to drop on ${lowest.name}s.`;
  }
  return null;
}

function analyzeReflectionWorkoutPattern(
  days: IdentityDayRecord[],
  sessions: Record<string, WorkoutSession>
): string | null {
  const workoutDays = days.filter((d) => workoutCompleted(d, sessions));
  const restDays = days.filter((d) => !workoutCompleted(d, sessions));

  if (workoutDays.length < 4 || restDays.length < 4) return null;

  const reflectionOnWorkout =
    workoutDays.filter((d) => isChecklistComplete(d.nightChecklist)).length /
    workoutDays.length;
  const reflectionOnRest =
    restDays.filter((d) => isChecklistComplete(d.nightChecklist)).length /
    restDays.length;

  if (reflectionOnWorkout >= 0.5 && reflectionOnWorkout - reflectionOnRest >= 0.2) {
    return "Reflection is strongest after workout days.";
  }
  return null;
}

export {
  goodDayCount,
  workoutCompleted,
  workoutConsistency,
  hydrationAvg,
  sleepAvg,
  isGoodDay,
};
