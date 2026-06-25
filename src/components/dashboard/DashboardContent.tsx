"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useProgressStore } from "@/stores/progressStore";
import { useCalendarStore } from "@/stores/calendarStore";
import { calculateTodayScore } from "@/lib/scoring";
import { generatePriorities } from "@/lib/priority-engine";
import { getGreeting, todayKey } from "@/lib/date-utils";
import { PriorityList } from "@/components/dashboard/PriorityList";
import { ScoreCard } from "@/components/dashboard/ScoreCard";
import { GoalProgressCard } from "@/components/dashboard/GoalProgressCard";
import { ConsistencyHeatmap } from "@/components/dashboard/ConsistencyHeatmap";
import { WeeklySummary } from "@/components/dashboard/WeeklySummary";
import { WaterProgressDisplay } from "@/components/shared/WaterProgressDisplay";
import { WeeklyReviewSheet } from "@/components/review/WeeklyReviewSheet";
import { NextWorkoutCard } from "@/components/dashboard/NextWorkoutCard";
import { StatDelta } from "@/components/shared/MetricTile";

export function DashboardContent() {
  const profile = useSettingsStore((s) => s.profile);
  const streak = useSettingsStore((s) => s.streak);
  const weightLogs = useProgressStore((s) => s.weightLogs);
  const todayRecord = useCalendarStore((s) => s.days[todayKey()]);

  const scores = useMemo(() => calculateTodayScore(), [todayRecord, weightLogs]);
  const priorities = useMemo(() => generatePriorities(todayRecord), [todayRecord]);

  const [reviewOpen, setReviewOpen] = useState(false);

  const weeklyChange = useProgressStore.getState().getWeightChange(7);
  const monthlyChange = useProgressStore.getState().getWeightChange(30);

  const progressToGoal =
    profile.currentWeight <= profile.targetWeight
      ? 100
      : Math.min(
          100,
          Math.max(
            0,
            Math.round(
              ((76 - profile.currentWeight) / (76 - profile.targetWeight)) * 100
            )
          )
        );

  return (
    <div className="space-y-6 px-4 pt-6 pb-4">
      <header className="space-y-1">
        <p className="text-sm text-muted-foreground">{getGreeting()}</p>
        <h1 className="text-2xl font-bold tracking-tight">
          {profile.name.split(" ")[0]}
        </h1>
        <p className="text-xs text-muted-foreground">Built Daily.</p>
      </header>

      <PriorityList priorities={priorities} />
      <ScoreCard scores={scores} />
      <WaterProgressDisplay />
      <NextWorkoutCard />

      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border/50 bg-card/40 p-4">
        <div>
          <p className="text-xl font-bold tabular-nums">{profile.currentWeight}</p>
          <p className="text-xs text-muted-foreground">Current kg</p>
        </div>
        <div>
          <p className="text-xl font-bold tabular-nums text-emerald-500">
            {profile.targetWeight}
          </p>
          <p className="text-xs text-muted-foreground">Target kg</p>
        </div>
        <div>
          <p className="text-lg font-semibold tabular-nums">{streak}</p>
          <p className="text-xs text-muted-foreground">Day streak</p>
        </div>
        <div>
          <p className="text-lg font-semibold tabular-nums">{progressToGoal}%</p>
          <p className="text-xs text-muted-foreground">Toward goal</p>
        </div>
        <div className="col-span-2 flex flex-wrap gap-3 border-t border-border/50 pt-3">
          <StatDelta value={weeklyChange} label="Week" />
          <StatDelta value={monthlyChange} label="Month" />
        </div>
      </div>

      <GoalProgressCard />
      <ConsistencyHeatmap />
      <WeeklySummary onOpenReview={() => setReviewOpen(true)} />

      <Link href="/today">
        <Button className="w-full" variant="secondary">
          Open Today
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>

      <WeeklyReviewSheet open={reviewOpen} onOpenChange={setReviewOpen} />
    </div>
  );
}
