"use client";

import { motion } from "framer-motion";
import { ArrowDown, X } from "lucide-react";
import { HomeSurfaceCard } from "@/components/home/home-ui";
import { easeOut } from "@/components/home/motion";
import { getIntentScreenLabels } from "@/lib/execution-ui";
import type { ExecutionIntent } from "@/lib/execution-ui/intent-types";

type Props = {
  intent: ExecutionIntent;
  index: number;
  onReview: (intent: ExecutionIntent) => void;
  onDismiss: (intentId: string) => void;
};

export function ExecutionPreviewCard({
  intent,
  index,
  onReview,
  onDismiss,
}: Props) {
  const screens = getIntentScreenLabels(intent.affectedScreens);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.35, ease: easeOut, delay: index * 0.06 }}
    >
      <HomeSurfaceCard
        elevation="progress"
        className="relative overflow-hidden px-4 py-4"
      >
        <button
          type="button"
          onClick={() => onDismiss(intent.id)}
          aria-label="Dismiss recommendation"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground/50 transition-colors duration-300 ease-out hover:bg-white/[0.05] hover:text-muted-foreground"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>

        <p className="pr-8 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/55">
          Proposed change
        </p>
        <p className="mt-1.5 text-[15px] font-medium leading-snug text-foreground/90">
          {intent.title}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground/70">
          {intent.reason}
        </p>

        <div className="mt-4 rounded-[16px] border border-white/[0.06] bg-white/[0.02] px-3 py-3">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground/75">{intent.currentValue}</span>
            <ArrowDown
              className="h-3.5 w-3.5 shrink-0 text-primary/50"
              strokeWidth={1.75}
              aria-hidden
            />
            <span className="font-medium text-foreground/90">
              {intent.proposedValue}
            </span>
          </div>
        </div>

        {screens.length > 0 && (
          <p className="mt-3 text-xs text-muted-foreground/60">
            Affects{" "}
            {screens.map((screen) => screen.label).join(", ")}
          </p>
        )}

        <p className="mt-2 text-xs leading-relaxed text-muted-foreground/55">
          {intent.estimatedImpact}
        </p>

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/45">
            {intent.reversible ? "Undo available" : "Not reversible"}
          </span>
          <button
            type="button"
            onClick={() => onReview(intent)}
            className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-foreground/85 transition-colors duration-300 ease-out hover:border-primary/25 hover:bg-primary/[0.06]"
          >
            Review Change
          </button>
        </div>
      </HomeSurfaceCard>
    </motion.div>
  );
}
