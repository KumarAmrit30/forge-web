"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { AnimatePresence, LayoutGroup } from "framer-motion";
import { useCalendarStore } from "@/stores/calendarStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useWorkoutStore } from "@/stores/workoutStore";
import { useWaterStore } from "@/stores/waterStore";
import { todayKey } from "@/lib/date-utils";
import { buildCalendarScreenModel } from "@/lib/calendar-data";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarSummary } from "@/components/calendar/CalendarSummary";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { CalendarBottomSheet } from "@/components/calendar/CalendarBottomSheet";

export function CalendarScreen() {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(todayKey());
  const [sheetOpen, setSheetOpen] = useState(true);

  const calendarDays = useCalendarStore((s) => s.days);
  const profile = useSettingsStore((s) => s.profile);
  const workoutPlan = useWorkoutStore((s) => s.plan);
  const workoutSessions = useWorkoutStore((s) => s.sessions);
  const waterLogs = useWaterStore((s) => s.dailyLogs);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthKey = format(viewDate, "yyyy-MM");

  const model = useMemo(
    () =>
      buildCalendarScreenModel({
        year,
        month,
        selectedDate,
        calendarDays,
        waterLogs,
        workoutSessions,
        workoutPlan,
        profile,
      }),
    [
      year,
      month,
      selectedDate,
      calendarDays,
      waterLogs,
      workoutSessions,
      workoutPlan,
      profile,
    ]
  );

  const handleSelectDay = (date: string) => {
    setSelectedDate(date);
    setSheetOpen(true);
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_70%_55%_at_50%_-5%,oklch(0.72_0.15_160/0.045),transparent_68%)]"
      />

      {selectedDate && sheetOpen && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto h-[50vh] max-w-lg bg-[radial-gradient(ellipse_90%_60%_at_50%_100%,oklch(0.72_0.15_160/0.04),transparent_70%)]"
        />
      )}

      <div className="relative px-6 pt-6 pb-28">
        <CalendarHeader
          viewDate={viewDate}
          onPrev={handlePrevMonth}
          onNext={handleNextMonth}
        />

        <CalendarSummary summary={model.summary} monthKey={monthKey} />

        <LayoutGroup>
          <AnimatePresence mode="wait">
            <CalendarGrid
              key={monthKey}
              weeks={model.weeks}
              monthKey={monthKey}
              onSelectDay={handleSelectDay}
            />
          </AnimatePresence>
        </LayoutGroup>
      </div>

      {model.reflection && (
        <CalendarBottomSheet
          reflection={model.reflection}
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </div>
  );
}
