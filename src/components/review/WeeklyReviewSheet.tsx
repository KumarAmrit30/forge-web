"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useWeeklyReviewStore } from "@/stores/weeklyReviewStore";
import { computeWeeklyMetrics } from "@/lib/weekly-review";
import { generateInsights } from "@/lib/insights";
import { getWeekStart } from "@/lib/date-utils";
import { generateId } from "@/lib/id";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function WeeklyReviewSheet({ open, onOpenChange }: Props) {
  const weekStart = getWeekStart();
  const metrics = computeWeeklyMetrics(weekStart);
  const addReview = useWeeklyReviewStore((s) => s.addReview);

  const [wentWell, setWentWell] = useState("");
  const [didntGoWell, setDidntGoWell] = useState("");
  const [improve, setImprove] = useState("");

  const save = () => {
    addReview({
      id: generateId(),
      weekStart,
      wentWell,
      didntGoWell,
      improveNextWeek: improve,
      currentWeight: metrics.currentWeight,
      avgSleep: metrics.avgSleep,
      workoutCompletionPct: metrics.workoutCompletionPct,
      waterCompletionPct: metrics.waterCompletionPct,
      proteinCompletionPct: metrics.proteinCompletionPct,
      habitCompletionPct: metrics.habitCompletionPct,
      insights: generateInsights(),
      completedAt: new Date().toISOString(),
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Weekly Review</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-secondary/50 p-3">
              <p className="text-muted-foreground">Workout</p>
              <p className="font-semibold">{metrics.workoutCompletionPct}%</p>
            </div>
            <div className="rounded-xl bg-secondary/50 p-3">
              <p className="text-muted-foreground">Water</p>
              <p className="font-semibold">{metrics.waterCompletionPct}%</p>
            </div>
            <div className="rounded-xl bg-secondary/50 p-3">
              <p className="text-muted-foreground">Protein</p>
              <p className="font-semibold">{metrics.proteinCompletionPct}%</p>
            </div>
            <div className="rounded-xl bg-secondary/50 p-3">
              <p className="text-muted-foreground">Habits</p>
              <p className="font-semibold">{metrics.habitCompletionPct}%</p>
            </div>
          </div>

          <div>
            <Label>What went well?</Label>
            <Textarea value={wentWell} onChange={(e) => setWentWell(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>What didn&apos;t go well?</Label>
            <Textarea value={didntGoWell} onChange={(e) => setDidntGoWell(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>What will you improve next week?</Label>
            <Textarea value={improve} onChange={(e) => setImprove(e.target.value)} className="mt-1" />
          </div>

          <Button className="w-full" onClick={save}>
            Save Review
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
