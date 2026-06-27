"use client";

import { motion } from "framer-motion";
import { easeOut } from "@/components/home/motion";
import { HomeSectionLabel, HomeSurfaceCard, homeSerif } from "@/components/home/home-ui";
import type { MonthlyReflectionModel } from "@/lib/progress-data";

type Props = {
  reflection: MonthlyReflectionModel;
};

export function MonthlyReflection({ reflection }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOut, delay: 0.08 }}
      className="mt-10"
    >
      <HomeSurfaceCard elevation="insight" className="px-6 py-6">
        <HomeSectionLabel size="small" className="mb-3">
          {reflection.label}
        </HomeSectionLabel>
        <h2 className={`${homeSerif} text-[26px] leading-tight text-white`}>
          {reflection.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground/80">
          {reflection.summary}
        </p>
        {reflection.highlights.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {reflection.highlights.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm text-muted-foreground/75"
              >
                <span className="h-1 w-1 shrink-0 rounded-full bg-primary/70" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </HomeSurfaceCard>
    </motion.section>
  );
}
