"use client";

import { motion, LayoutGroup } from "framer-motion";
import { easeOut } from "@/components/home/motion";
import { HomeSectionLabel } from "@/components/home/home-ui";
import {
  TodayJourneyItem,
  JOURNEY_LINE_LEFT,
} from "@/components/today/TodayJourneyItem";
import type { JourneyStepWithStatus } from "@/lib/journey-data";

type Props = {
  journey: JourneyStepWithStatus[];
};

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
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

export function TodayJourney({ journey }: Props) {
  return (
    <section className="mt-8">
      <HomeSectionLabel className="mb-6">Today&apos;s Journey</HomeSectionLabel>

      <LayoutGroup>
        <motion.ul
          variants={container}
          initial="hidden"
          animate="show"
          className="relative"
        >
          <span
            aria-hidden
            className="absolute top-[10px] bottom-[10px] w-px border-l border-dashed border-white/10"
            style={{ left: JOURNEY_LINE_LEFT }}
          />

          {journey.map((step) => (
            <motion.li
              key={step.id}
              layout
              variants={item}
              className="relative flex items-center gap-4 pb-8 last:pb-0"
            >
              <TodayJourneyItem step={step} />
            </motion.li>
          ))}
        </motion.ul>
      </LayoutGroup>
    </section>
  );
}
