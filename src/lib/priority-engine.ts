import type { Priority, PriorityRank, DayRecord, TodaySection } from "@/types";
import { useSettingsStore } from "@/stores/settingsStore";
import { useWorkoutStore } from "@/stores/workoutStore";
import { getTodayRecord } from "@/lib/scoring";

type Candidate = {
  label: string;
  impactScore: number;
  category: string;
  actionType: string;
  section: TodaySection;
};

const RANKS: PriorityRank[] = ["P1", "P2", "P3", "P4", "P5"];

export function generatePriorities(record?: Partial<DayRecord>): Priority[] {
  const r = record ?? getTodayRecord();
  const profile = useSettingsStore.getState().profile;
  const plan = useWorkoutStore.getState().plan;
  const cycle = useWorkoutStore.getState().cycle;
  const nextWorkout = plan.days[cycle.currentIndex] ?? null;
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
      section: "workout",
    });
  }

  const proteinGap = profile.dailyProteinGoal - (r.proteinG ?? 0);
  if (proteinGap > 0) {
    candidates.push({
      label: `${Math.round(proteinGap)}g protein remaining`,
      impactScore: 80 * (proteinGap / profile.dailyProteinGoal),
      category: "Nutrition",
      actionType: "protein",
      section: "nutrition",
    });
  }

  const waterGap = profile.dailyWaterGoal - (r.waterMl ?? 0);
  if (waterGap > 0) {
    const liters = (waterGap / 1000).toFixed(1);
    candidates.push({
      label: `Drink ${liters}L water`,
      impactScore: 70 * (waterGap / profile.dailyWaterGoal),
      category: "Health",
      actionType: "water",
      section: "water",
    });
  }

  const minoxidilKey = Object.keys(r.nightChecklist ?? {}).find((k) =>
    k.toLowerCase().includes("minoxidil")
  );
  const minoxidilDone = minoxidilKey
    ? r.nightChecklist?.[minoxidilKey]
    : true;
  if (!minoxidilDone) {
    let impact = 60;
    if (hour >= 20) impact += 30;
    candidates.push({
      label: "Apply Minoxidil tonight",
      impactScore: impact,
      category: "Haircare",
      actionType: "minoxidil",
      section: "night",
    });
  }

  const sleepDone = (r.sleepHours ?? 0) >= profile.dailySleepGoal;
  if (!sleepDone) {
    let impact = 50;
    if (hour >= 22) impact += 40;
    candidates.push({
      label: "Log sleep goal",
      impactScore: impact,
      category: "Health",
      actionType: "sleep",
      section: "sleep",
    });
  }

  const morningItems = r.morningChecklist ?? {};
  const morningPending = Object.entries(morningItems).filter(([, v]) => !v);
  if (morningPending.length > 0 && hour < 12) {
    candidates.push({
      label: `Morning routine (${morningPending.length} left)`,
      impactScore: 40,
      category: "Skincare",
      actionType: "skincare",
      section: "morning",
    });
  }

  const stepsGap = profile.dailyStepsGoal - (r.steps ?? 0);
  if (stepsGap > 0) {
    candidates.push({
      label: `${stepsGap.toLocaleString()} steps remaining`,
      impactScore: 30 * (stepsGap / profile.dailyStepsGoal),
      category: "Fitness",
      actionType: "steps",
      section: "nutrition",
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
      section: c.section,
    }));
}

export function todaySectionHref(section: TodaySection): string {
  return `/today#${section}`;
}
