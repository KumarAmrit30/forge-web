"use client";

import { useMemo } from "react";
import { useGoalStore } from "@/stores/goalStore";
import { GlassCard } from "@/components/shared/GlassCard";
import { Progress } from "@/components/ui/progress";

export function GoalProgressCard() {
  const allGoals = useGoalStore((s) => s.goals);
  const goals = useMemo(
    () => allGoals.filter((g) => g.active).slice(0, 3),
    [allGoals]
  );

  if (!goals.length) return null;

  return (
    <GlassCard className="space-y-4">
      <h2 className="text-lg font-semibold">Goal Progress</h2>
      {goals.map((g) => {
        const pct = Math.min(100, Math.round((g.current / g.target) * 100));
        return (
          <div key={g.id} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{g.title}</span>
              <span className="tabular-nums text-muted-foreground">
                {g.current}/{g.target} {g.unit}
              </span>
            </div>
            <Progress value={pct} className="h-1.5" />
          </div>
        );
      })}
    </GlassCard>
  );
}
