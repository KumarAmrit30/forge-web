import { beforeEach } from "vitest";
import { clearExecutionHistory } from "@/lib/execution/execution-history";
import { hydrateCalendar } from "@/stores/calendarStore";
import { hydrateSettings } from "@/stores/settingsStore";
import { hydrateWorkout } from "@/stores/workoutStore";

const defaultSettings = {
  hasSeeded: true,
  profile: {
    name: "Test User",
    age: 30,
    gender: "Male",
    height: "5'10\"",
    currentWeight: 80,
    targetWeight: 75,
    targetWeightRange: "73-75 kg",
    dailyProteinGoal: 130,
    dailyWaterGoal: 3500,
    dailyStepsGoal: 10000,
    dailySleepGoal: 8,
    startDate: "2026-06-01",
  },
  streak: 0,
  lastActiveDate: null,
  morningRoutineItems: ["Stretch", "Water"],
  nightRoutineItems: ["Journal"],
};

const defaultWorkout = {
  plan: {
    days: [
      { id: "day-a", name: "Push", order: 0, exercises: [] },
      { id: "day-b", name: "Pull", order: 1, exercises: [] },
      { id: "day-c", name: "Legs", order: 2, exercises: [] },
    ],
  },
  cycle: { currentIndex: 0, nextWorkoutDayId: "day-a" },
  sessions: {},
};

beforeEach(() => {
  localStorage.clear();
  clearExecutionHistory();
  hydrateSettings(defaultSettings);
  hydrateWorkout(defaultWorkout);
  hydrateCalendar({ days: {} });
});

export { defaultSettings, defaultWorkout };
