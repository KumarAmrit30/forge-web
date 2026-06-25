"use client";

import { useMemo } from "react";
import { useWorkoutStore } from "@/stores/workoutStore";
import { GlassCard } from "@/components/shared/GlassCard";
import { Dumbbell } from "lucide-react";

export function NextWorkoutCard() {
  const plan = useWorkoutStore((s) => s.plan);
  const currentIndex = useWorkoutStore((s) => s.cycle.currentIndex);

  const nextDay = useMemo(
    () => plan.days[currentIndex] ?? null,
    [plan, currentIndex]
  );

  if (!nextDay) return null;

  return (
    <GlassCard className="flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
        <Dumbbell className="h-6 w-6 text-emerald-500" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Next Workout</p>
        <p className="font-semibold">{nextDay.name}</p>
        {nextDay.isRestDay ? (
          <p className="text-xs text-muted-foreground">Recovery day</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {nextDay.exercises.length} exercises
          </p>
        )}
      </div>
    </GlassCard>
  );
}
