"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSettingsStore } from "@/stores/settingsStore";
import { useCalendarStore } from "@/stores/calendarStore";
import { useWorkoutStore } from "@/stores/workoutStore";
import { useWaterStore } from "@/stores/waterStore";
import { buildJourneyInput, resolveTodayRecord } from "@/lib/home-data";
import { buildTodayScreenModel } from "@/lib/today-data";
import { syncTodayFromStores } from "@/lib/sync-day";
import { syncRemindersToSW } from "@/lib/notifications";
import { todayKey } from "@/lib/date-utils";
import { easeOut } from "@/components/home/motion";
import { HomeSectionLabel } from "@/components/home/home-ui";
import { TodayFocusCard } from "@/components/today/TodayFocusCard";
import { ActivityWorkspace } from "@/components/today/ActivityWorkspace";
import { TodayNextCard } from "@/components/today/TodayNextCard";
import { TodayJourney } from "@/components/today/TodayJourney";
import { TodayInsight } from "@/components/today/TodayInsight";
import { TodayProgress } from "@/components/today/TodayProgress";
import type { JourneyStepId } from "@/lib/journey-data";

export function TodayScreen() {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [openedForStep, setOpenedForStep] = useState<JourneyStepId | null>(
    null
  );

  const profile = useSettingsStore((s) => s.profile);
  const streak = useSettingsStore((s) => s.streak);
  const calendarDays = useCalendarStore((s) => s.days);
  const plan = useWorkoutStore((s) => s.plan);
  const currentIndex = useWorkoutStore((s) => s.cycle.currentIndex);
  const dailyLogs = useWaterStore((s) => s.dailyLogs);
  const addWater = useWaterStore((s) => s.addWater);

  const todayDate = todayKey();
  const todayLog = dailyLogs[todayDate];
  const waterMl = todayLog?.totalMl ?? 0;

  const todayRecord = useMemo(
    () => resolveTodayRecord(calendarDays),
    [calendarDays]
  );

  const nextDay = useMemo(
    () => plan.days[currentIndex] ?? null,
    [plan, currentIndex]
  );

  const isRestDay = Boolean(nextDay?.isRestDay);

  const model = useMemo(() => {
    const input = buildJourneyInput(
      todayRecord,
      profile,
      nextDay,
      isRestDay,
      waterMl
    );
    return buildTodayScreenModel(input, streak);
  }, [todayRecord, profile, nextDay, isRestDay, waterMl, streak]);

  const currentStepId = model.current?.id ?? null;

  const showWorkspace =
    workspaceOpen && openedForStep === currentStepId && currentStepId !== null;

  const openWorkspace = useCallback(() => {
    if (!currentStepId) return;
    setWorkspaceOpen(true);
    setOpenedForStep(currentStepId);
    requestAnimationFrame(() => {
      workspaceRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  }, [currentStepId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.location.hash || !currentStepId) return;

    const timer = window.setTimeout(() => {
      setWorkspaceOpen(true);
      setOpenedForStep(currentStepId);
      workspaceRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 320);

    return () => window.clearTimeout(timer);
  }, [currentStepId]);

  const handleQuickWater = useCallback(
    (amountMl: number) => {
      addWater(amountMl);
      syncTodayFromStores();
      syncRemindersToSW();
    },
    [addWater]
  );

  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,oklch(0.72_0.15_160/0.04),transparent_65%)]"
      />

      <div className="relative px-6 pt-6">
        {model.focus && (
          <HomeSectionLabel className="mb-4">Right Now</HomeSectionLabel>
        )}

        {model.focus ? (
          <TodayFocusCard
            activity={model.focus}
            onCta={openWorkspace}
            onQuickAction={handleQuickWater}
          />
        ) : (
          <div className="py-16 text-center">
            <p className="font-serif text-2xl text-white">Today is complete</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Rest well — you earned it.
            </p>
          </div>
        )}

        <TodayNextCard preview={model.nextPreview} />
        <TodayJourney journey={model.journey} />
        <TodayInsight insight={model.insight} />
        <TodayProgress
          completed={model.completedCount}
          total={model.totalCount}
        />

        <AnimatePresence initial={false}>
          {showWorkspace && currentStepId && (
            <motion.div
              ref={workspaceRef}
              key={currentStepId}
              id="activity-workspace"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: easeOut }}
              className="overflow-hidden scroll-mt-24"
            >
              <ActivityWorkspace stepId={currentStepId} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
