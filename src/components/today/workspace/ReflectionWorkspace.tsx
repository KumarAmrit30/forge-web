"use client";

import { useMemo, useCallback } from "react";
import { ChecklistSection } from "@/components/today/ChecklistSection";
import { updateTodayRecord, getOrCreateTodayRecord } from "@/lib/sync-day";
import { useCalendarStore } from "@/stores/calendarStore";
import { todayKey } from "@/lib/date-utils";

export function ReflectionWorkspace() {
  const todayDate = todayKey();
  const calendarDay = useCalendarStore((s) => s.days[todayDate]);

  const record = useMemo(
    () => calendarDay ?? getOrCreateTodayRecord(),
    [calendarDay]
  );

  const toggle = useCallback(
    (key: string) => {
      updateTodayRecord({
        nightChecklist: {
          ...record.nightChecklist,
          [key]: !record.nightChecklist[key],
        },
      });
    },
    [record.nightChecklist]
  );

  return (
    <ChecklistSection
      title="Evening Reflection"
      items={record.nightChecklist}
      onToggle={toggle}
    />
  );
}
