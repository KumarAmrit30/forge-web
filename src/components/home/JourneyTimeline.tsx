"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { easeOut } from "@/components/home/motion";
import { HomeSectionLabel } from "@/components/home/home-ui";
import type { JourneyMoment } from "@/lib/home-data";

type Props = {
  moments: JourneyMoment[];
};

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.16 },
  },
};

const item = {
  hidden: { opacity: 0, x: -6 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: easeOut },
  },
};

const NODE = 20;
const LINE_LEFT = NODE / 2;

export function JourneyTimeline({ moments }: Props) {
  return (
    <section className="forge-section-gap">
      <HomeSectionLabel className="mb-4">Upcoming</HomeSectionLabel>

      <motion.ul
        variants={container}
        initial="hidden"
        animate="show"
        className="relative"
      >
        <span
          aria-hidden
          className="absolute top-[10px] bottom-[10px] w-px border-l border-dashed border-white/10"
          style={{ left: LINE_LEFT }}
        />

        {moments.map((moment) => (
          <motion.li
            key={moment.id}
            variants={item}
            className="relative flex items-center gap-4 pb-5 last:pb-0"
          >
            {moment.complete ? (
              <span
                className="relative z-10 flex shrink-0 items-center justify-center rounded-full bg-primary"
                style={{ width: NODE, height: NODE }}
              >
                <Check
                  className="h-3 w-3 text-primary-foreground"
                  strokeWidth={2.5}
                />
              </span>
            ) : (
              <span
                className="relative z-10 shrink-0 rounded-full border border-white/25 bg-transparent"
                style={{ width: NODE, height: NODE }}
              />
            )}

            <span
              className={
                moment.complete
                  ? "text-base text-muted-foreground/70"
                  : "text-base text-foreground/90"
              }
            >
              {moment.label}
            </span>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
