"use client";

import { useEffect, useState } from "react";
import { runSeed } from "@/lib/seed";
import { syncGoalsFromMetrics } from "@/lib/goals-sync";
import { refreshWaterStreaks } from "@/lib/streaks";
import { syncTodayFromStores } from "@/lib/sync-day";
import { waitForForgeHydration } from "@/lib/hydration";
import { Loader2 } from "lucide-react";

export function HydrationGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    waitForForgeHydration().then(() => {
      if (!mounted) return;
      runSeed();
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="text-sm text-muted-foreground">Loading Forge…</p>
      </div>
    );
  }

  return <>{children}</>;
}
