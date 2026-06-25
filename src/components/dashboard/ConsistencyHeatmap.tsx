"use client";

import { useMemo } from "react";
import { useCalendarStore } from "@/stores/calendarStore";
import { getHeatmapData, groupHeatmapByWeek } from "@/lib/heatmap";
import { GlassCard } from "@/components/shared/GlassCard";
import { cn } from "@/lib/utils";

const COLORS = {
  green: "bg-emerald-500/80",
  yellow: "bg-amber-500/80",
  red: "bg-red-500/60",
  empty: "bg-secondary/50",
};

export function ConsistencyHeatmap() {
  const days = useCalendarStore((s) => s.days);

  const weeks = useMemo(() => {
    const data = getHeatmapData(90);
    return groupHeatmapByWeek(data);
  }, [days]);

  return (
    <GlassCard className="space-y-3">
      <h2 className="text-lg font-semibold">Consistency</h2>
      <p className="text-xs text-muted-foreground">Last 90 days</p>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.score ?? "—"}`}
                className={cn("h-3 w-3 rounded-sm", COLORS[day.level])}
              />
            ))}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
