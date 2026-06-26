"use client";

import { useMemo, useCallback } from "react";
import { updateTodayRecord, getOrCreateTodayRecord } from "@/lib/sync-day";
import { useCalendarStore } from "@/stores/calendarStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { todayKey } from "@/lib/date-utils";
import { HomeSurfaceCard } from "@/components/home/home-ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SleepWorkspace() {
  const todayDate = todayKey();
  const calendarDay = useCalendarStore((s) => s.days[todayDate]);
  const sleepGoal = useSettingsStore((s) => s.profile.dailySleepGoal);

  const record = useMemo(
    () => calendarDay ?? getOrCreateTodayRecord(),
    [calendarDay]
  );

  const saveSleep = useCallback((val: number) => {
    updateTodayRecord({ sleepHours: val });
  }, []);

  return (
    <HomeSurfaceCard elevation="insight" className="space-y-4 px-6 py-5">
      <div>
        <Label className="text-xs text-muted-foreground">
          Hours slept last night
        </Label>
        <Input
          type="number"
          step="0.5"
          value={record.sleepHours || ""}
          onChange={(e) =>
            saveSleep(parseFloat(e.target.value) || 0)
          }
          className="mt-2"
        />
        <p className="mt-2 text-sm text-muted-foreground">
          Target: {sleepGoal} hours
        </p>
      </div>
    </HomeSurfaceCard>
  );
}
