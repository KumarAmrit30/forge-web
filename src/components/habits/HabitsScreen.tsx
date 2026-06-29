"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/GlassCard";
import { HabitCard } from "@/components/habits/HabitCard";
import { SortableList } from "@/components/library/SortableList";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useHabitStore } from "@/stores/habitStore";
import { sortByOrder } from "@/lib/habit-utils";
import { syncHabitsToTodayRecord } from "@/lib/sync-habits";
import { HABIT_CATEGORIES, type HabitCategory } from "@/types/habit";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tab = "active" | "archived";

export function HabitsScreen() {
  const router = useRouter();
  const habits = useHabitStore((state) => state.habits);
  const categoryFilter = useHabitStore((state) => state.categoryFilter);
  const setCategoryFilter = useHabitStore((state) => state.setCategoryFilter);
  const duplicateHabitById = useHabitStore((state) => state.duplicateHabitById);
  const archiveHabit = useHabitStore((state) => state.archiveHabit);
  const restoreHabit = useHabitStore((state) => state.restoreHabit);
  const deleteHabit = useHabitStore((state) => state.deleteHabit);
  const reorderHabits = useHabitStore((state) => state.reorderHabits);

  const [tab, setTab] = useState<Tab>("active");

  const visible = useMemo(() => {
    const filtered = habits.filter((habit) =>
      tab === "active" ? !habit.archived : habit.archived
    );
    const categoryScoped =
      categoryFilter === "all"
        ? filtered
        : filtered.filter((habit) => habit.category === categoryFilter);
    return sortByOrder(categoryScoped);
  }, [habits, tab, categoryFilter]);

  function refreshToday() {
    syncHabitsToTodayRecord();
  }

  return (
    <PageShell className="space-y-6 pb-24">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
          Habits
        </p>
        <h1 className="text-2xl font-bold tracking-tight">Habit Library</h1>
        <p className="text-sm text-muted-foreground">
          Build, organize, and track the habits that shape your day.
        </p>
      </header>

      <SegmentedControl
        layoutId="habits-tab"
        options={[
          { value: "active", label: "active" },
          { value: "archived", label: "archived" },
        ]}
        value={tab}
        onChange={setTab}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategoryFilter("all")}
          className={cn(
            "min-h-11 rounded-full px-3 py-1.5 text-xs transition-colors focus-ring",
            categoryFilter === "all"
              ? "bg-white/[0.1] text-foreground"
              : "bg-white/[0.04] text-muted-foreground"
          )}
        >
          All
        </button>
        {HABIT_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setCategoryFilter(category as HabitCategory)}
            className={cn(
              "min-h-11 rounded-full px-3 py-1.5 text-xs transition-colors focus-ring",
              categoryFilter === category
                ? "bg-white/[0.1] text-foreground"
                : "bg-white/[0.04] text-muted-foreground"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <GlassCard className="space-y-4 !p-0">
        {visible.length === 0 ? (
          tab === "active" ? (
            <EmptyState
              icon={Target}
              title="No habits yet."
              description="Habits due today appear in your Today workspace."
              actionLabel="Create your first habit"
              onAction={() => router.push("/habits/new")}
            />
          ) : (
            <EmptyState
              title="No archived habits."
              description="Archived habits are stored here when you retire them."
            />
          )
        ) : tab === "active" ? (
          <SortableList items={visible} onReorder={reorderHabits}>
            <div className="space-y-3 p-4 sm:p-5">
              {visible.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  sortable
                  onDuplicate={() => {
                    duplicateHabitById(habit.id);
                    refreshToday();
                    toast.success("Habit duplicated");
                  }}
                  onArchive={() => {
                    archiveHabit(habit.id);
                    refreshToday();
                    toast.success("Habit archived");
                  }}
                  onDelete={() => {
                    deleteHabit(habit.id);
                    refreshToday();
                    toast.success("Habit deleted");
                  }}
                />
              ))}
            </div>
          </SortableList>
        ) : (
          <div className="space-y-3 p-4 sm:p-5">
            {visible.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onRestore={() => {
                  restoreHabit(habit.id);
                  refreshToday();
                  toast.success("Habit restored");
                }}
                onDelete={() => {
                  deleteHabit(habit.id);
                  refreshToday();
                  toast.success("Habit deleted");
                }}
              />
            ))}
          </div>
        )}
      </GlassCard>

      {tab === "active" && (
        <Button
          className="min-h-11 w-full"
          onClick={() => router.push("/habits/new")}
        >
          <Plus className="mr-2 h-4 w-4" />
          New habit
        </Button>
      )}

      <div className="text-center">
        <Link href="/settings" className="text-sm text-primary hover:underline focus-ring rounded">
          Back to settings
        </Link>
      </div>
    </PageShell>
  );
}
