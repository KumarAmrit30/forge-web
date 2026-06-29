"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { easeOut } from "@/components/home/motion";
import { HomeSurfaceCard, homeSerif } from "@/components/home/home-ui";
import type { TodayActivityPresentation } from "@/lib/today-data";

type Props = {
  activity: TodayActivityPresentation;
  onCta?: () => void;
  onQuickAction?: (amountMl: number) => void;
};

const cardVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export function TodayFocusCard({ activity, onCta, onQuickAction }: Props) {
  return (
    <AnimatePresence mode="wait">
      <motion.section
        key={activity.stepId}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.35, ease: easeOut }}
        className="relative"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 top-6 h-36 w-36 rounded-full bg-primary/[0.06] blur-[56px]"
        />

        <HomeSurfaceCard elevation="mission" className="relative px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-2.5">
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative mx-auto h-24 w-full max-w-[180px]"
            >
              <Image
                src={activity.illustration}
                alt=""
                fill
                priority
                className="object-contain"
                sizes="200px"
              />
            </motion.div>

            <div className="text-center">
              <h2
                className={`${homeSerif} text-[26px] leading-tight text-white sm:text-[28px]`}
              >
                {activity.title}
              </h2>
              {activity.subtitle && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {activity.subtitle}
                </p>
              )}
            </div>

            {(activity.progress || activity.duration) && (
              <div className="flex items-center justify-center gap-2 text-xs">
                {activity.progress && (
                  <span className="text-primary/80">{activity.progress}</span>
                )}
                {activity.duration && (
                  <span className="text-muted-foreground/80">
                    {activity.duration}
                  </span>
                )}
              </div>
            )}

            {activity.preview.length > 0 && (
              <ul className="mx-auto w-full max-w-xs space-y-1.5 pt-0.5">
                {activity.preview.map((item) => (
                  <li
                    key={item.label}
                    className={
                      item.kind === "more"
                        ? "pl-5 text-xs text-muted-foreground/60"
                        : "flex items-center gap-2 text-sm text-muted-foreground/90"
                    }
                  >
                    {item.kind === "item" && (
                      <span
                        aria-hidden
                        className="h-1.5 w-1.5 shrink-0 rounded-full border border-white/25"
                      />
                    )}
                    {item.label}
                  </li>
                ))}
              </ul>
            )}

            {activity.quickActions && activity.quickActions.length > 0 && (
              <div className="flex justify-center gap-2 pt-0.5">
                {activity.quickActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() =>
                      action.amountMl && onQuickAction?.(action.amountMl)
                    }
                    className="min-h-11 rounded-full border border-primary/25 bg-primary/8 px-4 py-2 text-xs font-medium text-primary transition-all hover:bg-primary/12 active:scale-95 focus-ring"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={onCta}
              className="mx-auto mt-2 min-h-11 w-full max-w-xs rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_0_16px_-6px_oklch(0.72_0.15_160/0.35)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_0_20px_-4px_oklch(0.72_0.15_160/0.4)] active:scale-[0.97] focus-ring"
            >
              {activity.ctaLabel}
            </button>
          </div>
        </HomeSurfaceCard>
      </motion.section>
    </AnimatePresence>
  );
}
