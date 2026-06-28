import { buildForgeContext, type ForgeContextSource } from "@/lib/brain";
import type { ForgeContext } from "@/lib/brain/types";
import { todayKey } from "@/lib/date-utils";

/** Default store snapshots for server-side coach generation (no Zustand). */
export const DEFAULT_SERVER_CONTEXT_SOURCE: ForgeContextSource = {
  calendarDays: {},
  workoutSessions: {},
  nextWorkoutDayId: "day-1",
  currentCycleIndex: 0,
  waterLogs: {},
  waterCurrentStreak: 0,
  waterLongestStreak: 0,
  settings: {
    profile: {
      name: "Forge user",
      age: 0,
      gender: "",
      height: "",
      currentWeight: 0,
      targetWeight: 0,
      targetWeightRange: "",
      dailyProteinGoal: 130,
      dailyWaterGoal: 3500,
      dailyStepsGoal: 10000,
      dailySleepGoal: 8,
      startDate: todayKey(),
    },
    streak: 0,
    lastActiveDate: null,
    morningRoutineItems: [],
    nightRoutineItems: [],
  },
  progress: {
    weightLogCount: 0,
    strengthLogCount: 0,
    latestWeightKg: null,
  },
};

/** Build ForgeContext on the server without reading client stores. */
export function buildDefaultServerForgeContext(): ForgeContext {
  return buildForgeContext(DEFAULT_SERVER_CONTEXT_SOURCE);
}
