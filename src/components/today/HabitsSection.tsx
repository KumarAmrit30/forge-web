"use client";

import { useMemo } from "react";
import { useHabitStore } from "@/stores/habitStore";
import { todayKey } from "@/lib/date-utils";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/shared/GlassCard";
import { motion } from "framer-motion";
import { syncHabitsToTodayRecord } from "@/lib/sync-habits";

export function HabitsSection({
  onToggle,
}: {
  onToggle?: () => void;
}) {
  const date = todayKey();
  const allHabits = useHabitStore((s) => s.habits);
  const allCompletions = useHabitStore((s) => s.completions);
  const toggle = useHabitStore((s) => s.toggleCompletion);

  const habits = useMemo(
    () => allHabits.filter((h) => h.active && h.frequency === "daily"),
    [allHabits]
  );

  const completions = useMemo(
    () => allCompletions[date],
    [allCompletions, date]
  );

  const done = useMemo(() => {
    if (!completions) return 0;
    return habits.filter((h) => completions[h.id]).length;
  }, [habits, completions]);

  if (!habits.length) return null;

  return (
    <GlassCard id="habits" className="scroll-mt-20 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Daily Habits</h3>
        <span className="text-xs text-muted-foreground">
          {done}/{habits.length}
        </span>
      </div>
      <div className="space-y-1">
        {habits.map((habit) => {
          const complete = completions?.[habit.id] ?? false;
          return (
            <button
              key={habit.id}
              onClick={() => {
                toggle(habit.id, date);
                syncHabitsToTodayRecord();
                onToggle?.();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-secondary/50"
            >
              <motion.div
                animate={{ scale: complete ? 1 : 0.95 }}
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                  complete
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-muted-foreground/30"
                )}
              >
                {complete && <Check className="h-3.5 w-3.5 text-white" />}
              </motion.div>
              <div className="min-w-0 flex-1">
                <span
                  className={cn(
                    "text-sm",
                    complete && "text-muted-foreground line-through"
                  )}
                >
                  {habit.title}
                </span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {habit.category}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}
