"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DayRecord } from "@/types";

type CalendarState = {
  days: Record<string, DayRecord>;
  upsertDay: (record: DayRecord) => void;
  getDay: (date: string) => DayRecord | undefined;
  setDays: (days: Record<string, DayRecord>) => void;
};

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      days: {},
      upsertDay: (record) =>
        set((state) => ({
          days: { ...state.days, [record.date]: record },
        })),
      getDay: (date) => get().days[date],
      setDays: (days) => set({ days }),
    }),
    { name: "forge-calendar" }
  )
);

export function getCalendarSnapshot() {
  return { days: useCalendarStore.getState().days };
}

export function hydrateCalendar(data: ReturnType<typeof getCalendarSnapshot>) {
  useCalendarStore.setState(data);
}
