"use client";

import { useWaterStore } from "@/stores/waterStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { syncTodayFromStores } from "@/lib/sync-day";
import { syncRemindersToSW } from "@/lib/notifications";
import { GlassCard } from "@/components/shared/GlassCard";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Droplets } from "lucide-react";
import { todayKey } from "@/lib/date-utils";
import type { WaterEntry } from "@/types";

const QUICK_AMOUNTS = [250, 500, 750, 1000];
const EMPTY_ENTRIES: WaterEntry[] = [];

type Props = {
  compact?: boolean;
  showTimeline?: boolean;
};

export function WaterWidget({ compact, showTimeline = true }: Props) {
  const today = todayKey();
  const todayLog = useWaterStore((s) => s.dailyLogs[today]);
  const total = todayLog?.totalMl ?? 0;
  const entries = todayLog?.entries ?? EMPTY_ENTRIES;
  const goal = useSettingsStore((s) => s.profile.dailyWaterGoal);
  const addWater = useWaterStore((s) => s.addWater);

  const pct = Math.min(100, Math.round((total / goal) * 100));
  const remaining = Math.max(0, goal - total);

  const handleAdd = (ml: number) => {
    addWater(ml);
    syncTodayFromStores();
    syncRemindersToSW();
  };

  if (compact) {
    return (
      <GlassCard className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium">Water</span>
          </div>
          <span className="text-sm tabular-nums text-muted-foreground">
            {(total / 1000).toFixed(1)}L / {(goal / 1000).toFixed(1)}L
          </span>
        </div>
        <Progress value={pct} className="h-2" />
        <Button
          size="sm"
          variant="secondary"
          className="w-full"
          onClick={() => handleAdd(250)}
        >
          +250ml
        </Button>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center gap-2">
        <Droplets className="h-5 w-5 text-emerald-500" />
        <h3 className="font-semibold">Water</h3>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-2xl font-bold tabular-nums">
            {(total / 1000).toFixed(1)}L
          </p>
          <p className="text-xs text-muted-foreground">Current</p>
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums">
            {(remaining / 1000).toFixed(1)}L
          </p>
          <p className="text-xs text-muted-foreground">Remaining</p>
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums">{pct}%</p>
          <p className="text-xs text-muted-foreground">Complete</p>
        </div>
      </div>

      <Progress value={pct} className="h-2" />

      <div className="grid grid-cols-4 gap-2">
        {QUICK_AMOUNTS.map((ml) => (
          <Button
            key={ml}
            variant="secondary"
            size="sm"
            onClick={() => handleAdd(ml)}
          >
            +{ml >= 1000 ? "1L" : `${ml}ml`}
          </Button>
        ))}
      </div>

      {showTimeline && entries.length > 0 && (
        <div className="space-y-2 border-t border-border/50 pt-3">
          <p className="text-xs font-medium text-muted-foreground">Timeline</p>
          {[...entries].reverse().map((e, i) => (
            <div
              key={i}
              className="flex justify-between text-sm text-muted-foreground"
            >
              <span>{e.time}</span>
              <span>+{e.amountMl}ml</span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
