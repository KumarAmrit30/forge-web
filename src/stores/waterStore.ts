"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WaterEntry } from "@/types";
import { todayKey } from "@/lib/date-utils";

type DailyWater = {
  date: string;
  entries: WaterEntry[];
  totalMl: number;
};

type WaterState = {
  dailyLogs: Record<string, DailyWater>;
  currentStreak: number;
  longestStreak: number;
  lastGoalMetDate: string | null;
  addWater: (amountMl: number, time?: string) => void;
  getTodayTotal: () => number;
  getTodayEntries: () => WaterEntry[];
  setStreaks: (current: number, longest: number) => void;
};

function getOrCreateDaily(
  logs: Record<string, DailyWater>,
  date: string
): DailyWater {
  return logs[date] ?? { date, entries: [], totalMl: 0 };
}

export const useWaterStore = create<WaterState>()(
  persist(
    (set, get) => ({
      dailyLogs: {},
      currentStreak: 0,
      longestStreak: 0,
      lastGoalMetDate: null,
      addWater: (amountMl, time) => {
        const date = todayKey();
        const now = time ?? new Date().toTimeString().slice(0, 5);
        set((state) => {
          const daily = getOrCreateDaily(state.dailyLogs, date);
          const entry: WaterEntry = { time: now, amountMl };
          const updated: DailyWater = {
            date,
            entries: [...daily.entries, entry],
            totalMl: daily.totalMl + amountMl,
          };
          return {
            dailyLogs: { ...state.dailyLogs, [date]: updated },
          };
        });
      },
      getTodayTotal: () => {
        const date = todayKey();
        return get().dailyLogs[date]?.totalMl ?? 0;
      },
      getTodayEntries: () => {
        const date = todayKey();
        return get().dailyLogs[date]?.entries ?? [];
      },
      setStreaks: (current, longest) =>
        set({ currentStreak: current, longestStreak: longest }),
    }),
    { name: "forge-water" }
  )
);

export function getWaterSnapshot() {
  const s = useWaterStore.getState();
  return {
    dailyLogs: s.dailyLogs,
    currentStreak: s.currentStreak,
    longestStreak: s.longestStreak,
    lastGoalMetDate: s.lastGoalMetDate,
  };
}

export function hydrateWater(data: ReturnType<typeof getWaterSnapshot>) {
  useWaterStore.setState(data);
}
