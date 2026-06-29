"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProgressScreen } from "@/components/progress/ProgressScreen";
import { CalendarScreen } from "@/components/calendar/CalendarScreen";
import { SegmentedControl } from "@/components/ui/segmented-control";

type AnalyticsTab = "overview" | "calendar";

export function AnalyticsScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab: AnalyticsTab =
    searchParams.get("tab") === "calendar" ? "calendar" : "overview";

  const setTab = useCallback(
    (next: AnalyticsTab) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "calendar") {
        params.set("tab", "calendar");
      } else {
        params.delete("tab");
      }
      const query = params.toString();
      router.replace(query ? `/analytics?${query}` : "/analytics");
    },
    [router, searchParams]
  );

  return (
    <div className="min-h-dvh overflow-x-hidden">
      <div className="sticky top-0 z-30 border-b border-white/[0.06] bg-background/90 px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-3 backdrop-blur-xl sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Progress overview and calendar history.
        </p>
        <SegmentedControl
          layoutId="analytics-tab"
          className="mt-4"
          options={[
            { value: "overview", label: "overview" },
            { value: "calendar", label: "calendar" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      <div className={tab === "overview" ? "block" : "hidden"}>
        <ProgressScreen />
      </div>
      <div className={tab === "calendar" ? "block" : "hidden"}>
        <CalendarScreen />
      </div>
    </div>
  );
}
