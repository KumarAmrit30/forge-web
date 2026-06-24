"use client";

import { useMemo } from "react";
import { useWeeklyReviewStore } from "@/stores/weeklyReviewStore";
import { GlassCard } from "@/components/shared/GlassCard";
import { formatDate } from "@/lib/date-utils";

export function ReviewHistory() {
  const allReviews = useWeeklyReviewStore((s) => s.reviews);
  const reviews = useMemo(
    () => [...allReviews].sort((a, b) => b.weekStart.localeCompare(a.weekStart)),
    [allReviews]
  );

  if (!reviews.length) {
    return (
      <GlassCard>
        <p className="text-sm text-muted-foreground">No weekly reviews yet.</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <GlassCard key={r.id} className="space-y-2">
          <p className="text-sm font-medium">
            Week of {formatDate(r.weekStart, "MMM d, yyyy")}
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <span>Workout {r.workoutCompletionPct}%</span>
            <span>Water {r.waterCompletionPct}%</span>
            <span>Protein {r.proteinCompletionPct}%</span>
          </div>
          {r.wentWell && (
            <p className="text-sm"><span className="text-muted-foreground">✓ </span>{r.wentWell}</p>
          )}
        </GlassCard>
      ))}
    </div>
  );
}
