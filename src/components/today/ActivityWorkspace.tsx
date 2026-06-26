"use client";

import type { ComponentType } from "react";
import type { JourneyStepId } from "@/lib/journey-data";
import { MorningWorkspace } from "@/components/today/workspace/MorningWorkspace";
import { WorkoutWorkspace } from "@/components/today/workspace/WorkoutWorkspace";
import { HydrationWorkspace } from "@/components/today/workspace/HydrationWorkspace";
import { NutritionWorkspace } from "@/components/today/workspace/NutritionWorkspace";
import { ReflectionWorkspace } from "@/components/today/workspace/ReflectionWorkspace";
import { SleepWorkspace } from "@/components/today/workspace/SleepWorkspace";

type Props = {
  stepId: JourneyStepId | null;
};

const WORKSPACES: Record<JourneyStepId, ComponentType> = {
  morning: MorningWorkspace,
  workout: WorkoutWorkspace,
  hydration: HydrationWorkspace,
  nutrition: NutritionWorkspace,
  reflection: ReflectionWorkspace,
  sleep: SleepWorkspace,
};

export function ActivityWorkspace({ stepId }: Props) {
  if (!stepId) return null;

  const Workspace = WORKSPACES[stepId];
  return <Workspace />;
}
