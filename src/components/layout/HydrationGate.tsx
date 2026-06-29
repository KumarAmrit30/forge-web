"use client";

import { useEffect, useState } from "react";
import { runSeed } from "@/lib/seed";
import { migrateRoutinesFromSettingsIfNeeded } from "@/lib/routine-sync";
import { migrateHabitsFromStorageIfNeeded } from "@/stores/habitStore";
import { syncHabitsToTodayRecord } from "@/lib/sync-habits";
import { syncGoalsFromMetrics } from "@/lib/goals-sync";
import { refreshWaterStreaks } from "@/lib/streaks";
import { syncTodayFromStores } from "@/lib/sync-day";
import { waitForForgeHydration } from "@/lib/hydration";
import { PageSkeleton } from "@/components/ui/page-skeleton";

export function HydrationGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    waitForForgeHydration().then(() => {
      if (!mounted) return;
      runSeed();
      migrateRoutinesFromSettingsIfNeeded();
      migrateHabitsFromStorageIfNeeded();
      syncHabitsToTodayRecord();
      syncGoalsFromMetrics();
      refreshWaterStreaks();
      syncTodayFromStores();
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) {
    return (
      <div aria-busy="true" aria-label="Loading Forge">
        <PageSkeleton />
      </div>
    );
  }

  return <>{children}</>;
}
