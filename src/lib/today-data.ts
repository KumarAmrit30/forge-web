import {
  annotateJourneyStatus,
  buildDailyJourney,
  countCompletedSteps,
  estimateWorkoutDurationMinutes,
  formatLiters,
  formatWaterProgress,
  getCurrentJourneyStep,
  getMealLabel,
  getNextJourneyStep,
  journeyIllustration,
  shortWorkoutTitle,
  workoutSubtitle,
  type DailyJourneyStep,
  type JourneyInput,
  type JourneyStepId,
  type JourneyStepWithStatus,
} from "@/lib/journey-data";

export type ActivityQuickAction = {
  label: string;
  amountMl?: number;
};

export type ActivityPreviewItem = {
  kind: "item" | "more";
  label: string;
};

/** Presentation model for the generic Today Focus Card. */
export type TodayActivityPresentation = {
  stepId: JourneyStepId;
  title: string;
  subtitle?: string;
  illustration: string;
  progress?: string;
  duration?: string;
  preview: ActivityPreviewItem[];
  ctaLabel: string;
  quickActions?: ActivityQuickAction[];
};

export type TodayNextPreview = {
  title: string;
  supportingLine: string;
  illustration: string;
};

export type TodayScreenModel = {
  journey: JourneyStepWithStatus[];
  current: DailyJourneyStep | null;
  next: DailyJourneyStep | null;
  focus: TodayActivityPresentation | null;
  nextPreview: TodayNextPreview | null;
  insight: string;
  completedCount: number;
  totalCount: number;
};

function buildChecklistPreview(
  checklist: Record<string, boolean>
): ActivityPreviewItem[] {
  const pending = Object.entries(checklist)
    .filter(([, done]) => !done)
    .map(([key]) => key);

  const preview: ActivityPreviewItem[] = pending.slice(0, 2).map((label) => ({
    kind: "item" as const,
    label,
  }));

  if (pending.length > 2) {
    preview.push({
      kind: "more",
      label: `+${pending.length - 2} more`,
    });
  }

  return preview;
}

function getNextExerciseName(input: JourneyInput): string | null {
  const { record, nextDay, isRestDay } = input;
  if (isRestDay || !nextDay) return null;

  const session = record.workoutCompletion;
  const total = nextDay.exercises.length;
  if (!total) return null;

  if (!session || session.completed) {
    return nextDay.exercises[0]?.name ?? null;
  }

  const completedCount = session.exercises.filter((ex) =>
    ex.sets.every((s) => s.completed)
  ).length;
  const index = Math.min(completedCount, total - 1);
  return nextDay.exercises[index]?.name ?? null;
}

function workoutExerciseProgress(input: JourneyInput): string | undefined {
  const { record, nextDay, isRestDay } = input;
  if (isRestDay || !nextDay) return undefined;

  const total = nextDay.exercises.length;
  const session = record.workoutCompletion;
  if (!session || session.completed) {
    return total > 0 ? `Exercise 1 of ${total}` : undefined;
  }

  const completedExercises = session.exercises.filter((ex) =>
    ex.sets.every((s) => s.completed)
  ).length;
  const current = Math.min(completedExercises + 1, total);
  return `Exercise ${current} of ${total}`;
}

export function buildActivityPresentation(
  step: DailyJourneyStep,
  input: JourneyInput
): TodayActivityPresentation {
  const { record, profile, nextDay, isRestDay, waterMl } = input;
  const illustration = journeyIllustration(step.id, isRestDay);

  switch (step.id) {
    case "morning": {
      const pending = Object.values(record.morningChecklist).filter(
        (v) => !v
      ).length;
      return {
        stepId: step.id,
        title: "Morning Routine",
        subtitle: pending > 0 ? `${pending} steps remaining` : "Almost done",
        illustration,
        preview: buildChecklistPreview(record.morningChecklist),
        ctaLabel: "Continue Routine",
      };
    }

    case "workout": {
      if (isRestDay || !nextDay) {
        return {
          stepId: step.id,
          title: "Recovery",
          subtitle: "Mobility & Stretching",
          illustration,
          duration: "30 min",
          preview: [
            { kind: "item", label: "Light mobility work" },
            { kind: "item", label: "Gentle stretching" },
          ],
          ctaLabel: "Begin Recovery",
        };
      }

      const total = nextDay.exercises.length;
      const nextExercise = getNextExerciseName(input);

      return {
        stepId: step.id,
        title: shortWorkoutTitle(nextDay.name),
        subtitle: workoutSubtitle(nextDay.name) || "Strength session",
        illustration,
        progress: workoutExerciseProgress(input),
        duration: `${estimateWorkoutDurationMinutes(total, false)} min`,
        preview: [
          ...(nextExercise
            ? [{ kind: "item" as const, label: nextExercise }]
            : []),
          { kind: "item", label: `${total} exercises total` },
        ],
        ctaLabel: record.workoutCompletion?.completed
          ? "Review Workout"
          : "Continue Workout",
      };
    }

    case "hydration": {
      const remaining = Math.max(0, profile.dailyWaterGoal - waterMl);
      return {
        stepId: step.id,
        title: "Hydration",
        subtitle: formatWaterProgress(waterMl, profile.dailyWaterGoal),
        illustration,
        preview: [
          { kind: "item", label: `${formatLiters(waterMl)} logged today` },
          {
            kind: "item",
            label:
              remaining > 0
                ? `${formatLiters(remaining)} remaining`
                : "Goal reached",
          },
        ],
        ctaLabel: "Log Water",
        quickActions: [
          { label: "+250ml", amountMl: 250 },
          { label: "+500ml", amountMl: 500 },
        ],
      };
    }

    case "nutrition": {
      const proteinGap = Math.max(
        0,
        profile.dailyProteinGoal - (record.proteinG ?? 0)
      );
      return {
        stepId: step.id,
        title: getMealLabel(),
        subtitle: `${record.proteinG ?? 0}g / ${profile.dailyProteinGoal}g protein`,
        illustration,
        preview: [
          { kind: "item", label: `Next: ${getMealLabel()}` },
          {
            kind: "item",
            label:
              proteinGap > 0
                ? `${Math.round(proteinGap)}g protein remaining`
                : "Protein goal met",
          },
        ],
        ctaLabel: "Log Meal",
      };
    }

    case "reflection": {
      const pendingItems = Object.entries(record.nightChecklist).filter(
        ([, done]) => !done
      );
      const preview: ActivityPreviewItem[] = [
        { kind: "item", label: "What went well today?" },
      ];
      if (pendingItems[0]) {
        preview.push({ kind: "item", label: pendingItems[0][0] });
      }
      if (pendingItems.length > 1) {
        preview.push({
          kind: "more",
          label: `+${pendingItems.length - 1} more`,
        });
      }

      return {
        stepId: step.id,
        title: "Evening Reflection",
        subtitle: "Close the day with clarity",
        illustration,
        preview,
        ctaLabel: "Start Reflection",
      };
    }

    case "sleep":
      return {
        stepId: step.id,
        title: "Sleep",
        subtitle: `${profile.dailySleepGoal} hour target`,
        illustration,
        preview: [
          { kind: "item", label: "Begin your wind-down routine" },
          {
            kind: "item",
            label: `Aim for ${profile.dailySleepGoal} hours of rest`,
          },
        ],
        ctaLabel: "Begin Wind Down",
      };
  }
}

export function buildNextPreview(
  next: DailyJourneyStep | null,
  current: DailyJourneyStep | null,
  input: JourneyInput
): TodayNextPreview | null {
  if (!next) return null;

  return {
    title: nextActivityTitle(next.id, input),
    supportingLine: nextSupportingLine(next.id, current?.id ?? null, input),
    illustration: journeyIllustration(next.id, input.isRestDay),
  };
}

function nextActivityTitle(
  id: JourneyStepId,
  input: JourneyInput
): string {
  const { nextDay, isRestDay } = input;

  switch (id) {
    case "morning":
      return "Morning Routine";
    case "workout":
      return isRestDay || !nextDay
        ? "Recovery"
        : shortWorkoutTitle(nextDay.name);
    case "hydration":
      return "Hydration";
    case "nutrition":
      return getMealLabel();
    case "reflection":
      return "Evening Reflection";
    case "sleep":
      return "Sleep";
  }
}

function nextSupportingLine(
  nextId: JourneyStepId,
  currentId: JourneyStepId | null,
  input: JourneyInput
): string {
  const { nextDay, isRestDay, profile, waterMl } = input;

  switch (nextId) {
    case "morning":
      return "Starts your day";
    case "workout": {
      if (isRestDay || !nextDay) {
        return "Mobility & stretching";
      }
      const mins = estimateWorkoutDurationMinutes(
        nextDay.exercises.length,
        false
      );
      if (currentId === "morning") {
        return `Starts after Morning Routine · ${mins} min session`;
      }
      return `${mins} minute session`;
    }
    case "hydration": {
      if (currentId === "workout") {
        const remaining = Math.max(0, profile.dailyWaterGoal - waterMl);
        const suggest = Math.min(500, remaining);
        if (suggest > 0) {
          return `Drink another ${suggest} ml after workout`;
        }
      }
      if (currentId === "morning") {
        return "Starts after Morning Routine";
      }
      return "Keep sipping through the day";
    }
    case "nutrition": {
      const gap = profile.dailyProteinGoal - (input.record.proteinG ?? 0);
      if (gap > 0) {
        return `${Math.round(gap)}g protein still to go`;
      }
      return "Log your next meal";
    }
    case "reflection":
      return "Tonight around 8 PM";
    case "sleep":
      return "Wind down when the day is done";
  }
}

export function buildContextualInsight(
  current: DailyJourneyStep | null,
  input: JourneyInput,
  streak: number
): string {
  if (!current) {
    return "Every moment today is complete. Rest well.";
  }

  const { record, profile, isRestDay, nextDay } = input;

  switch (current.id) {
    case "morning":
      return "Completing skincare first usually helps you finish your full routine.";

    case "workout":
      if (isRestDay) {
        return "Recovery is when your body adapts and grows stronger.";
      }
      return "You normally perform better after your warm-up.";

    case "hydration":
      return "You usually drink less water after 3 PM.";

    case "nutrition":
      return "You consistently reach your protein goal after lunch.";

    case "reflection":
      if (streak >= 6) {
        return "You've completed your reflection 6 evenings in a row.";
      }
      return "Evening reflection helps tomorrow start with clarity.";

    case "sleep": {
      const workoutDone =
        isRestDay || Boolean(record.workoutCompletion?.completed);
      if (workoutDone && !nextDay?.isRestDay) {
        return "Gym days usually improve your sleep duration.";
      }
      if ((record.sleepHours ?? 0) < profile.dailySleepGoal) {
        return "Consistent sleep is your quietest competitive advantage.";
      }
      return "Wind down early — sleep is part of the work.";
    }
  }
}

export function buildTodayScreenModel(
  input: JourneyInput,
  streak: number
): TodayScreenModel {
  const steps = buildDailyJourney(input);
  const journey = annotateJourneyStatus(steps);
  const current = getCurrentJourneyStep(steps);
  const next = getNextJourneyStep(steps, current);

  return {
    journey,
    current,
    next,
    focus: current ? buildActivityPresentation(current, input) : null,
    nextPreview: buildNextPreview(next, current, input),
    insight: buildContextualInsight(current, input, streak),
    completedCount: countCompletedSteps(steps),
    totalCount: steps.length,
  };
}
