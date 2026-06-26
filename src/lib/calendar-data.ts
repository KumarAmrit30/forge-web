import { format, parseISO, isAfter, startOfDay } from "date-fns";
import { assetPublicPath } from "@/lib/asset-catalog";
import { getMonthGridMondayStart, todayKey } from "@/lib/date-utils";
import { calculateScore } from "@/lib/scoring";
import { buildDefaultDayRecord } from "@/lib/sync-day";
import { generateInsights } from "@/lib/insights";
import {
  buildDailyJourney,
  estimateWorkoutDurationMinutes,
  formatLiters,
  isChecklistComplete,
  journeyIllustration,
  shortWorkoutTitle,
  TODAY_JOURNEY_STEP_IDS,
  type JourneyStepId,
} from "@/lib/journey-data";
import type { DayRecord, Profile, WorkoutDay, WorkoutPlan } from "@/types";

export type CalendarDotState = "completed" | "incomplete" | "unavailable";

export type CalendarDot = {
  id: JourneyStepId;
  state: CalendarDotState;
};

export type CalendarDayCellModel = {
  date: string;
  dayNumber: number;
  isToday: boolean;
  isSelected: boolean;
  isFuture: boolean;
  hasData: boolean;
  dots: CalendarDot[];
};

export type CalendarMonthSummary = {
  goodDays: number;
  workouts: number;
  avgWaterLiters: string;
  consistencyPercent: number;
};

export type CalendarActivityRow = {
  id: JourneyStepId;
  label: string;
  value: string;
  completed: boolean;
  unavailable: boolean;
};

export type CalendarDayReflection = {
  date: string;
  weekdayLabel: string;
  dateLabel: string;
  dayTitle: string;
  illustration: string;
  activities: CalendarActivityRow[];
  insight: string;
};

export type CalendarInput = {
  year: number;
  month: number;
  selectedDate: string | null;
  calendarDays: Record<string, DayRecord>;
  waterLogs: Record<string, { totalMl: number }>;
  workoutSessions: Record<string, { completed?: boolean; dayId?: string }>;
  workoutPlan: WorkoutPlan;
  profile: Profile;
};

const DOT_ORDER: JourneyStepId[] = TODAY_JOURNEY_STEP_IDS;

const GOOD_DAY_SCORE = 80;

function dateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function isFutureDate(dateStr: string): boolean {
  const today = startOfDay(new Date());
  const target = startOfDay(parseISO(dateStr));
  return isAfter(target, today);
}

function isBeforeStart(dateStr: string, profile: Profile): boolean {
  if (!profile.startDate) return false;
  return dateStr < profile.startDate;
}

export function resolveDayRecord(
  date: string,
  calendarDays: Record<string, DayRecord>,
  waterLogs: CalendarInput["waterLogs"],
  workoutSessions: CalendarInput["workoutSessions"]
): DayRecord {
  const base = calendarDays[date] ?? buildDefaultDayRecord(date);
  const waterMl = waterLogs[date]?.totalMl ?? base.waterMl;
  const session = workoutSessions[date];

  return {
    ...base,
    date,
    waterMl,
    workoutCompletion: session
      ? {
          ...base.workoutCompletion,
          dayId: session.dayId ?? base.workoutCompletion?.dayId ?? "",
          date,
          exercises: base.workoutCompletion?.exercises ?? [],
          completed: session.completed ?? base.workoutCompletion?.completed ?? false,
        }
      : base.workoutCompletion,
  };
}

function workoutDayForSession(
  plan: WorkoutPlan,
  session?: { dayId?: string }
): WorkoutDay | null {
  if (!session?.dayId) return null;
  return plan.days.find((d) => d.id === session.dayId) ?? null;
}

function isRestDayForRecord(
  plan: WorkoutPlan,
  record: DayRecord,
  workoutSessions: CalendarInput["workoutSessions"]
): boolean {
  const session = workoutSessions[record.date] ?? record.workoutCompletion;
  const day = workoutDayForSession(plan, session);
  if (day) return Boolean(day.isRestDay);
  return false;
}

function hasTrackedData(record: DayRecord, waterMl: number): boolean {
  return (
    waterMl > 0 ||
    (record.proteinG ?? 0) > 0 ||
    (record.sleepHours ?? 0) > 0 ||
    (record.steps ?? 0) > 0 ||
    Boolean(record.workoutCompletion?.completed) ||
    Object.values(record.morningChecklist).some(Boolean) ||
    Object.values(record.nightChecklist).some(Boolean) ||
    record.dailyScore != null
  );
}

function dotStateForStep(
  stepId: JourneyStepId,
  record: DayRecord,
  profile: Profile,
  waterMl: number,
  isRestDay: boolean,
  unavailable: boolean
): CalendarDotState {
  if (unavailable) return "unavailable";

  switch (stepId) {
    case "morning":
      return isChecklistComplete(record.morningChecklist)
        ? "completed"
        : "incomplete";
    case "workout":
      if (isRestDay) {
        return record.workoutCompletion?.completed ? "completed" : "incomplete";
      }
      return record.workoutCompletion?.completed ? "completed" : "incomplete";
    case "hydration":
      return waterMl >= profile.dailyWaterGoal ? "completed" : "incomplete";
    case "nutrition":
      return (record.proteinG ?? 0) >= profile.dailyProteinGoal
        ? "completed"
        : "incomplete";
    case "reflection":
      return isChecklistComplete(record.nightChecklist)
        ? "completed"
        : "incomplete";
    case "sleep":
      return (record.sleepHours ?? 0) >= profile.dailySleepGoal
        ? "completed"
        : "incomplete";
  }
}

function dayScore(record: DayRecord, profile: Profile, waterMl: number): number {
  if (record.dailyScore != null) return record.dailyScore;
  const scored = calculateScore({ ...record, waterMl });
  return scored.current.total;
}

function formatSleepHours(hours: number): string {
  const rounded = Math.round(hours * 10) / 10;
  return `${rounded}H`;
}

function mealCountLabel(proteinG: number, goal: number): string {
  if (proteinG <= 0) return "—";
  if (proteinG >= goal) return "Protein met";
  if (proteinG >= goal * 0.66) return "2 Meals";
  return "1 Meal";
}

function workoutActivityValue(
  record: DayRecord,
  plan: WorkoutPlan,
  sessions: CalendarInput["workoutSessions"]
): { value: string; completed: boolean; unavailable: boolean } {
  const session = sessions[record.date] ?? record.workoutCompletion;
  const day = workoutDayForSession(plan, session);

  if (!session && !day) {
    return { value: "—", completed: false, unavailable: true };
  }

  if (day?.isRestDay) {
    if (session?.completed) {
      const mins = estimateWorkoutDurationMinutes(0, true);
      return {
        value: `Recovery · ${mins}m`,
        completed: true,
        unavailable: false,
      };
    }
    return { value: "Rest day", completed: false, unavailable: false };
  }

  if (!session?.completed) {
    return {
      value: day ? shortWorkoutTitle(day.name) : "—",
      completed: false,
      unavailable: !day,
    };
  }

  const mins = estimateWorkoutDurationMinutes(day?.exercises.length ?? 0, false);
  const title = day ? shortWorkoutTitle(day.name) : "Workout";
  return { value: `${title} · ${mins}m`, completed: true, unavailable: false };
}

function buildDayTitle(
  score: number,
  isRestDay: boolean,
  completedCount: number,
  total: number
): string {
  if (isRestDay && completedCount >= total - 1) return "Recovery Day";
  if (score >= 90) return "Strong Day";
  if (score >= GOOD_DAY_SCORE) return "Balanced Day";
  if (completedCount >= total / 2) return "Steady Day";
  if (completedCount === 0) return "Quiet Day";
  return "Building Day";
}

function pickDayIllustration(
  record: DayRecord,
  profile: Profile,
  plan: WorkoutPlan,
  sessions: CalendarInput["workoutSessions"],
  isRestDay: boolean,
  waterMl: number
): string {
  const journey = buildDailyJourney({
    record,
    profile,
    nextDay: workoutDayForSession(
      plan,
      sessions[record.date] ?? record.workoutCompletion
    ),
    isRestDay,
    waterMl,
  });

  const lastComplete = [...journey].reverse().find((s) => s.complete);
  const id = lastComplete?.id ?? journey[0]?.id ?? "morning";
  if (id === "workout" && isRestDay) {
    return assetPublicPath("wellness/meditation.svg");
  }
  return journeyIllustration(id, isRestDay);
}

export function buildCalendarInsight(
  selectedDate: string | null,
  input: Pick<
    CalendarInput,
    "calendarDays" | "waterLogs" | "profile" | "workoutSessions"
  >
): string {
  const { calendarDays, waterLogs, profile } = input;

  if (selectedDate) {
    const weekday = format(parseISO(selectedDate), "EEEE");
    const weekdayRecords = Object.entries(calendarDays)
      .filter(([date]) => format(parseISO(date), "EEEE") === weekday)
      .map(([date, record]) => ({
        record,
        water: waterLogs[date]?.totalMl ?? record.waterMl,
      }));

    if (weekdayRecords.length >= 3) {
      const hits = weekdayRecords.filter(
        ({ record, water }) =>
          (water ?? record.waterMl) >= profile.dailyWaterGoal
      ).length;
      const pct = Math.round((hits / weekdayRecords.length) * 100);
      if (pct < 50) {
        return `You usually drink less water on ${weekday}s.`;
      }
    }

    const workoutDays = weekdayRecords.filter(
      ({ record }) => record.workoutCompletion?.completed
    ).length;
    if (workoutDays >= 2 && weekdayRecords.length >= 3) {
      const workoutPct = Math.round((workoutDays / weekdayRecords.length) * 100);
      if (workoutPct >= 60) {
        return `Workout consistency is strongest on ${weekday}s.`;
      }
    }

    const morningComplete = weekdayRecords.filter(({ record }) =>
      isChecklistComplete(record.morningChecklist)
    ).length;
    const sleepGood = weekdayRecords.filter(
      ({ record }) => (record.sleepHours ?? 0) >= profile.dailySleepGoal
    ).length;
    if (
      morningComplete >= 2 &&
      sleepGood >= 2 &&
      morningComplete / weekdayRecords.length >= 0.6
    ) {
      return "Morning routines improve your sleep.";
    }
  }

  const insights = generateInsights();
  if (insights.length > 0) {
    return insights[0];
  }

  return "Keep logging — patterns emerge as your calendar fills in.";
}

export function buildMonthSummary(input: CalendarInput): CalendarMonthSummary {
  const { year, month, calendarDays, waterLogs, workoutSessions, profile } =
    input;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let goodDays = 0;
  let workouts = 0;
  let waterTotal = 0;
  let trackedDays = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const date = format(new Date(year, month, d), "yyyy-MM-dd");
    if (isFutureDate(date)) continue;

    const record = resolveDayRecord(
      date,
      calendarDays,
      waterLogs,
      workoutSessions
    );
    const waterMl = waterLogs[date]?.totalMl ?? record.waterMl;

    if (isBeforeStart(date, profile) && !hasTrackedData(record, waterMl)) {
      continue;
    }

    trackedDays++;
    waterTotal += waterMl;

    const score = dayScore(record, profile, waterMl);
    if (score >= GOOD_DAY_SCORE) goodDays++;

    const session = workoutSessions[date] ?? record.workoutCompletion;
    if (session?.completed) workouts++;
  }

  const avgWater =
    trackedDays > 0 ? waterTotal / trackedDays / 1000 : 0;
  const consistency =
    trackedDays > 0 ? Math.round((goodDays / trackedDays) * 100) : 0;

  return {
    goodDays,
    workouts,
    avgWaterLiters: `${avgWater.toFixed(1).replace(/\.0$/, "")}L`,
    consistencyPercent: consistency,
  };
}

export function buildCalendarGrid(input: CalendarInput): CalendarDayCellModel[] {
  const {
    year,
    month,
    selectedDate,
    calendarDays,
    waterLogs,
    workoutSessions,
    workoutPlan,
    profile,
  } = input;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: CalendarDayCellModel[] = [];
  const today = todayKey();

  for (let d = 1; d <= daysInMonth; d++) {
    const date = format(new Date(year, month, d), "yyyy-MM-dd");
    const record = resolveDayRecord(
      date,
      calendarDays,
      waterLogs,
      workoutSessions
    );
    const waterMl = waterLogs[date]?.totalMl ?? record.waterMl;
    const isFuture = isFutureDate(date);
    const beforeStart = isBeforeStart(date, profile);
    const hasData = hasTrackedData(record, waterMl);
    const unavailableDay = isFuture || (beforeStart && !hasData);
    const isRestDay = isRestDayForRecord(workoutPlan, record, workoutSessions);

    const dots: CalendarDot[] = DOT_ORDER.map((id) => ({
      id,
      state: dotStateForStep(
        id,
        record,
        profile,
        waterMl,
        isRestDay,
        unavailableDay
      ),
    }));

    cells.push({
      date,
      dayNumber: d,
      isToday: date === today,
      isSelected: date === selectedDate,
      isFuture,
      hasData,
      dots,
    });
  }

  return cells;
}

export function buildCalendarGridWeeks(
  input: CalendarInput
): (CalendarDayCellModel | null)[][] {
  const cellMap = new Map(
    buildCalendarGrid(input).map((cell) => [cell.date, cell])
  );
  const weeks = getMonthGridMondayStart(input.year, input.month);

  return weeks.map((week) =>
    week.map((date) => (date ? cellMap.get(dateKey(date)) ?? null : null))
  );
}

export function buildDayReflection(
  date: string,
  input: CalendarInput
): CalendarDayReflection {
  const {
    calendarDays,
    waterLogs,
    workoutSessions,
    workoutPlan,
    profile,
  } = input;

  const record = resolveDayRecord(
    date,
    calendarDays,
    waterLogs,
    workoutSessions
  );
  const waterMl = waterLogs[date]?.totalMl ?? record.waterMl;
  const isRestDay = isRestDayForRecord(workoutPlan, record, workoutSessions);
  const parsed = parseISO(date);
  const score = dayScore(record, profile, waterMl);

  const journey = buildDailyJourney({
    record,
    profile,
    nextDay: workoutDayForSession(
      workoutPlan,
      workoutSessions[date] ?? record.workoutCompletion
    ),
    isRestDay,
    waterMl,
  });

  const completedCount = journey.filter((s) => s.complete).length;
  const workout = workoutActivityValue(record, workoutPlan, workoutSessions);

  const morningComplete = isChecklistComplete(record.morningChecklist);
  const reflectionComplete = isChecklistComplete(record.nightChecklist);
  const hydrationComplete = waterMl >= profile.dailyWaterGoal;
  const nutritionComplete = (record.proteinG ?? 0) >= profile.dailyProteinGoal;
  const sleepComplete = (record.sleepHours ?? 0) >= profile.dailySleepGoal;

  const activities: CalendarActivityRow[] = [
    {
      id: "workout",
      label: "Workout",
      value: workout.value,
      completed: workout.completed,
      unavailable: workout.unavailable,
    },
    {
      id: "hydration",
      label: "Hydration",
      value: waterMl > 0 ? formatLiters(waterMl) : "—",
      completed: hydrationComplete,
      unavailable: waterMl <= 0 && !hasTrackedData(record, waterMl),
    },
    {
      id: "morning",
      label: "Morning Routine",
      value: morningComplete ? "COMPLETE" : "—",
      completed: morningComplete,
      unavailable:
        !morningComplete &&
        Object.values(record.morningChecklist).every((v) => !v),
    },
    {
      id: "nutrition",
      label: "Nutrition",
      value: mealCountLabel(record.proteinG ?? 0, profile.dailyProteinGoal),
      completed: nutritionComplete,
      unavailable: (record.proteinG ?? 0) <= 0,
    },
    {
      id: "reflection",
      label: "Reflection",
      value: reflectionComplete ? "COMPLETE" : "—",
      completed: reflectionComplete,
      unavailable:
        !reflectionComplete &&
        Object.values(record.nightChecklist).every((v) => !v),
    },
    {
      id: "sleep",
      label: "Sleep",
      value:
        (record.sleepHours ?? 0) > 0
          ? formatSleepHours(record.sleepHours ?? 0)
          : "—",
      completed: sleepComplete,
      unavailable: (record.sleepHours ?? 0) <= 0,
    },
  ];

  return {
    date,
    weekdayLabel: format(parsed, "EEEE").toUpperCase(),
    dateLabel: format(parsed, "d MMMM"),
    dayTitle: buildDayTitle(score, isRestDay, completedCount, journey.length),
    illustration: pickDayIllustration(
      record,
      profile,
      workoutPlan,
      workoutSessions,
      isRestDay,
      waterMl
    ),
    activities,
    insight: buildCalendarInsight(date, {
      calendarDays,
      waterLogs,
      profile,
      workoutSessions,
    }),
  };
}

export function buildCalendarScreenModel(input: CalendarInput) {
  return {
    summary: buildMonthSummary(input),
    weeks: buildCalendarGridWeeks(input),
    reflection: input.selectedDate
      ? buildDayReflection(input.selectedDate, input)
      : null,
  };
}

export { dateKey as calendarDateKey };
