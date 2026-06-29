"use client";

import {
  Sun,
  Moon,
  Sparkles,
  Heart,
  Droplets,
  Dumbbell,
  Coffee,
  Bed,
  Leaf,
  Star,
  Utensils,
  Brain,
  type LucideIcon,
} from "lucide-react";
import type { RoutineIconId } from "@/types/routine";

export const ROUTINE_ICON_MAP: Record<RoutineIconId, LucideIcon> = {
  sun: Sun,
  moon: Moon,
  sparkles: Sparkles,
  heart: Heart,
  droplets: Droplets,
  dumbbell: Dumbbell,
  coffee: Coffee,
  bed: Bed,
  leaf: Leaf,
  star: Star,
  utensils: Utensils,
  brain: Brain,
};

export const ROUTINE_ICON_OPTIONS = Object.keys(ROUTINE_ICON_MAP) as RoutineIconId[];

type Props = {
  icon: RoutineIconId;
  color?: string;
  className?: string;
  size?: number;
};

export function RoutineIcon({ icon, color = "#5fd4a4", className, size = 18 }: Props) {
  const Icon = ROUTINE_ICON_MAP[icon] ?? Sparkles;
  return (
    <Icon
      className={className}
      style={{ color }}
      width={size}
      height={size}
      strokeWidth={2}
    />
  );
}
