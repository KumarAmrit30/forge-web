"use client";

import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { easeOut } from "@/components/home/motion";

type Props = {
  insight: string;
};

export function CalendarInsight({ insight }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: easeOut, delay: 0.28 }}
      className="mt-8 pt-2"
    >
      <div className="flex items-center gap-1.5">
        <Sparkles
          className="h-3 w-3 shrink-0 text-primary/45"
          strokeWidth={1.75}
        />
        <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-primary/55">
          Forge noticed
        </p>
      </div>
      <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground/60">
        {insight}
      </p>
    </motion.section>
  );
}
