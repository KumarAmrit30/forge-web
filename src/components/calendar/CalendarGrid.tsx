"use client";

import { motion } from "framer-motion";
import { easeOut } from "@/components/home/motion";
import { CalendarDayCell } from "@/components/calendar/CalendarDayCell";
import type { CalendarDayCellModel } from "@/lib/calendar-data";

type Props = {
  weeks: (CalendarDayCellModel | null)[][];
  monthKey: string;
  onSelectDay: (date: string) => void;
};

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function CalendarGrid({ weeks, monthKey, onSelectDay }: Props) {
  return (
    <motion.section
      key={monthKey}
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -14 }}
      transition={{ duration: 0.35, ease: easeOut }}
      className="mt-6"
    >
      <div className="mb-4 grid grid-cols-7">
        {WEEKDAYS.map((label, index) => (
          <div
            key={`${monthKey}-${label}-${index}`}
            className="text-center text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground/40"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="space-y-1">
        {weeks.map((week, weekIndex) => (
          <div key={`${monthKey}-w-${weekIndex}`} className="grid grid-cols-7">
            {week.map((cell, dayIndex) =>
              cell ? (
                <CalendarDayCell
                  key={cell.date}
                  dayNumber={cell.dayNumber}
                  isToday={cell.isToday}
                  isSelected={cell.isSelected}
                  isFuture={cell.isFuture}
                  dots={cell.dots}
                  onSelect={() => onSelectDay(cell.date)}
                />
              ) : (
                <div
                  key={`${monthKey}-empty-${weekIndex}-${dayIndex}`}
                  className="py-2.5"
                />
              )
            )}
          </div>
        ))}
      </div>
    </motion.section>
  );
}
