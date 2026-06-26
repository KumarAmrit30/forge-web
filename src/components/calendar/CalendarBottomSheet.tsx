"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { easeOut } from "@/components/home/motion";
import { homeSerif } from "@/components/home/home-ui";
import { CalendarActivityRow } from "@/components/calendar/CalendarActivityRow";
import { CalendarInsight } from "@/components/calendar/CalendarInsight";
import type { CalendarDayReflection } from "@/lib/calendar-data";

type Props = {
  reflection: CalendarDayReflection;
  open: boolean;
  onClose: () => void;
};

export function CalendarBottomSheet({ reflection, open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close day reflection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: easeOut }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/25"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: easeOut }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.06}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80 || info.velocity.y > 400) onClose();
            }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto flex h-[65vh] w-full max-w-lg flex-col rounded-t-[32px] border-t border-white/[0.05] bg-[oklch(0.13_0.006_260/0.97)] px-6 pb-8 pt-2.5 shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.35)] backdrop-blur-sm"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-[32px] bg-[radial-gradient(ellipse_80%_70%_at_50%_0%,oklch(0.72_0.15_160/0.05),transparent_70%)]"
            />

            <div className="relative mx-auto mb-5 h-[3px] w-8 shrink-0 rounded-full bg-white/10" />

            <div className="relative min-h-0 flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                  <motion.div
                    key={reflection.date}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: easeOut }}
                  >
                    <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground/50">
                      {reflection.weekdayLabel}
                    </p>
                    <h2
                      className={`${homeSerif} mt-3 text-[34px] leading-none tracking-[-0.01em] text-white`}
                    >
                      {reflection.dateLabel}
                    </h2>
                    <p className="mt-2 text-sm font-medium text-primary/90">
                      {reflection.dayTitle}
                    </p>

                    <div className="relative mt-8 overflow-hidden rounded-[22px] bg-gradient-to-b from-white/[0.035] via-white/[0.012] to-transparent px-8 py-10">
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_85%,oklch(0.72_0.15_160/0.1),transparent_65%)]"
                      />
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-2 rounded-[18px] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
                      />
                      <motion.div
                        key={reflection.illustration}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15, ease: easeOut }}
                        className="relative mx-auto h-44 w-full max-w-[240px]"
                      >
                        <Image
                          src={reflection.illustration}
                          alt=""
                          fill
                          className="object-contain"
                          sizes="240px"
                        />
                      </motion.div>
                    </div>

                    <div className="mt-4">
                      {reflection.activities.map((row, index) => (
                        <CalendarActivityRow
                          key={row.id}
                          row={row}
                          index={index}
                        />
                      ))}
                    </div>

                    <CalendarInsight insight={reflection.insight} />
                  </motion.div>
                </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
