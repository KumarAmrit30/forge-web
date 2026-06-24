"use client";

import { useState, useMemo } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useProgressStore } from "@/stores/progressStore";
import { calculateTodayScore } from "@/lib/scoring";
import { generatePriorities } from "@/lib/priority-engine";
import { getGreeting } from "@/lib/date-utils";
import { PriorityList } from "@/components/dashboard/PriorityList";
import { ScoreCard } from "@/components/dashboard/ScoreCard";
import { NextWorkoutCard } from "@/components/dashboard/NextWorkoutCard";
import { GoalProgressCard } from "@/components/dashboard/GoalProgressCard";
import { ConsistencyHeatmap } from "@/components/dashboard/ConsistencyHeatmap";
import { WeeklySummary } from "@/components/dashboard/WeeklySummary";
import { WaterWidget } from "@/components/today/WaterWidget";
import { WeightQuickLog } from "@/components/shared/WeightQuickLog";
import { QuickActionSheet } from "@/components/shared/QuickActionSheet";
import { WeeklyReviewSheet } from "@/components/review/WeeklyReviewSheet";
import { Button } from "@/components/ui/button";
import { Droplets, Scale, Beef, StickyNote } from "lucide-react";
import { useWaterStore } from "@/stores/waterStore";
import { syncTodayFromStores } from "@/lib/sync-day";

export function DashboardContent() {
  const profile = useSettingsStore((s) => s.profile);
  const streak = useSettingsStore((s) => s.streak);
  const weightLogs = useProgressStore((s) => s.weightLogs);
  const weeklyChange = useMemo(
    () => useProgressStore.getState().getWeightChange(7),
    [weightLogs]
  );
  const monthlyChange = useMemo(
    () => useProgressStore.getState().getWeightChange(30),
    [weightLogs]
  );
  const addWater = useWaterStore((s) => s.addWater);

  const scores = calculateTodayScore();
  const priorities = generatePriorities();

  const [weightOpen, setWeightOpen] = useState(false);
  const [proteinOpen, setProteinOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const startWeight = 76;
  const progressToGoal =
    startWeight > profile.targetWeight
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round(
              ((startWeight - profile.currentWeight) /
                (startWeight - profile.targetWeight)) *
                100
            )
          )
        )
      : 100;

  return (
    <div className="space-y-6 px-4 pt-6">
      <header className="space-y-1">
        <p className="text-sm text-muted-foreground">{getGreeting()}</p>
        <h1 className="text-2xl font-bold tracking-tight">{profile.name.split(" ")[0]}</h1>
        <p className="text-xs text-muted-foreground">Built Daily.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border/50 bg-card/60 p-4 backdrop-blur-sm">
        <div>
          <p className="text-2xl font-bold tabular-nums">{profile.currentWeight}</p>
          <p className="text-xs text-muted-foreground">Current kg</p>
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums">{profile.targetWeight}</p>
          <p className="text-xs text-muted-foreground">Target kg</p>
        </div>
        <div>
          <p className="text-lg font-semibold tabular-nums text-emerald-500">
            {Math.max(0, Math.min(100, progressToGoal))}%
          </p>
          <p className="text-xs text-muted-foreground">Progress</p>
        </div>
        <div>
          <p className="text-lg font-semibold tabular-nums">{streak}</p>
          <p className="text-xs text-muted-foreground">Day streak</p>
        </div>
        {(weeklyChange !== null || monthlyChange !== null) && (
          <div className="col-span-2 flex gap-4 border-t border-border/50 pt-3 text-xs text-muted-foreground">
            {weeklyChange !== null && (
              <span>
                Week: {weeklyChange > 0 ? "+" : ""}
                {weeklyChange} kg
              </span>
            )}
            {monthlyChange !== null && (
              <span>
                Month: {monthlyChange > 0 ? "+" : ""}
                {monthlyChange} kg
              </span>
            )}
          </div>
        )}
      </div>

      <PriorityList priorities={priorities} />
      <ScoreCard scores={scores} />
      <WaterWidget compact />
      <NextWorkoutCard />
      <GoalProgressCard />

      <div className="grid grid-cols-4 gap-2">
        <Button
          variant="secondary"
          className="flex h-auto flex-col gap-1 py-3"
          onClick={() => {
            addWater(250);
            syncTodayFromStores();
          }}
        >
          <Droplets className="h-5 w-5" />
          <span className="text-xs">Water</span>
        </Button>
        <Button
          variant="secondary"
          className="flex h-auto flex-col gap-1 py-3"
          onClick={() => setWeightOpen(true)}
        >
          <Scale className="h-5 w-5" />
          <span className="text-xs">Weight</span>
        </Button>
        <Button
          variant="secondary"
          className="flex h-auto flex-col gap-1 py-3"
          onClick={() => setProteinOpen(true)}
        >
          <Beef className="h-5 w-5" />
          <span className="text-xs">Protein</span>
        </Button>
        <Button
          variant="secondary"
          className="flex h-auto flex-col gap-1 py-3"
          onClick={() => setNotesOpen(true)}
        >
          <StickyNote className="h-5 w-5" />
          <span className="text-xs">Notes</span>
        </Button>
      </div>

      <ConsistencyHeatmap />
      <WeeklySummary onOpenReview={() => setReviewOpen(true)} />

      <WeightQuickLog open={weightOpen} onOpenChange={setWeightOpen} />
      <QuickActionSheet open={proteinOpen} onOpenChange={setProteinOpen} type="protein" />
      <QuickActionSheet open={notesOpen} onOpenChange={setNotesOpen} type="notes" />
      <WeeklyReviewSheet open={reviewOpen} onOpenChange={setReviewOpen} />
    </div>
  );
}
