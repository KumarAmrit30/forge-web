"use client";

import {
  BookOpen,
  Droplets,
  Dumbbell,
  Flame,
  Sun,
  Target,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { easeOut } from "@/components/home/motion";
import type { MilestoneModel } from "@/lib/progress-data";
import type { MilestoneIconId } from "@/lib/identity-engine";

type Props = {
  milestone: MilestoneModel;
  index: number;
};

const ICONS: Record<MilestoneIconId, LucideIcon> = {
  workout: Dumbbell,
  streak: Flame,
  hydration: Droplets,
  morning: Sun,
  consistency: Target,
  reflection: BookOpen,
};

export function MilestoneCard({ milestone, index }: Props) {
  const Icon = ICONS[milestone.icon];

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: easeOut, delay: index * 0.05 }}
      className={cn(
        "flex w-[120px] shrink-0 snap-center flex-col items-center rounded-[20px] border px-3 py-4",
        milestone.achieved
          ? "border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-transparent shadow-[0_4px_20px_-12px_rgba(0,0,0,0.5)]"
          : "border-white/[0.04] bg-white/[0.012] opacity-45"
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full",
          milestone.achieved
            ? "bg-primary/[0.08] text-primary/80"
            : "bg-white/[0.04] text-muted-foreground/40"
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={1.65} />
      </span>
      <p className="mt-3 text-center text-xs font-medium leading-snug text-foreground/85">
        {milestone.label}
      </p>
    </motion.div>
  );
}
