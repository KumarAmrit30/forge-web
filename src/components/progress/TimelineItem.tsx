"use client";

import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { easeOut } from "@/components/home/motion";
import type { GrowthTimelineEvent } from "@/lib/progress-data";

type Props = {
  event: GrowthTimelineEvent;
  index: number;
  isLast: boolean;
};

const STAGGER = 0.08;

export function TimelineItem({ event, index, isLast }: Props) {
  const base = index * STAGGER;

  return (
    <li className="relative flex gap-4 pb-10 last:pb-0">
      {!isLast && (
        <motion.span
          aria-hidden
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ duration: 0.35, ease: easeOut, delay: base + STAGGER }}
          style={{ originY: 0 }}
          className="absolute left-[7px] top-5 bottom-0 w-px bg-white/[0.07]"
        />
      )}

      <motion.span
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: easeOut, delay: base }}
        className={cn(
          "relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2",
          event.isHighlight
            ? "border-primary bg-primary/20 shadow-[0_0_10px_-2px_oklch(0.72_0.15_160/0.35)]"
            : "border-primary/55 bg-transparent"
        )}
      />

      <div className="min-w-0 flex-1 pt-0.5">
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: easeOut, delay: base + STAGGER * 2 }}
          className={cn(
            "text-base",
            event.isHighlight
              ? "font-medium text-white"
              : "text-foreground/85"
          )}
        >
          {event.label}
        </motion.p>
        {event.date && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: easeOut, delay: base + STAGGER * 3 }}
            className="mt-0.5 text-xs text-muted-foreground/45"
          >
            {format(parseISO(event.date), "MMM d, yyyy")}
          </motion.p>
        )}
      </div>
    </li>
  );
}
