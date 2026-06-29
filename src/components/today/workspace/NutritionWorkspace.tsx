"use client";

import { useMemo, useCallback } from "react";
import { updateTodayRecord, getOrCreateTodayRecord } from "@/lib/sync-day";
import { useCalendarStore } from "@/stores/calendarStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { todayKey } from "@/lib/date-utils";
import { HomeSurfaceCard } from "@/components/home/home-ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HabitsPanel } from "@/components/today/workspace/HabitsPanel";

export function NutritionWorkspace() {
  const todayDate = todayKey();
  const calendarDay = useCalendarStore((s) => s.days[todayDate]);
  const proteinGoal = useSettingsStore((s) => s.profile.dailyProteinGoal);

  const record = useMemo(
    () => calendarDay ?? getOrCreateTodayRecord(),
    [calendarDay]
  );

  const saveProtein = useCallback((val: number) => {
    updateTodayRecord({ proteinG: val });
  }, []);

  return (
    <div className="space-y-4">
      <HomeSurfaceCard elevation="insight" className="space-y-4 px-6 py-5">
        <div>
          <Label className="text-xs text-muted-foreground">
            Protein logged today
          </Label>
          <Input
            type="number"
            value={record.proteinG || ""}
            onChange={(e) =>
              saveProtein(parseInt(e.target.value, 10) || 0)
            }
            className="mt-2"
          />
          <p className="mt-2 text-sm text-muted-foreground">
            Goal: {proteinGoal}g
          </p>
        </div>
      </HomeSurfaceCard>
      <HabitsPanel />
    </div>
  );
}
