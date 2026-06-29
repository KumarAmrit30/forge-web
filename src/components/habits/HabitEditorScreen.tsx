"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/GlassCard";
import { HabitForm } from "@/components/habits/HabitForm";
import { useHabitStore } from "@/stores/habitStore";
import { createHabit } from "@/lib/habit-utils";
import { syncHabitsToTodayRecord } from "@/lib/sync-habits";
import type { Habit } from "@/types/habit";
import { toast } from "sonner";

type Props = {
  habitId: string;
};

function buildNewHabit(): Habit {
  return createHabit({ title: "New Habit", category: "Health" });
}

export function HabitEditorScreen({ habitId }: Props) {
  const router = useRouter();
  const isNew = habitId === "new";
  const storeHabit = useHabitStore((state) =>
    isNew ? undefined : state.getHabit(habitId)
  );
  const updateHabit = useHabitStore((state) => state.updateHabit);
  const deleteHabit = useHabitStore((state) => state.deleteHabit);
  const create = useHabitStore((state) => state.createHabit);

  const [newHabit] = useState(buildNewHabit);
  const [overrides, setOverrides] = useState<Partial<Habit>>({});

  const draft = useMemo(() => {
    const base = isNew ? newHabit : storeHabit;
    if (!base) return null;
    return { ...base, ...overrides };
  }, [isNew, newHabit, storeHabit, overrides]);

  if (!draft) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">Habit not found.</p>
        <Link href="/habits" className="mt-4 inline-block text-sm text-primary">
          Back to habits
        </Link>
      </div>
    );
  }

  function patchDraft(patch: Partial<Habit>) {
    setOverrides((current) => ({ ...current, ...patch }));
  }

  function handleSave() {
    if (!draft) return;
    if (!draft.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (isNew) {
      create(draft);
      toast.success("Habit created");
      router.replace(`/habits/${draft.id}`);
    } else {
      updateHabit(draft.id, draft);
      setOverrides({});
      toast.success("Habit saved");
    }
    syncHabitsToTodayRecord();
  }

  function handleDelete() {
    if (!draft) return;
    if (isNew) {
      router.push("/habits");
      return;
    }
    deleteHabit(draft.id);
    syncHabitsToTodayRecord();
    toast.success("Habit deleted");
    router.push("/habits");
  }

  return (
    <div className="space-y-6 px-4 pt-6 pb-24">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/habits"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Habits
        </Link>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button type="button" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          {isNew ? "Create Habit" : "Edit Habit"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure details, frequency, reminders, and notes.
        </p>
      </header>

      <GlassCard>
        <HabitForm value={draft} onChange={patchDraft} />
      </GlassCard>
    </div>
  );
}
