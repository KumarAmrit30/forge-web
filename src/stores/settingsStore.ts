"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile } from "@/types";

type SettingsState = {
  hasSeeded: boolean;
  profile: Profile;
  streak: number;
  lastActiveDate: string | null;
  setProfile: (profile: Partial<Profile>) => void;
  setHasSeeded: (v: boolean) => void;
  updateStreak: (date: string) => void;
};

const defaultProfile: Profile = {
  name: "Amrit Kumar",
  age: 22,
  gender: "Male",
  height: "5'7\"",
  currentWeight: 76,
  targetWeight: 72,
  targetWeightRange: "70-72 kg",
  dailyProteinGoal: 130,
  dailyWaterGoal: 3500,
  dailyStepsGoal: 10000,
  dailySleepGoal: 8,
  startDate: "2026-06-01",
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      hasSeeded: false,
      profile: defaultProfile,
      streak: 0,
      lastActiveDate: null,
      setProfile: (profile) =>
        set({ profile: { ...get().profile, ...profile } }),
      setHasSeeded: (v) => set({ hasSeeded: v }),
      updateStreak: (date) => {
        const { lastActiveDate, streak } = get();
        if (lastActiveDate === date) return;
        const yesterday = new Date(date);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        if (lastActiveDate === yesterdayStr) {
          set({ streak: streak + 1, lastActiveDate: date });
        } else if (lastActiveDate !== date) {
          set({ streak: 1, lastActiveDate: date });
        }
      },
    }),
    { name: "forge-settings" }
  )
);

export function getSettingsSnapshot() {
  const s = useSettingsStore.getState();
  return {
    hasSeeded: s.hasSeeded,
    profile: s.profile,
    streak: s.streak,
    lastActiveDate: s.lastActiveDate,
  };
}

export function hydrateSettings(data: ReturnType<typeof getSettingsSnapshot>) {
  useSettingsStore.setState(data);
}
