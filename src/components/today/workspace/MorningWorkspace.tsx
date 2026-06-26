"use client";

import { useMemo, useCallback } from "react";
import { ChecklistSection } from "@/components/today/ChecklistSection";
import { updateTodayRecord, getOrCreateTodayRecord } from "@/lib/sync-day";
import { useCalendarStore } from "@/stores/calendarStore";
import { todayKey } from "@/lib/date-utils";

export function MorningWorkspace() {
  const todayDate = todayKey();
  const calendarDay = useCalendarStore((s) => s.days[todayDate]);

  const record = useMemo(
    () => calendarDay ?? getOrCreateTodayRecord(),
    [calendarDay]
  );

  const toggle = useCallback(
    (key: string) => {
      updateTodayRecord({
        morningChecklist: {
          ...record.morningChecklist,
          [key]: !record.morningChecklist[key],
        },
      });
    },
    [record.morningChecklist]
  );

  return (
    <ChecklistSection
      title="Morning Routine"
      items={record.morningChecklist}
      onToggle={toggle}
    />
  );
}
