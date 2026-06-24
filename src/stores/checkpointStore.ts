"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MonthlyCheckpoint } from "@/types";

type CheckpointState = {
  checkpoints: MonthlyCheckpoint[];
  addCheckpoint: (checkpoint: MonthlyCheckpoint) => void;
  updateCheckpoint: (id: string, updates: Partial<MonthlyCheckpoint>) => void;
  getByMonth: (month: string) => MonthlyCheckpoint | undefined;
};

export const useCheckpointStore = create<CheckpointState>()(
  persist(
    (set, get) => ({
      checkpoints: [],
      addCheckpoint: (checkpoint) =>
        set((state) => ({
          checkpoints: [
            ...state.checkpoints.filter((c) => c.month !== checkpoint.month),
            checkpoint,
          ],
        })),
      updateCheckpoint: (id, updates) =>
        set({
          checkpoints: get().checkpoints.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }),
      getByMonth: (month) =>
        get().checkpoints.find((c) => c.month === month),
    }),
    { name: "forge-checkpoints" }
  )
);

export function getCheckpointSnapshot() {
  return { checkpoints: useCheckpointStore.getState().checkpoints };
}

export function hydrateCheckpoints(
  data: ReturnType<typeof getCheckpointSnapshot>
) {
  useCheckpointStore.setState(data);
}
