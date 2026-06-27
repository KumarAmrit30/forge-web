"use client";

import { useMemo } from "react";
import { useCalendarStore } from "@/stores/calendarStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useWorkoutStore } from "@/stores/workoutStore";
import { useWaterStore } from "@/stores/waterStore";
import { buildProgressScreenModel } from "@/lib/progress-data";
import { ProgressHero } from "@/components/progress/ProgressHero";
import { MonthlyReflection } from "@/components/progress/MonthlyReflection";
import { GrowthTimeline } from "@/components/progress/GrowthTimeline";
import { HabitEvolution } from "@/components/progress/HabitEvolution";
import { Milestones } from "@/components/progress/Milestones";
import { ForgeInsight } from "@/components/progress/ForgeInsight";
import { ProgressStats } from "@/components/progress/ProgressStats";

export function ProgressScreen() {
  const calendarDays = useCalendarStore((s) => s.days);
  const profile = useSettingsStore((s) => s.profile);
  const streak = useSettingsStore((s) => s.streak);
  const workoutSessions = useWorkoutStore((s) => s.sessions);
  const waterLogs = useWaterStore((s) => s.dailyLogs);
  const waterLongestStreak = useWaterStore((s) => s.longestStreak);

  const model = useMemo(
    () =>
      buildProgressScreenModel({
        calendarDays,
        waterLogs,
        workoutSessions,
        profile,
        streak,
        waterLongestStreak,
      }),
    [
      calendarDays,
      waterLogs,
      workoutSessions,
      profile,
      streak,
      waterLongestStreak,
    ]
  );

  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,oklch(0.72_0.15_160/0.05),transparent_68%)]"
      />

      <div className="relative px-6 pt-8">
        <ProgressHero hero={model.hero} />
        <MonthlyReflection reflection={model.monthlyReflection} />
        <GrowthTimeline events={model.timeline} />
        <HabitEvolution habits={model.habits} />
        <Milestones milestones={model.milestones} />
        <ForgeInsight insight={model.insight} />
        <ProgressStats stats={model.stats} />
      </div>
    </div>
  );
}
