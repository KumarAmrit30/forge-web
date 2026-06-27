import { format, startOfMonth, subMonths } from "date-fns";
import { resolveDayRecord } from "@/lib/calendar-data";
import { todayKey } from "@/lib/date-utils";
import { getCalendarSnapshot } from "@/stores/calendarStore";
import { getProgressSnapshot } from "@/stores/progressStore";
import { getSettingsSnapshot } from "@/stores/settingsStore";
import { getWaterSnapshot } from "@/stores/waterStore";
import { getWorkoutSnapshot } from "@/stores/workoutStore";
import type { IdentityDayRecord } from "@/lib/brain/types";
import type {
  ForgeCalendarContext,
  ForgeContext,
  ForgeProgressContext,
  ForgeSettingsContext,
  ForgeWaterContext,
  ForgeWorkoutContext,
} from "@/lib/brain/types";
import type { DayRecord, WorkoutSession } from "@/types";

/** Raw store snapshots the Context Engine can accept for testing without Zustand. */
export type ForgeContextSource = {
  calendarDays: Record<string, DayRecord>;
  workoutSessions: Record<string, WorkoutSession>;
  nextWorkoutDayId: string;
  currentCycleIndex: number;
  waterLogs: Record<string, { date: string; totalMl: number }>;
  waterCurrentStreak: number;
  waterLongestStreak: number;
  settings: ForgeSettingsContext;
  progress: ForgeProgressContext;
};

function mergeDayRecords(source: ForgeContextSource): IdentityDayRecord[] {
  const dates = new Set([
    ...Object.keys(source.calendarDays),
    ...Object.keys(source.waterLogs),
    ...Object.keys(source.workoutSessions),
  ]);

  return [...dates]
    .sort()
    .map((date) => {
      const record = resolveDayRecord(
        date,
        source.calendarDays,
        source.waterLogs,
        source.workoutSessions
      );
      return {
        ...record,
        waterMl: source.waterLogs[date]?.totalMl ?? record.waterMl,
      };
    })
    .filter((d) => d.date <= todayKey());
}

function monthSlice(
  days: IdentityDayRecord[],
  year: number,
  month: number
): IdentityDayRecord[] {
  const prefix = format(new Date(year, month, 1), "yyyy-MM");
  return days.filter((d) => d.date.startsWith(prefix));
}

function normalizeCalendar(
  days: Record<string, DayRecord>
): ForgeCalendarContext {
  return { days };
}

function normalizeWorkout(
  sessions: Record<string, WorkoutSession>,
  nextWorkoutDayId: string,
  currentCycleIndex: number
): ForgeWorkoutContext {
  return { sessions, nextWorkoutDayId, currentCycleIndex };
}

function normalizeWater(
  dailyLogs: Record<string, { date: string; totalMl: number }>,
  currentStreak: number,
  longestStreak: number
): ForgeWaterContext {
  return { dailyLogs, currentStreak, longestStreak };
}

function normalizeSettings(
  settings: ReturnType<typeof getSettingsSnapshot>
): ForgeSettingsContext {
  return {
    profile: settings.profile,
    streak: settings.streak,
    lastActiveDate: settings.lastActiveDate,
    morningRoutineItems: settings.morningRoutineItems,
    nightRoutineItems: settings.nightRoutineItems,
  };
}

function normalizeProgress(
  progress: ReturnType<typeof getProgressSnapshot>
): ForgeProgressContext {
  const latest =
    progress.weightLogs.length > 0
      ? progress.weightLogs[progress.weightLogs.length - 1].weightKg
      : null;
  return {
    weightLogCount: progress.weightLogs.length,
    strengthLogCount: progress.strengthLogs.length,
    latestWeightKg: latest,
  };
}

/** Read current Zustand store snapshots. Only this module may access stores. */
export function readStoreSnapshots(): ForgeContextSource {
  const calendar = getCalendarSnapshot();
  const workout = getWorkoutSnapshot();
  const water = getWaterSnapshot();
  const settings = getSettingsSnapshot();
  const progress = getProgressSnapshot();

  const waterLogs: Record<string, { date: string; totalMl: number }> = {};
  for (const [date, log] of Object.entries(water.dailyLogs)) {
    waterLogs[date] = { date: log.date, totalMl: log.totalMl };
  }

  return {
    calendarDays: calendar.days,
    workoutSessions: workout.sessions,
    nextWorkoutDayId: workout.cycle.nextWorkoutDayId,
    currentCycleIndex: workout.cycle.currentIndex,
    waterLogs,
    waterCurrentStreak: water.currentStreak,
    waterLongestStreak: water.longestStreak,
    settings: normalizeSettings(settings),
    progress: normalizeProgress(progress),
  };
}

/**
 * Normalize raw application state into ForgeContext.
 * No business intelligence, recommendations, or prompt generation.
 */
export function buildForgeContext(source: ForgeContextSource): ForgeContext {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const dayRecords = mergeDayRecords(source);
  const currentMonth = monthSlice(dayRecords, year, month);
  const prevMonthDate = subMonths(startOfMonth(now), 1);
  const prevMonth = monthSlice(
    dayRecords,
    prevMonthDate.getFullYear(),
    prevMonthDate.getMonth()
  );

  return {
    generatedAt: now.toISOString(),
    today: todayKey(),
    calendar: normalizeCalendar(source.calendarDays),
    workout: normalizeWorkout(
      source.workoutSessions,
      source.nextWorkoutDayId,
      source.currentCycleIndex
    ),
    water: normalizeWater(
      source.waterLogs,
      source.waterCurrentStreak,
      source.waterLongestStreak
    ),
    settings: source.settings,
    progress: source.progress,
    dayRecords,
    monthRecords: currentMonth,
    prevMonthRecords: prevMonth,
  };
}

/** Collect and normalize current application state from Zustand stores. */
export function collectForgeContext(): ForgeContext {
  return buildForgeContext(readStoreSnapshots());
}
