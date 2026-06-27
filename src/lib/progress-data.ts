import { format, startOfMonth, subMonths } from "date-fns";
import { todayKey } from "@/lib/date-utils";
import { resolveDayRecord } from "@/lib/calendar-data";
import { formatLiters } from "@/lib/journey-data";
import {
  determineForgeInsight,
  determineHabitEvolution,
  determineHeroReflection,
  determineIdentityTitle,
  determineMilestones,
  determineMonthlyReflection,
  determineTimelineEvents,
  goodDayCount,
  hydrationAvg,
  isGoodDay,
  sleepAvg,
  workoutCompleted,
  type IdentityDayRecord,
  type MilestoneIconId,
} from "@/lib/brain";
import type { DayRecord, Profile, WorkoutSession } from "@/types";

export type ProgressInput = {
  calendarDays: Record<string, DayRecord>;
  waterLogs: Record<string, { totalMl: number }>;
  workoutSessions: Record<string, WorkoutSession>;
  profile: Profile;
  streak: number;
  waterLongestStreak: number;
};

export type ProgressHeroModel = {
  label: string;
  identityTitle: string;
  reflection: string[];
  illustration: string;
};

export type MonthlyReflectionModel = {
  label: string;
  title: string;
  summary: string;
  highlights: string[];
};

export type GrowthTimelineEvent = {
  id: string;
  label: string;
  date?: string;
  isHighlight?: boolean;
};

export type HabitEvolutionModel = {
  id: string;
  personality: string;
  habit: string;
  metric: string;
  summary: string;
};

export type MilestoneModel = {
  id: string;
  icon: MilestoneIconId;
  label: string;
  achieved: boolean;
};

export type ProgressStatsModel = {
  goodDays: number;
  workouts: number;
  avgWater: string;
  avgProtein: string;
  avgSleep: string;
  currentStreak: number;
  longestStreak: number;
  consistency: number;
};

export type ProgressScreenModel = {
  hero: ProgressHeroModel;
  monthlyReflection: MonthlyReflectionModel;
  timeline: GrowthTimelineEvent[];
  habits: HabitEvolutionModel[];
  milestones: MilestoneModel[];
  insight: string;
  stats: ProgressStatsModel;
};

function mergeDays(input: ProgressInput): IdentityDayRecord[] {
  const dates = new Set([
    ...Object.keys(input.calendarDays),
    ...Object.keys(input.waterLogs),
    ...Object.keys(input.workoutSessions),
  ]);

  return [...dates]
    .sort()
    .map((date) => {
      const record = resolveDayRecord(
        date,
        input.calendarDays,
        input.waterLogs,
        input.workoutSessions
      );
      return {
        ...record,
        waterMl: input.waterLogs[date]?.totalMl ?? record.waterMl,
      };
    });
}

function monthDays(
  days: IdentityDayRecord[],
  year: number,
  month: number
): IdentityDayRecord[] {
  const prefix = format(new Date(year, month, 1), "yyyy-MM");
  return days.filter((d) => d.date.startsWith(prefix));
}

function computeLongestStreak(
  days: IdentityDayRecord[],
  predicate: (d: IdentityDayRecord) => boolean
): number {
  let longest = 0;
  let run = 0;
  for (const day of days) {
    if (predicate(day)) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }
  return longest;
}

function buildStats(
  allRecords: IdentityDayRecord[],
  monthRecords: IdentityDayRecord[],
  sessions: Record<string, WorkoutSession>,
  streak: number,
  waterLongestStreak: number
): ProgressStatsModel {
  const recordsForAvg = monthRecords.length ? monthRecords : allRecords;
  const avgWater = hydrationAvg(recordsForAvg);
  const proteinDays = recordsForAvg.filter((d) => (d.proteinG ?? 0) > 0);
  const avgProtein =
    proteinDays.length > 0
      ? Math.round(
          proteinDays.reduce((s, d) => s + (d.proteinG ?? 0), 0) /
            proteinDays.length
        )
      : 0;
  const avgSleep = sleepAvg(recordsForAvg);
  const longestStreak = Math.max(
    streak,
    waterLongestStreak,
    computeLongestStreak(allRecords, isGoodDay)
  );
  const consistency = monthRecords.length
    ? Math.round((goodDayCount(monthRecords) / monthRecords.length) * 100)
    : 0;

  return {
    goodDays: goodDayCount(allRecords),
    workouts: allRecords.filter((d) => workoutCompleted(d, sessions)).length,
    avgWater: avgWater > 0 ? formatLiters(avgWater) : "—",
    avgProtein: avgProtein > 0 ? `${avgProtein}g` : "—",
    avgSleep: avgSleep > 0 ? `${avgSleep.toFixed(1)}h` : "—",
    currentStreak: streak,
    longestStreak,
    consistency,
  };
}

export function buildProgressScreenModel(
  input: ProgressInput
): ProgressScreenModel {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const allRecords = mergeDays(input).filter((d) => d.date <= todayKey());
  const currentMonth = monthDays(allRecords, year, month);
  const prevMonthDate = subMonths(startOfMonth(now), 1);
  const prevMonth = monthDays(
    allRecords,
    prevMonthDate.getFullYear(),
    prevMonthDate.getMonth()
  );

  const ctx = {
    allRecords,
    monthRecords: currentMonth,
    prevMonthRecords: prevMonth,
    profile: input.profile,
    workoutSessions: input.workoutSessions,
    streak: input.streak,
  };

  const identity = determineIdentityTitle(ctx);

  return {
    hero: {
      label: "Progress",
      identityTitle: identity.title,
      reflection: determineHeroReflection(ctx, identity),
      illustration: identity.illustration,
    },
    monthlyReflection: determineMonthlyReflection(ctx),
    timeline: determineTimelineEvents(ctx, identity.title),
    habits: determineHabitEvolution(ctx),
    milestones: determineMilestones(ctx),
    insight: determineForgeInsight(ctx),
    stats: buildStats(
      allRecords,
      currentMonth,
      input.workoutSessions,
      input.streak,
      input.waterLongestStreak
    ),
  };
}
