"use client";

import { motion } from "framer-motion";
import { easeOut } from "@/components/home/motion";
import { homeSerif } from "@/components/home/home-ui";
import type { CalendarMonthSummary } from "@/lib/calendar-data";

type Props = {
  summary: CalendarMonthSummary;
  monthKey: string;
};

const ITEMS = [
  { key: "goodDays", label: "Good Days" },
  { key: "workouts", label: "Workouts" },
  { key: "avgWaterLiters", label: "Avg Water" },
  { key: "consistencyPercent", label: "Consistency" },
] as const;

export function CalendarSummary({ summary, monthKey }: Props) {
  const values: Record<(typeof ITEMS)[number]["key"], string | number> = {
    goodDays: summary.goodDays,
    workouts: summary.workouts,
    avgWaterLiters: summary.avgWaterLiters,
    consistencyPercent: `${summary.consistencyPercent}%`,
  };

  return (
    <motion.section
      key={monthKey}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: easeOut, delay: 0.04 }}
      className="mt-10 mb-2 grid grid-cols-4 gap-1 py-2"
    >
      {ITEMS.map((item, index) => (
        <div
          key={item.key}
          className={
            index > 0
              ? "relative flex flex-col items-center px-2 before:absolute before:left-0 before:top-1/2 before:h-7 before:w-px before:-translate-y-1/2 before:bg-white/[0.035]"
              : "flex flex-col items-center px-2"
          }
        >
          <p
            className={`${homeSerif} text-[26px] leading-none text-white sm:text-[28px]`}
          >
            {values[item.key]}
          </p>
          <p className="mt-2 text-center text-[8px] font-medium uppercase tracking-[0.2em] text-muted-foreground/50">
            {item.label}
          </p>
        </div>
      ))}
    </motion.section>
  );
}
