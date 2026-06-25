"use client";

import { useMemo } from "react";
import { useWorkoutStore } from "@/stores/workoutStore";
import { useProgressStore } from "@/stores/progressStore";
import { updateTodayRecord } from "@/lib/sync-day";
import { todayKey } from "@/lib/date-utils";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkoutSession, SetLog, StrengthLog } from "@/types";

const LIFT_MAP: Record<string, StrengthLog["exercise"]> = {
  "Barbell Bench Press": "bench",
  "Deadlift / Rack Pull": "deadlift",
  "Overhead Press": "ohp",
};

export function WorkoutSessionPanel() {
  const date = todayKey();
  const plan = useWorkoutStore((s) => s.plan);
  const currentIndex = useWorkoutStore((s) => s.cycle.currentIndex);
  const sessions = useWorkoutStore((s) => s.sessions);
  const updateSession = useWorkoutStore((s) => s.updateSession);
  const completeWorkout = useWorkoutStore((s) => s.completeWorkout);

  const nextDay = useMemo(
    () => plan.days[currentIndex] ?? null,
    [plan, currentIndex]
  );
  const session = sessions[date];

  if (!nextDay) {
    return (
      <GlassCard>
        <p className="text-sm text-muted-foreground">No workout plan configured.</p>
      </GlassCard>
    );
  }

  if (nextDay.isRestDay) {
    return (
      <GlassCard className="text-center">
        <Dumbbell className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
        <h3 className="font-semibold">Rest Day</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Recovery is part of progress.
        </p>
        <Button
          className="mt-4"
          variant="secondary"
          onClick={() => {
            const restSession: WorkoutSession = {
              dayId: nextDay.id,
              date: todayKey(),
              exercises: [],
              completed: true,
            };
            completeWorkout(restSession);
            updateTodayRecord({ workoutCompletion: restSession });
          }}
        >
          Mark Rest Complete
        </Button>
      </GlassCard>
    );
  }

  const currentSession: WorkoutSession = session ?? {
    dayId: nextDay.id,
    date: todayKey(),
    exercises: nextDay.exercises.map((ex) => ({
      exerciseId: ex.id,
      sets: Array.from({ length: ex.targetSets }, () => ({
        reps: 0,
        weightKg: undefined,
        completed: false,
      })),
    })),
    completed: false,
  };

  const toggleSet = (exIdx: number, setIdx: number) => {
    const updated = structuredClone(currentSession);
    const set = updated.exercises[exIdx].sets[setIdx];
    set.completed = !set.completed;
    updateSession(updated);
    updateTodayRecord({ workoutCompletion: updated });
  };

  const updateSet = (
    exIdx: number,
    setIdx: number,
    field: "reps" | "weightKg",
    val: number
  ) => {
    const updated = structuredClone(currentSession);
    updated.exercises[exIdx].sets[setIdx][field] = val;
    updateSession(updated);
    updateTodayRecord({ workoutCompletion: updated });
  };

  const finishWorkout = () => {
    const completed = { ...currentSession, completed: true };
    completeWorkout(completed);
    updateTodayRecord({ workoutCompletion: completed });

    nextDay.exercises.forEach((ex, exIdx) => {
      const lift = LIFT_MAP[ex.name];
      if (!lift) return;
      const sets = completed.exercises[exIdx]?.sets ?? [];
      const best = sets
        .filter((s) => s.completed && s.weightKg)
        .sort((a, b) => (b.weightKg ?? 0) - (a.weightKg ?? 0))[0];
      if (best?.weightKg) {
        useProgressStore.getState().logStrength({
          date: todayKey(),
          exercise: lift,
          weightKg: best.weightKg,
          reps: best.reps,
        });
      }
    });
  };

  const allDone = currentSession.exercises.every((ex) =>
    ex.sets.every((s: SetLog) => s.completed)
  );

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center gap-2">
        <Dumbbell className="h-5 w-5 text-emerald-500" />
        <div>
          <h3 className="font-semibold">{nextDay.name}</h3>
          <p className="text-xs text-muted-foreground">
            {nextDay.exercises.length} exercises
          </p>
        </div>
      </div>

      {nextDay.exercises.map((ex, exIdx) => (
        <div key={ex.id} className="space-y-2 border-t border-border/50 pt-3">
          <p className="text-sm font-medium">{ex.name}</p>
          {ex.notes && (
            <p className="text-xs text-muted-foreground">{ex.notes}</p>
          )}
          {currentSession.exercises[exIdx]?.sets.map((set, setIdx) => (
            <div key={setIdx} className="flex items-center gap-2">
              <button
                onClick={() => toggleSet(exIdx, setIdx)}
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2",
                  set.completed
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-muted-foreground/30"
                )}
              >
                {set.completed && <Check className="h-3.5 w-3.5 text-white" />}
              </button>
              <span className="w-8 text-xs text-muted-foreground">
                S{setIdx + 1}
              </span>
              <Input
                type="number"
                placeholder="kg"
                className="h-8 w-16 text-xs"
                value={set.weightKg ?? ""}
                onChange={(e) =>
                  updateSet(exIdx, setIdx, "weightKg", parseFloat(e.target.value) || 0)
                }
              />
              <Input
                type="number"
                placeholder="reps"
                className="h-8 w-16 text-xs"
                value={set.reps || ""}
                onChange={(e) =>
                  updateSet(exIdx, setIdx, "reps", parseInt(e.target.value, 10) || 0)
                }
              />
              <span className="text-xs text-muted-foreground">
                × {ex.targetReps}
              </span>
            </div>
          ))}
        </div>
      ))}

      <Button
        className="w-full"
        disabled={!allDone}
        onClick={finishWorkout}
      >
        Complete Workout
      </Button>
    </GlassCard>
  );
}
