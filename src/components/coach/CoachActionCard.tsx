"use client";

import { motion } from "framer-motion";
import { X, ArrowUpRight } from "lucide-react";
import { HomeSurfaceCard } from "@/components/home/home-ui";
import { easeOut } from "@/components/home/motion";
import type { ExperienceActionCard } from "@/lib/coach/conversation-experience";

type Props = {
  card: ExperienceActionCard;
  index: number;
  onPrimary: (card: ExperienceActionCard) => void;
  onDismiss: (cardId: string) => void;
};

export function CoachActionCard({
  card,
  index,
  onPrimary,
  onDismiss,
}: Props) {
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
          onClick={() => onDismiss(card.id)}
          aria-label="Dismiss"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground/50 transition-colors duration-300 ease-out hover:bg-white/[0.05] hover:text-muted-foreground"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>

        <p className="pr-8 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/55">
          Recommendation
        </p>
        <p className="mt-1.5 text-[15px] font-medium leading-snug text-foreground/90">
          {card.title}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground/70">
          {card.reason}
        </p>

        <button
          type="button"
          onClick={() => onPrimary(card)}
          className="group mt-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-foreground/85 transition-colors duration-300 ease-out hover:border-primary/25 hover:bg-primary/[0.06]"
        >
          {card.actionLabel}
          <ArrowUpRight
            className="h-3.5 w-3.5 text-primary/70 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            strokeWidth={1.75}
          />
        </button>
      </HomeSurfaceCard>
    </motion.div>
  );
}
