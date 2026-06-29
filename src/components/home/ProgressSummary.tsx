"use client";

import { motion } from "framer-motion";
import { easeOut } from "@/components/home/motion";
import { HomeSectionLabel, HomeSurfaceCard } from "@/components/home/home-ui";

type Props = {
  completed: number;
  total: number;
};

const RADIUS = 20;
const RING = 2 * Math.PI * RADIUS;

export function ProgressSummary({ completed, total }: Props) {
  const ratio = total > 0 ? completed / total : 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOut, delay: 0.22 }}
      className="forge-section-gap"
    >
      <HomeSurfaceCard elevation="progress" className="px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 shrink-0">
            <svg viewBox="0 0 48 48" className="h-14 w-14 -rotate-90" aria-hidden>
              <circle
                cx="24"
                cy="24"
                r={RADIUS}
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-white/[0.08]"
              />
              <motion.circle
                cx="24"
                cy="24"
                r={RADIUS}
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="text-primary/80"
                strokeDasharray={RING}
                initial={{ strokeDashoffset: RING }}
                animate={{ strokeDashoffset: RING * (1 - ratio) }}
                transition={{ duration: 0.5, ease: easeOut, delay: 0.35 }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium tabular-nums text-muted-foreground">
              {completed}/{total}
            </span>
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
            <HomeSectionLabel size="small">Quick Progress</HomeSectionLabel>
            <p className="text-sm text-muted-foreground">
              {completed} / {total} moments complete
            </p>
            <div className="h-px w-full overflow-hidden rounded-full bg-white/[0.08]">
              <motion.div
                className="h-full rounded-full bg-primary/70"
                initial={{ width: 0 }}
                animate={{ width: `${ratio * 100}%` }}
                transition={{ duration: 0.5, ease: easeOut, delay: 0.38 }}
              />
            </div>
          </div>
        </div>
      </HomeSurfaceCard>
    </motion.section>
  );
}
