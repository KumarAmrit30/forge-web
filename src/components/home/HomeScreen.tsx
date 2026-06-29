"use client";

import { useMemo } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useCalendarStore } from "@/stores/calendarStore";
import { useWorkoutStore } from "@/stores/workoutStore";
import { HeroSection } from "@/components/home/HeroSection";
import { MissionCard } from "@/components/home/MissionCard";
import { JourneyTimeline } from "@/components/home/JourneyTimeline";
import { ForgeInsight } from "@/components/home/ForgeInsight";
import { ProgressSummary } from "@/components/home/ProgressSummary";
import { QuickActions } from "@/components/home/QuickActions";
import { PageShell } from "@/components/ui/page-shell";
import {
  buildForgeBrief,
  buildForgeInsight,
  buildJourneyMoments,
  buildMission,
  formatHomeDate,
  getGreetingLabel,
  getHeroIllustration,
  getTimeOfDay,
  resolveTodayRecord,
} from "@/lib/home-data";

export function HomeScreen() {
  const profile = useSettingsStore((s) => s.profile);
  const streak = useSettingsStore((s) => s.streak);
  const calendarDays = useCalendarStore((s) => s.days);
  const plan = useWorkoutStore((s) => s.plan);
  const currentIndex = useWorkoutStore((s) => s.cycle.currentIndex);

  const firstName = profile.name.split(" ")[0];
  const timeOfDay = getTimeOfDay();
  const greeting = getGreetingLabel(timeOfDay);
  const dateLine = formatHomeDate();
  const heroIllustration = getHeroIllustration(timeOfDay);

  const todayRecord = useMemo(
    () => resolveTodayRecord(calendarDays),
    [calendarDays]
  );

  const nextDay = useMemo(
    () => plan.days[currentIndex] ?? null,
    [plan, currentIndex]
  );

  const isRestDay = Boolean(nextDay?.isRestDay);

  const brief = useMemo(() => buildForgeBrief(timeOfDay), [timeOfDay]);

  const mission = useMemo(
    () => buildMission(nextDay, isRestDay),
    [nextDay, isRestDay]
  );

  const moments = useMemo(
    () =>
      buildJourneyMoments(
        todayRecord,
        profile,
        isRestDay,
        nextDay,
        todayRecord.waterMl
      ),
    [todayRecord, profile, isRestDay, nextDay]
  );

  const insight = useMemo(
    () => buildForgeInsight(streak, moments, isRestDay),
    [streak, moments, isRestDay]
  );

  const completed = moments.filter((m) => m.complete).length;

  return (
    <PageShell className="overflow-hidden pb-2">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_70%_60%_at_85%_10%,oklch(0.72_0.15_160/0.06),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_90%_50%_at_50%_-10%,oklch(0.72_0.15_160/0.03),transparent_60%)]"
      />

      <div className="relative">
        <HeroSection
          greeting={greeting}
          name={firstName}
          dateLine={dateLine}
          brief={brief}
          illustration={heroIllustration}
        />

        <div className="-mt-2 space-y-0">
          <MissionCard mission={mission} />
          <ProgressSummary completed={completed} total={moments.length} />
          <JourneyTimeline moments={moments} />
          <ForgeInsight insight={insight} />
          <QuickActions />
        </div>
      </div>
    </PageShell>
  );
}
