"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useProgressStore } from "@/stores/progressStore";
import { useCalendarStore } from "@/stores/calendarStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { generateInsights } from "@/lib/insights";
import { PhotoGallery, PhotoCompare } from "@/components/progress/PhotoGallery";
import { GlassCard } from "@/components/shared/GlassCard";
import { CheckpointTimeline } from "@/components/checkpoint/CheckpointTimeline";
import { MonthlyCheckpointSheet } from "@/components/checkpoint/MonthlyCheckpointSheet";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date-utils";
import { isFirstWeekOfMonth } from "@/lib/date-utils";

export function ProgressContent() {
  const weightLogs = useProgressStore((s) => s.weightLogs);
  const strengthLogs = useProgressStore((s) => s.strengthLogs);
  const days = useCalendarStore((s) => s.days);
  const profile = useSettingsStore((s) => s.profile);
  const insights = generateInsights();
  const [checkpointOpen, setCheckpointOpen] = useState(isFirstWeekOfMonth());

  const weightData = weightLogs.map((l) => ({
    date: formatDate(l.date, "MMM d"),
    weight: l.weightKg,
  }));

  const last30 = Object.values(days)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  const completionData = [
    {
      name: "Water",
      pct: Math.round(
        (last30.filter((d) => d.waterMl >= profile.dailyWaterGoal).length /
          Math.max(1, last30.length)) *
          100
      ),
    },
    {
      name: "Protein",
      pct: Math.round(
        (last30.filter((d) => d.proteinG >= profile.dailyProteinGoal).length /
          Math.max(1, last30.length)) *
          100
      ),
    },
    {
      name: "Workout",
      pct: Math.round(
        (last30.filter((d) => d.workoutCompletion?.completed).length /
          Math.max(1, last30.length)) *
          100
      ),
    },
  ];

  const lifts = ["bench", "deadlift", "squat", "ohp"] as const;
  const strengthData = lifts.map((lift) => {
    const logs = strengthLogs.filter((l) => l.exercise === lift);
    const best = logs.sort((a, b) => b.weightKg - a.weightKg)[0];
    return { name: lift.toUpperCase(), max: best?.weightKg ?? 0 };
  });

  return (
    <div className="space-y-6 px-4 pt-6 pb-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Progress</h1>
          <p className="text-sm text-muted-foreground">Long-term transformation</p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setCheckpointOpen(true)}>
          Checkpoint
        </Button>
      </header>

      {insights.length > 0 && (
        <GlassCard className="space-y-2">
          <h2 className="font-semibold">Insights</h2>
          {insights.map((ins, i) => (
            <p key={i} className="text-sm text-muted-foreground">{ins}</p>
          ))}
        </GlassCard>
      )}

      <GlassCard className="space-y-3">
        <h2 className="font-semibold">Weight</h2>
        {weightData.length > 1 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="oklch(0.62 0.01 260)" />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10 }} stroke="oklch(0.62 0.01 260)" />
                <Tooltip contentStyle={{ background: "oklch(0.16 0.008 260)", border: "none", borderRadius: 8 }} />
                <Line type="monotone" dataKey="weight" stroke="oklch(0.72 0.15 160)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Log weight to see your trend.</p>
        )}
      </GlassCard>

      <GlassCard className="space-y-3">
        <h2 className="font-semibold">Completion (30 days)</h2>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={completionData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="oklch(0.62 0.01 260)" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="oklch(0.62 0.01 260)" />
              <Tooltip contentStyle={{ background: "oklch(0.16 0.008 260)", border: "none", borderRadius: 8 }} />
              <Bar dataKey="pct" fill="oklch(0.72 0.15 160)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard className="space-y-3">
        <h2 className="font-semibold">Strength PRs</h2>
        <div className="grid grid-cols-2 gap-3">
          {strengthData.map((l) => (
            <div key={l.name} className="rounded-xl bg-secondary/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">{l.name}</p>
              <p className="text-xl font-bold tabular-nums">{l.max || "—"}</p>
              <p className="text-xs text-muted-foreground">kg</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <PhotoCompare />
      <PhotoGallery />

      <div>
        <h2 className="mb-3 font-semibold">Monthly Checkpoints</h2>
        <CheckpointTimeline />
      </div>

      <MonthlyCheckpointSheet open={checkpointOpen} onOpenChange={setCheckpointOpen} />
    </div>
  );
}
