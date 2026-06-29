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
  Target,
  Flame,
  BookOpen,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { LibraryIconId } from "@/types/library";

export const LIBRARY_ICON_MAP: Record<LibraryIconId, LucideIcon> = {
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
  target: Target,
  flame: Flame,
  book: BookOpen,
  zap: Zap,
};

export const LIBRARY_ICON_OPTIONS = Object.keys(LIBRARY_ICON_MAP) as LibraryIconId[];

type Props = {
  icon: LibraryIconId;
  color?: string;
  className?: string;
  size?: number;
};

export function LibraryIconDisplay({
  icon,
  color = "#5fd4a4",
  className,
  size = 18,
}: Props) {
  const Icon = LIBRARY_ICON_MAP[icon] ?? Sparkles;
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
