"use client";

import { motion } from "framer-motion";
import { easeOut } from "@/components/home/motion";
import { homeSerif } from "@/components/home/home-ui";
import type { ProgressStatsModel } from "@/lib/progress-data";

type Props = {
  stats: ProgressStatsModel;
};

const STAT_ITEMS: { key: keyof ProgressStatsModel; label: string }[] = [
  { key: "goodDays", label: "Good Days" },
  { key: "workouts", label: "Workouts" },
  { key: "avgWater", label: "Avg Water" },
  { key: "avgProtein", label: "Protein" },
  { key: "avgSleep", label: "Sleep" },
  { key: "currentStreak", label: "Current Streak" },
  { key: "longestStreak", label: "Longest Streak" },
  { key: "consistency", label: "Consistency" },
];

export function ProgressStats({ stats }: Props) {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: easeOut, delay: 0.24 }}
      className="mt-16 pb-10"
    >
      <div className="mb-8 h-px w-full bg-white/[0.04]" />
      <p className="mb-8 text-[9px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/40">
        At a Glance
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-4">
        {STAT_ITEMS.map((item, index) => {
          const raw = stats[item.key];
          const value =
            item.key === "consistency" && typeof raw === "number"
              ? `${raw}%`
              : String(raw);

          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                ease: easeOut,
                delay: 0.28 + index * 0.04,
              }}
            >
              <p className={`${homeSerif} text-xl leading-none text-white/85`}>
                {value}
              </p>
              <p className="mt-1.5 text-[8px] font-medium uppercase tracking-[0.18em] text-muted-foreground/40">
                {item.label}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.footer>
  );
}
