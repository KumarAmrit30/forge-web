"use client";

import {
  Droplets,
  Dumbbell,
  Moon,
  NotebookPen,
  Salad,
  Sun,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { easeOut } from "@/components/home/motion";
import type { CalendarActivityRow as ActivityRow } from "@/lib/calendar-data";
import type { JourneyStepId } from "@/lib/journey-data";

type Props = {
  row: ActivityRow;
  index: number;
};

const ICONS: Record<JourneyStepId, typeof Sun> = {
  morning: Sun,
  workout: Dumbbell,
  hydration: Droplets,
  nutrition: Salad,
  reflection: NotebookPen,
  sleep: Moon,
};

export function CalendarActivityRow({ row, index }: Props) {
  const Icon = ICONS[row.id];

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: easeOut, delay: index * 0.04 }}
      className="flex items-center gap-3 border-t border-white/[0.025] py-4 first:border-t-0"
    >
      <Icon
        className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40"
        strokeWidth={1.65}
      />
      <span className="min-w-0 flex-1 text-sm font-normal text-foreground/85">
        {row.label}
      </span>
      <span
        className={cn(
          "shrink-0 text-sm font-medium tabular-nums",
          row.completed && "text-primary/90",
          !row.completed && !row.unavailable && "text-muted-foreground/70",
          row.unavailable && "text-muted-foreground/40"
        )}
      >
        {row.value}
      </span>
    </motion.div>
  );
}
