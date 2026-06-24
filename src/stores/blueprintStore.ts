"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LifeArea } from "@/types";

type BlueprintState = {
  goals: string;
  lifeAreas: Record<LifeArea, string>;
  skincare: string;
  haircare: string;
  nutrition: string;
  overnightOats: string;
  dietPlan: string;
  workoutPlan: string;
  goldenRules: string;
  trackingSystem: string;
  editMode: boolean;
  setSection: (section: keyof Omit<BlueprintState, "editMode" | "setSection" | "setEditMode" | "setLifeArea">, content: string) => void;
  setLifeArea: (area: LifeArea, content: string) => void;
  setEditMode: (v: boolean) => void;
};

export const useBlueprintStore = create<BlueprintState>()(
  persist(
    (set) => ({
      goals: "",
      lifeAreas: {} as Record<LifeArea, string>,
      skincare: "",
      haircare: "",
      nutrition: "",
      overnightOats: "",
      dietPlan: "",
      workoutPlan: "",
      goldenRules: "",
      trackingSystem: "",
      editMode: false,
      setSection: (section, content) => set({ [section]: content }),
      setLifeArea: (area, content) =>
        set((state) => ({
          lifeAreas: { ...state.lifeAreas, [area]: content },
        })),
      setEditMode: (v) => set({ editMode: v }),
    }),
    { name: "forge-blueprint" }
  )
);

export function getBlueprintSnapshot() {
  const s = useBlueprintStore.getState();
  return {
    goals: s.goals,
    lifeAreas: s.lifeAreas,
    skincare: s.skincare,
    haircare: s.haircare,
    nutrition: s.nutrition,
    overnightOats: s.overnightOats,
    dietPlan: s.dietPlan,
    workoutPlan: s.workoutPlan,
    goldenRules: s.goldenRules,
    trackingSystem: s.trackingSystem,
  };
}

export function hydrateBlueprint(data: ReturnType<typeof getBlueprintSnapshot>) {
  useBlueprintStore.setState(data);
}
