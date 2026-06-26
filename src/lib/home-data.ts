import { format, subDays } from "date-fns";
import { assetPublicPath } from "@/lib/asset-catalog";
import { todayKey } from "@/lib/date-utils";
import {
  annotateJourneyStatus,
  buildDailyJourney,
  countCompletedSteps,
  estimateWorkoutDurationMinutes,
  getCurrentJourneyStep,
  getNextJourneyStep,
  HOME_JOURNEY_STEP_IDS,
  TODAY_JOURNEY_STEP_IDS,
  shortWorkoutTitle,
  type DailyJourneyStep,
  type JourneyInput,
  type JourneyStepId,
  type JourneyStepWithStatus,
} from "@/lib/journey-data";
import { buildDefaultDayRecord } from "@/lib/sync-day";
import type { DayRecord, WorkoutDay } from "@/types";

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export type JourneyMoment = DailyJourneyStep;

export type HomeMission = {
  title: string;
  subtitle: string;
  duration: string;
  illustration: string;
  href: string;
  isRestDay: boolean;
};

export function getTimeOfDay(date = new Date()): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

export function getGreetingLabel(time: TimeOfDay): string {
  switch (time) {
    case "morning":
      return "Good Morning";
    case "afternoon":
      return "Good Afternoon";
    case "evening":
      return "Good Evening";
    case "night":
      return "Good Night";
  }
}

export function getHeroIllustration(time: TimeOfDay): string {
  return assetPublicPath(`hero/${time}.svg`);
}

export function formatHomeDate(date = new Date()): string {
  return format(date, "EEEE • MMMM d");
}

export function resolveTodayRecord(
  calendarDays: Record<string, DayRecord>
): DayRecord {
  const date = todayKey();
  return calendarDays[date] ?? buildDefaultDayRecord(date);
}

export function buildJourneyInput(
  record: DayRecord,
  profile: JourneyInput["profile"],
  nextDay: WorkoutDay | null,
  isRestDay: boolean,
  waterMl?: number
): JourneyInput {
  return {
    record,
    profile,
    nextDay,
    isRestDay,
    waterMl: waterMl ?? record.waterMl,
  };
}

export function buildJourneyMoments(
  record: DayRecord,
  profile: JourneyInput["profile"],
  isRestDay: boolean,
  nextDay: WorkoutDay | null,
  waterMl?: number
): JourneyMoment[] {
  return buildDailyJourney(
    buildJourneyInput(record, profile, nextDay, isRestDay, waterMl),
    HOME_JOURNEY_STEP_IDS
  );
}

export function buildMission(
  nextDay: WorkoutDay | null,
  isRestDay: boolean
): HomeMission {
  if (isRestDay || !nextDay) {
    return {
      title: "Recovery",
      subtitle: "Mobility & Stretching",
      duration: "30 min",
      illustration: assetPublicPath("wellness/recovery.svg"),
      href: "/today#workout",
      isRestDay: true,
    };
  }

  return {
    title: shortWorkoutTitle(nextDay.name),
    subtitle: "",
    duration: `${estimateWorkoutDurationMinutes(nextDay.exercises.length, false)} min`,
    illustration: assetPublicPath("wellness/workout.svg"),
    href: "/today#workout",
    isRestDay: false,
  };
}

export function buildForgeBrief(time: TimeOfDay): [string, string] {
  switch (time) {
    case "morning":
      return ["Yesterday's discipline becomes today's momentum.", ""];
    case "afternoon":
      return [
        "Half the day remains.",
        "One focused session changes everything.",
      ];
    case "evening":
      return ["You showed up today.", "Let's finish strong together."];
    case "night":
      return ["Recovery is progress too.", "Tomorrow starts tonight."];
  }
}

export function buildForgeInsight(
  streak: number,
  moments: JourneyMoment[],
  isRestDay: boolean
): string {
  if (isRestDay) {
    return "Rest days are when your body adapts and grows stronger.";
  }

  if (streak >= 7) {
    return "You've completed every morning routine this week.";
  }

  if (moments[0]?.complete) {
    return "You started today with intention — that matters.";
  }

  const hydrationDone = moments.find((m) => m.id === "hydration")?.complete;
  if (!hydrationDone) {
    return "You usually drink less water after 3 PM.";
  }

  return "Small daily rituals compound into lasting change.";
}

export function yesterdayKey(): string {
  return format(subDays(new Date(), 1), "yyyy-MM-dd");
}

export type {
  DailyJourneyStep,
  JourneyStepId,
  JourneyStepWithStatus,
};

export {
  annotateJourneyStatus,
  buildDailyJourney,
  countCompletedSteps,
  getCurrentJourneyStep,
  getNextJourneyStep,
  TODAY_JOURNEY_STEP_IDS,
};
