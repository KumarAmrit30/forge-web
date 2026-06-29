import { seedData } from "./data";
import { generateId } from "@/lib/id";
import { useSettingsStore } from "@/stores/settingsStore";
import { useGoalStore } from "@/stores/goalStore";
import {
  useWorkoutStore,
  createExerciseFromSeed,
} from "@/stores/workoutStore";
import { seedHabits } from "@/stores/habitStore";
import { useBlueprintStore } from "@/stores/blueprintStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { seedPeriodRoutine, useRoutineStore } from "@/stores/routineStore";
import type { Goal, HabitCategory, WorkoutDay } from "@/types";
import { LIFE_AREAS } from "@/types";

const HABIT_CATEGORIES: Record<string, HabitCategory> = {
  "Hit Protein Goal": "Fitness",
  "Drink 3.5L Water": "Health",
  "Complete Workout": "Fitness",
  "Apply Minoxidil": "Health",
  "Morning Skincare": "Health",
  "Night Skincare": "Health",
  "Sleep 8 Hours": "Health",
  "Walk 10,000 Steps": "Fitness",
};

function formatSection(title: string, items: string[]): string {
  return `## ${title}\n\n${items.map((i) => `- ${i}`).join("\n")}`;
}

export function runSeed(): void {
  const settings = useSettingsStore.getState();
  if (settings.hasSeeded) return;

  const { profile, goals, hairRoutine, skinRoutine, nutrition, breakfast, customHabits, workoutPlan, goldenRules, reminderSchedule, lifeAreas } = seedData;

  useSettingsStore.getState().setProfile(profile);

  const goalModels: Goal[] = [
    {
      id: generateId(),
      title: "Reach target weight",
      category: "Fitness",
      current: profile.currentWeight,
      target: profile.targetWeight,
      unit: "kg",
      active: true,
    },
    {
      id: generateId(),
      title: "Daily protein intake",
      category: "Health",
      current: 0,
      target: profile.dailyProteinGoal,
      unit: "g",
      active: true,
    },
    ...goals.slice(2).map((g) => ({
      id: generateId(),
      title: g,
      category: "Fitness" as const,
      current: 0,
      target: 100,
      unit: "%",
      active: true,
    })),
  ];
  useGoalStore.getState().setGoals(goalModels);

  seedHabits(
    customHabits.map((title) => ({
      title,
      category: HABIT_CATEGORIES[title] ?? "Custom",
    }))
  );

  const days: WorkoutDay[] = workoutPlan.map((d, i) => ({
    id: generateId(),
    name: d.title,
    order: i,
    isRestDay: d.title === "Rest Day" || ("isRestDay" in d && !!d.isRestDay),
    exercises: (d.exercises ?? []).map((e) =>
      createExerciseFromSeed(
        e.name,
        e.sets,
        e.reps,
        "rest" in e ? e.rest : undefined,
        e.notes
      )
    ),
  }));

  useWorkoutStore.getState().setPlan({ days });

  const bp = useBlueprintStore.getState();
  bp.setSection("goals", formatSection("Goals", goals));
  LIFE_AREAS.forEach((area) => {
    bp.setLifeArea(area, lifeAreas[area as keyof typeof lifeAreas] ?? "");
  });
  bp.setSection(
    "skincare",
    [
      "### Morning",
      ...skinRoutine.morning.map((i) => `- ${i}`),
      "",
      "### Night",
      ...skinRoutine.night.map((i) => `- ${i}`),
      "",
      "### Weekly",
      ...skinRoutine.weekly.map((w) => `- ${w.name} (${w.frequency})`),
    ].join("\n")
  );
  bp.setSection(
    "haircare",
    [
      ...hairRoutine.products.map(
        (p) =>
          `- **${p.name}** — ${p.frequency}${"timing" in p && p.timing ? ` (${p.timing})` : ""}${p.notes ? `\n  ${p.notes}` : ""}`
      ),
      "",
      "### Monthly Photos",
      ...hairRoutine.monthlyPhotos.map((p) => `- ${p}`),
    ].join("\n")
  );
  bp.setSection(
    "nutrition",
    Object.entries(nutrition)
      .map(([k, v]) => `- **${k}**: ${v}`)
      .join("\n")
  );
  bp.setSection(
    "overnightOats",
    [
      `### ${breakfast.name}`,
      "",
      "**Ingredients:**",
      ...breakfast.ingredients.map((i) => `- ${i}`),
      "",
      "**Nutrition:**",
      ...Object.entries(breakfast.nutrition).map(
        ([k, v]) => `- ${k}: ${v}`
      ),
    ].join("\n")
  );
  bp.setSection(
    "workoutPlan",
    workoutPlan
      .map((d) => `- Day ${d.day}: ${d.title}`)
      .join("\n")
  );
  bp.setSection("goldenRules", formatSection("Golden Rules", goldenRules));
  bp.setSection(
    "trackingSystem",
    "Track daily: workout, protein, water, sleep, steps, skincare, haircare. Review weekly on Sundays. Monthly checkpoint for measurements and photos."
  );

  useNotificationStore.getState().setReminders(
    reminderSchedule.water.map((time) => ({
      id: generateId(),
      time,
      enabled: true,
    }))
  );

  const morningRoutine = [
    ...skinRoutine.morning,
    ...hairRoutine.products
      .filter((p) => p.timing === "Morning")
      .map((p) => p.name),
    "Breakfast",
  ];

  const nightRoutine = [
    ...skinRoutine.night,
    ...hairRoutine.products
      .filter((p) => p.timing === "Night")
      .map((p) => p.name),
    "Sleep Goal",
  ];

  useSettingsStore.getState().setRoutineItems(morningRoutine, nightRoutine);

  seedPeriodRoutine("morning", "Morning Routine", morningRoutine);
  seedPeriodRoutine("night", "Evening Routine", nightRoutine);
  useRoutineStore.setState({ migratedFromSettings: true });

  bp.setSection("dietPlan", formatSection("Diet Plan", [
    `Calories: ${nutrition.calories}`,
    `Protein: ${nutrition.protein}g`,
    `Carbs: ${nutrition.carbs}g`,
    `Fats: ${nutrition.fats}g`,
    `Fiber: ${nutrition.fiber}g`,
    `Water: ${nutrition.water}ml daily`,
  ]));

  useSettingsStore.getState().setHasSeeded(true);
}
