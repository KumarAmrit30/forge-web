"use client";

import { useMemo } from "react";
import { useWaterStore } from "@/stores/waterStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { syncTodayFromStores } from "@/lib/sync-day";
import { syncRemindersToSW } from "@/lib/notifications";
import { todayKey } from "@/lib/date-utils";
import { HomeSurfaceCard } from "@/components/home/home-ui";
import { formatLiters } from "@/lib/journey-data";
import type { WaterEntry } from "@/types";

const QUICK_AMOUNTS = [250, 500, 750, 1000];
const EMPTY_ENTRIES: WaterEntry[] = [];

export function HydrationWorkspace() {
  const today = todayKey();
  const dailyLogs = useWaterStore((s) => s.dailyLogs);
  const goal = useSettingsStore((s) => s.profile.dailyWaterGoal);
  const addWater = useWaterStore((s) => s.addWater);

  const todayLog = useMemo(() => dailyLogs[today], [dailyLogs, today]);
  const total = todayLog?.totalMl ?? 0;
  const entries = todayLog?.entries ?? EMPTY_ENTRIES;
  const ratio = goal > 0 ? Math.min(1, total / goal) : 0;

  const handleAdd = (ml: number) => {
    addWater(ml);
    syncTodayFromStores();
    syncRemindersToSW();
  };

  return (
    <HomeSurfaceCard elevation="insight" className="px-6 py-5">
      <div className="flex items-baseline justify-between">
        <p className="text-2xl font-semibold tabular-nums text-white">
          {formatLiters(total)}
        </p>
        <p className="text-sm text-muted-foreground">
          of {formatLiters(goal)}
        </p>
      </div>

      <div className="mt-4 h-px w-full overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full bg-primary/75 transition-all duration-500 ease-out"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {QUICK_AMOUNTS.map((ml) => (
          <button
            key={ml}
            type="button"
            onClick={() => handleAdd(ml)}
            className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-2 text-xs font-medium text-foreground/90 transition-colors hover:bg-white/[0.06] active:scale-95"
          >
            +{ml >= 1000 ? "1L" : `${ml}ml`}
          </button>
        ))}
      </div>

      {entries.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-white/[0.06] pt-4">
          {[...entries].reverse().slice(0, 5).map((entry, index) => (
            <div
              key={`${entry.time}-${index}`}
              className="flex justify-between text-sm text-muted-foreground"
            >
              <span>{entry.time}</span>
              <span>+{entry.amountMl}ml</span>
            </div>
          ))}
        </div>
      )}
    </HomeSurfaceCard>
  );
}
