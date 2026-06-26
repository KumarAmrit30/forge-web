"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CalendarDot } from "@/lib/calendar-data";

type Props = {
  dayNumber: number;
  isToday: boolean;
  isSelected: boolean;
  isFuture: boolean;
  dots: CalendarDot[];
  onSelect: () => void;
};

function Dot({
  state,
  isToday,
  isFuture,
  isSelected,
}: {
  state: CalendarDot["state"];
  isToday: boolean;
  isFuture: boolean;
  isSelected: boolean;
}) {
  return (
    <motion.span
      animate={{
        opacity: isFuture ? 0.35 : isSelected ? 1 : isToday ? 0.92 : 0.78,
        scale: isSelected && state === "completed" ? 1.15 : 1,
      }}
      transition={{ duration: 0.35, ease: [0, 0, 0.2, 1] }}
      className={cn(
        "h-[3px] w-[3px] rounded-full",
        isFuture && "bg-white/[0.06]",
        !isFuture &&
          state === "completed" &&
          (isToday ? "bg-primary" : "bg-primary/85"),
        !isFuture &&
          state === "incomplete" &&
          (isToday ? "bg-white/35" : "bg-white/20"),
        !isFuture && state === "unavailable" && "bg-white/[0.07]"
      )}
    />
  );
}

export function CalendarDayCell({
  dayNumber,
  isToday,
  isSelected,
  isFuture,
  dots,
  onSelect,
}: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isFuture}
      className={cn(
        "group relative flex flex-col items-center py-2.5 transition-transform duration-300 ease-out",
        !isFuture && "hover:scale-[1.03]",
        isFuture && "cursor-default opacity-35"
      )}
    >
      {isSelected && (
        <motion.span
          layoutId="calendar-selected-ring"
          aria-hidden
          className="pointer-events-none absolute top-2.5 h-9 w-9 rounded-full ring-1 ring-primary/70 shadow-[0_0_0_1px_oklch(0.72_0.15_160/0.12),0_0_20px_-2px_oklch(0.72_0.15_160/0.38),0_0_40px_-8px_oklch(0.72_0.15_160/0.22)]"
          transition={{ duration: 0.35, ease: [0, 0, 0.2, 1] }}
        />
      )}

      {isSelected && (
        <span
          aria-hidden
          className="pointer-events-none absolute top-2.5 h-9 w-9 rounded-full bg-primary/[0.06] blur-md"
        />
      )}

      <span
        className={cn(
          "relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors duration-300 ease-out",
          isSelected && "text-white",
          isToday && !isSelected && "text-primary/90",
          !isSelected && !isFuture && "text-foreground/85 group-hover:text-foreground"
        )}
      >
        {dayNumber}
        {isToday && !isSelected && (
          <span
            aria-hidden
            className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary/80"
          />
        )}
      </span>

      <div className="relative z-10 mt-1.5 flex items-center justify-center gap-[3px]">
        {dots.map((dot) => (
          <Dot
            key={dot.id}
            state={dot.state}
            isToday={isToday}
            isFuture={isFuture}
            isSelected={isSelected}
          />
        ))}
      </div>
    </button>
  );
}
