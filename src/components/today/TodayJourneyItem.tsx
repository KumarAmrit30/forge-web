"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { JourneyStepWithStatus } from "@/lib/journey-data";

type Props = {
  step: JourneyStepWithStatus;
};

export const JOURNEY_NODE = 20;
export const JOURNEY_LINE_LEFT = JOURNEY_NODE / 2;

export function TodayJourneyItem({ step }: Props) {
  return (
    <>
      {step.status === "completed" ? (
        <motion.span
          layout
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
          className="relative z-10 flex shrink-0 items-center justify-center rounded-full bg-primary"
          style={{ width: JOURNEY_NODE, height: JOURNEY_NODE }}
        >
          <Check className="h-3 w-3 text-primary-foreground" strokeWidth={2.5} />
        </motion.span>
      ) : step.status === "current" ? (
        <motion.span
          layout
          animate={{
            scale: [1, 1.1, 1],
            boxShadow: [
              "0 0 0 0 rgba(16,185,129,0)",
              "0 0 0 5px rgba(16,185,129,0.14)",
              "0 0 0 0 rgba(16,185,129,0)",
            ],
          }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative z-10 shrink-0 rounded-full border-2 border-primary bg-transparent"
          style={{ width: JOURNEY_NODE, height: JOURNEY_NODE }}
        />
      ) : (
        <motion.span
          layout
          className="relative z-10 shrink-0 rounded-full border border-white/15 bg-transparent opacity-60"
          style={{ width: JOURNEY_NODE, height: JOURNEY_NODE }}
        />
      )}

      <motion.span
        layout
        transition={{ duration: 0.35, ease: [0, 0, 0.2, 1] }}
        className={cn(
          "text-base transition-colors duration-300",
          step.status === "completed" && "text-muted-foreground/55",
          step.status === "current" && "font-medium text-white",
          step.status === "upcoming" && "text-foreground/45"
        )}
      >
        {step.label}
      </motion.span>
    </>
  );
}
