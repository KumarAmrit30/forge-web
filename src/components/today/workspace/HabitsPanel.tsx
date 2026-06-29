"use client";

import { useMemo, useCallback } from "react";
import Link from "next/link";
import { Target } from "lucide-react";
import { ChecklistSection } from "@/components/today/ChecklistSection";
import { EmptyState } from "@/components/ui/empty-state";
import { updateTodayRecord, getOrCreateTodayRecord } from "@/lib/sync-day";
import { useCalendarStore } from "@/stores/calendarStore";
import { useHabitStore } from "@/stores/habitStore";
import { todayKey } from "@/lib/date-utils";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HabitsPanel() {
  const todayDate = todayKey();
  const calendarDay = useCalendarStore((s) => s.days[todayDate]);
  const dueHabits = useHabitStore((state) => state.getDueHabitsForDate());
  const toggleCompletion = useHabitStore((state) => state.toggleCompletion);
  const isCompleted = useHabitStore((state) => state.isCompleted);

  const record = useMemo(
    () => calendarDay ?? getOrCreateTodayRecord(),
    [calendarDay]
  );

  const habitItems = useMemo(() => {
    const items: Record<string, boolean> = {};
    for (const habit of dueHabits) {
      items[habit.title] = isCompleted(habit.id, todayDate);
    }
    return items;
  }, [dueHabits, isCompleted, todayDate]);

  const toggleHabit = useCallback(
    (title: string) => {
      const habit = dueHabits.find((entry) => entry.title === title);
      if (!habit) return;
      toggleCompletion(habit.id, todayDate);
      updateTodayRecord({
        habits: {
          ...record.habits,
          [habit.id]: !isCompleted(habit.id, todayDate),
        },
      });
    },
    [dueHabits, toggleCompletion, todayDate, record.habits, isCompleted]
  );

  return (
    <div className="space-y-4">
      {dueHabits.length > 0 ? (
        <ChecklistSection
          title="Today's Habits"
          items={habitItems}
          onToggle={toggleHabit}
        />
      ) : (
        <EmptyState
          icon={Target}
          title="No habits scheduled."
          description="Add habits to track daily wins on your journey."
          actionLabel="Create your first habit"
          actionHref="/habits/new"
        />
      )}
      <Link
        href="/habits"
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "mx-auto flex min-h-11 w-fit items-center focus-ring"
        )}
      >
        Manage habits
      </Link>
    </div>
  );
}
