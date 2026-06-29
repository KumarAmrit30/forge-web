"use client";

import { motion } from "framer-motion";
import { easeOut } from "@/components/home/motion";

type Props = {
  completed: number;
  total: number;
};

const RADIUS = 11;
const RING = 2 * Math.PI * RADIUS;

export function TodayProgress({ completed, total }: Props) {
  const ratio = total > 0 ? completed / total : 0;

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: easeOut, delay: 0.18 }}
      className="mt-5 border-t border-white/[0.03] pt-4 pb-4"
    >
      <div className="flex items-center gap-2.5">
        <div className="relative h-8 w-8 shrink-0">
          <svg viewBox="0 0 36 36" className="h-8 w-8 -rotate-90">
            <circle
              cx="18"
              cy="18"
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-white/[0.06]"
            />
            <motion.circle
              cx="18"
              cy="18"
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-primary/55"
              strokeDasharray={RING}
              initial={{ strokeDashoffset: RING }}
              animate={{ strokeDashoffset: RING * (1 - ratio) }}
              transition={{ duration: 0.45, ease: easeOut, delay: 0.2 }}
            />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground/60">
            {completed} / {total} complete
          </p>
          <div className="mt-1.5 h-px w-full overflow-hidden rounded-full bg-white/[0.04]">
            <motion.div
              className="h-full rounded-full bg-primary/45"
              initial={{ width: 0 }}
              animate={{ width: `${ratio * 100}%` }}
              transition={{ duration: 0.45, ease: easeOut, delay: 0.22 }}
            />
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
