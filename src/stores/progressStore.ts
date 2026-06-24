"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WeightLog, StrengthLog } from "@/types";

type ProgressState = {
  weightLogs: WeightLog[];
  strengthLogs: StrengthLog[];
  logWeight: (date: string, weightKg: number) => void;
  logStrength: (log: StrengthLog) => void;
  getLatestWeight: () => number | null;
  getWeightChange: (days: number) => number | null;
  getStrengthHistory: (
    exercise: StrengthLog["exercise"]
  ) => StrengthLog[];
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      weightLogs: [],
      strengthLogs: [],
      logWeight: (date, weightKg) =>
        set((state) => {
          const filtered = state.weightLogs.filter((l) => l.date !== date);
          return {
            weightLogs: [...filtered, { date, weightKg }].sort((a, b) =>
              a.date.localeCompare(b.date)
            ),
          };
        }),
      logStrength: (log) =>
        set((state) => ({
          strengthLogs: [...state.strengthLogs, log],
        })),
      getLatestWeight: () => {
        const logs = get().weightLogs;
        if (!logs.length) return null;
        return logs[logs.length - 1].weightKg;
      },
      getWeightChange: (days) => {
        const logs = get().weightLogs;
        if (logs.length < 2) return null;
        const latest = logs[logs.length - 1];
        const targetDate = new Date(latest.date);
        targetDate.setDate(targetDate.getDate() - days);
        const targetStr = targetDate.toISOString().split("T")[0];
        const past = [...logs]
          .reverse()
          .find((l) => l.date <= targetStr);
        if (!past) return null;
        return Math.round((latest.weightKg - past.weightKg) * 10) / 10;
      },
      getStrengthHistory: (exercise) =>
        get().strengthLogs.filter((l) => l.exercise === exercise),
    }),
    { name: "forge-progress" }
  )
);

export function getProgressSnapshot() {
  const s = useProgressStore.getState();
  return { weightLogs: s.weightLogs, strengthLogs: s.strengthLogs };
}

export function hydrateProgress(data: ReturnType<typeof getProgressSnapshot>) {
  useProgressStore.setState(data);
}
