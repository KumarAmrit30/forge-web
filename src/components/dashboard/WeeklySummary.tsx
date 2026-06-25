"use client";

import { useMemo } from "react";
import { useCalendarStore } from "@/stores/calendarStore";
import { useProgressStore } from "@/stores/progressStore";
import { generateInsights } from "@/lib/insights";
import { GlassCard } from "@/components/shared/GlassCard";
import { Sparkles } from "lucide-react";
import { isSundayToday } from "@/lib/date-utils";

type Props = {
  onOpenReview?: () => void;
};

export function WeeklySummary({ onOpenReview }: Props) {
  const calendarDays = useCalendarStore((s) => s.days);
  const weightLogs = useProgressStore((s) => s.weightLogs);

  const insights = useMemo(
    () => generateInsights(),
    [calendarDays, weightLogs]
  );

  return (
    <GlassCard className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-emerald-500" />
        <h2 className="text-lg font-semibold">Insights</h2>
      </div>
      {insights.length ? (
        <ul className="space-y-2">
          {insights.map((insight, i) => (
            <li key={i} className="text-sm text-muted-foreground">
              {insight}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          Keep logging — insights appear as patterns emerge.
        </p>
      )}
      {isSundayToday() && onOpenReview && (
        <button
          onClick={onOpenReview}
          className="text-sm font-medium text-emerald-500 hover:underline"
        >
          Complete Weekly Review →
        </button>
      )}
    </GlassCard>
  );
}
