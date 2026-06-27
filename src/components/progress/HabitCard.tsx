"use client";

import { motion } from "framer-motion";
import { easeOut } from "@/components/home/motion";
import { HomeSurfaceCard, homeSerif } from "@/components/home/home-ui";
import type { HabitEvolutionModel } from "@/lib/progress-data";

type Props = {
  habit: HabitEvolutionModel;
  index: number;
};

export function HabitCard({ habit, index }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.38, ease: easeOut, delay: 0.12 + index * 0.06 }}
    >
      <HomeSurfaceCard elevation="insight" className="relative px-5 py-5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[24px] bg-[radial-gradient(ellipse_80%_50%_at_0%_0%,oklch(0.72_0.15_160/0.035),transparent_60%)]"
        />
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/55">
          {habit.personality}
        </p>
        <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/45">
          {habit.habit}
        </p>
        <p className={`${homeSerif} mt-2 text-[22px] leading-none text-white`}>
          {habit.metric}
        </p>
        <p className="mt-2 text-sm leading-snug text-muted-foreground/65">
          {habit.summary}
        </p>
      </HomeSurfaceCard>
    </motion.div>
  );
}
