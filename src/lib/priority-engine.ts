import type { Priority, PriorityRank, DayRecord } from "@/types";
import { useSettingsStore } from "@/stores/settingsStore";
import { useWorkoutStore } from "@/stores/workoutStore";
import { getTodayRecord } from "@/lib/scoring";

type Candidate = {
  label: string;
  impactScore: number;
  category: string;
  actionType: string;
};

const RANKS: PriorityRank[] = ["P1", "P2", "P3", "P4", "P5"];

export function generatePriorities(record?: Partial<DayRecord>): Priority[] {
  const r = record ?? getTodayRecord();
  const profile = useSettingsStore.getState().profile;
  const nextWorkout = useWorkoutStore.getState().getNextWorkout();
  const hour = new Date().getHours();
  const candidates: Candidate[] = [];

  if (nextWorkout && !nextWorkout.isRestDay && !r.workoutCompletion?.completed) {
    let impact = 100;
    if (hour >= 14) impact += 20;
    candidates.push({
      label: `Complete ${nextWorkout.name}`,
      impactScore: impact,
      category: "Fitness",
      actionType: "workout",
    });
  }

  const proteinGap = profile.dailyProteinGoal - (r.proteinG ?? 0);
  if (proteinGap > 0) {
    candidates.push({
      label: `${Math.round(proteinGap)}g Protein Remaining`,
      impactScore: 80 * (proteinGap / profile.dailyProteinGoal),
      category: "Nutrition",
      actionType: "protein",
    });
  }

  const waterGap = profile.dailyWaterGoal - (r.waterMl ?? 0);
  if (waterGap > 0) {
    const liters = (waterGap / 1000).toFixed(1);
    candidates.push({
      label: `Drink ${liters}L Water`,
      impactScore: 70 * (waterGap / profile.dailyWaterGoal),
      category: "Health",
      actionType: "water",
    });
  }

  const minoxidilDone = r.nightChecklist?.["Apply Minoxidil"];
  if (!minoxidilDone) {
    let impact = 60;
    if (hour >= 20) impact += 30;
    candidates.push({
      label: "Apply Minoxidil Tonight",
      impactScore: impact,
      category: "Haircare",
      actionType: "minoxidil",
    });
  }

  const sleepDone = (r.sleepHours ?? 0) >= profile.dailySleepGoal;
  if (!sleepDone) {
    let impact = 50;
    if (hour >= 22) impact += 40;
    candidates.push({
      label: "Sleep Before 11 PM",
      impactScore: impact,
      category: "Health",
      actionType: "sleep",
    });
  }

  const morningItems = r.morningChecklist ?? {};
  const morningPending = Object.entries(morningItems).filter(([, v]) => !v);
  if (morningPending.length > 0 && hour < 12) {
    candidates.push({
      label: `Complete Morning Skincare (${morningPending.length} left)`,
      impactScore: 40,
      category: "Skincare",
      actionType: "skincare",
    });
  }

  const stepsGap = profile.dailyStepsGoal - (r.steps ?? 0);
  if (stepsGap > 0) {
    candidates.push({
      label: `${stepsGap.toLocaleString()} Steps Remaining`,
      impactScore: 30 * (stepsGap / profile.dailyStepsGoal),
      category: "Fitness",
      actionType: "steps",
    });
  }

  return candidates
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, 5)
    .map((c, i) => ({
      rank: RANKS[i],
      label: c.label,
      impactScore: c.impactScore,
      category: c.category,
      actionType: c.actionType,
    }));
}
