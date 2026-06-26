"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { easeOut } from "@/components/home/motion";
import { homeSerif } from "@/components/home/home-ui";

type Props = {
  viewDate: Date;
  onPrev: () => void;
  onNext: () => void;
};

export function CalendarHeader({ viewDate, onPrev, onNext }: Props) {
  return (
    <header className="flex items-start justify-between pb-2">
      <div>
        <motion.h1
          key={format(viewDate, "MMMM")}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: easeOut }}
          className={`${homeSerif} text-[48px] leading-[0.95] tracking-[-0.02em] text-white`}
        >
          {format(viewDate, "MMMM")}
        </motion.h1>
        <motion.p
          key={format(viewDate, "yyyy")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, ease: easeOut, delay: 0.05 }}
          className="mt-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground/45"
        >
          {format(viewDate, "yyyy")}
        </motion.p>
      </div>

      <div className="flex items-center gap-0.5 pt-1">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous month"
          className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground/70 transition-opacity duration-300 hover:text-foreground/90 active:opacity-70"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.65} />
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Next month"
          className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground/70 transition-opacity duration-300 hover:text-foreground/90 active:opacity-70"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={1.65} />
        </button>
      </div>
    </header>
  );
}
