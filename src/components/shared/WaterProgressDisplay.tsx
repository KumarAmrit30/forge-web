"use client";

import { useMemo } from "react";
import { useWaterStore } from "@/stores/waterStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { todayKey } from "@/lib/date-utils";
import { GlassCard } from "@/components/shared/GlassCard";
import { Progress } from "@/components/ui/progress";
import { Droplets, Flame } from "lucide-react";

export function WaterProgressDisplay({
  showStreak = true,
}: {
  showStreak?: boolean;
}) {
  const today = todayKey();
  const dailyLogs = useWaterStore((s) => s.dailyLogs);
  const goal = useSettingsStore((s) => s.profile.dailyWaterGoal);
  const currentStreak = useWaterStore((s) => s.currentStreak);
  const longestStreak = useWaterStore((s) => s.longestStreak);

  const total = useMemo(
    () => dailyLogs[today]?.totalMl ?? 0,
    [dailyLogs, today]
  );
  const pct = Math.min(100, Math.round((total / goal) * 100));

  return (
    <GlassCard className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-medium">Hydration</span>
        </div>
        <span className="text-sm tabular-nums text-muted-foreground">
          {(total / 1000).toFixed(1)}L / {(goal / 1000).toFixed(1)}L
        </span>
      </div>
      <Progress value={pct} className="h-2" />
      {showStreak && (currentStreak > 0 || longestStreak > 0) && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Flame className="h-3.5 w-3.5 text-amber-500" />
          <span>
            {currentStreak} day streak · best {longestStreak}
          </span>
        </div>
      )}
    </GlassCard>
  );
}
