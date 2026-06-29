"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/GlassCard";
import { RoutineForm } from "@/components/routines/RoutineForm";
import { RoutineChecklistEditor } from "@/components/routines/RoutineChecklistEditor";
import { useRoutineStore } from "@/stores/routineStore";
import { createChecklistItem, createRoutine, sortByOrder } from "@/lib/routine-utils";
import { syncTodayFromStores } from "@/lib/sync-day";
import type { Routine, RoutineChecklistItem } from "@/types/routine";
import { toast } from "sonner";

type Props = {
  routineId: string;
};

function buildNewRoutine(): Routine {
  return createRoutine({
    title: "New Routine",
    period: "morning",
    order: useRoutineStore.getState().routines.length,
  });
}

export function RoutineEditorScreen({ routineId }: Props) {
  const router = useRouter();
  const isNew = routineId === "new";
  const storeRoutine = useRoutineStore((state) =>
    isNew ? undefined : state.getRoutine(routineId)
  );
  const updateRoutine = useRoutineStore((state) => state.updateRoutine);
  const deleteRoutine = useRoutineStore((state) => state.deleteRoutine);
  const create = useRoutineStore((state) => state.createRoutine);

  const [newRoutine] = useState(buildNewRoutine);
  const [overrides, setOverrides] = useState<Partial<Routine>>({});
  const [checklistDraft, setChecklistDraft] = useState<RoutineChecklistItem[] | null>(
    null
  );

  const draft = useMemo(() => {
    const base = isNew ? newRoutine : storeRoutine;
    if (!base) return null;
    return {
      ...base,
      ...overrides,
      checklistItems: checklistDraft ?? base.checklistItems,
    };
  }, [isNew, newRoutine, storeRoutine, overrides, checklistDraft]);

  const checklistItems = useMemo(
    () => (draft ? sortByOrder(draft.checklistItems) : []),
    [draft]
  );

  if (!draft) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">Routine not found.</p>
        <Link href="/routines" className="mt-4 inline-block text-sm text-primary">
          Back to routines
        </Link>
      </div>
    );
  }

  function patchDraft(patch: Partial<Routine>) {
    setOverrides((current) => ({ ...current, ...patch }));
  }

  function patchChecklistItem(
    itemId: string,
    patch: Partial<RoutineChecklistItem>
  ) {
    const source = checklistDraft ?? draft!.checklistItems;
    setChecklistDraft(
      source.map((item) => (item.id === itemId ? { ...item, ...patch } : item))
    );
  }

  function handleSave() {
    if (!draft) return;
    if (!draft.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (isNew) {
      create(draft);
      toast.success("Routine created");
      router.replace(`/routines/${draft.id}`);
    } else {
      updateRoutine(draft.id, draft);
      setOverrides({});
      setChecklistDraft(null);
      toast.success("Routine saved");
    }
    syncTodayFromStores();
  }

  function handleDelete() {
    if (!draft) return;
    if (isNew) {
      router.push("/routines");
      return;
    }
    deleteRoutine(draft.id);
    syncTodayFromStores();
    toast.success("Routine deleted");
    router.push("/routines");
  }

  function handleAddStep() {
    const item = createChecklistItem("New step", checklistItems.length);
    setChecklistDraft([...checklistItems, item]);
  }

  function handleDeleteStep(itemId: string) {
    setChecklistDraft(checklistItems.filter((item) => item.id !== itemId));
  }

  function handleReorderSteps(orderedIds: string[]) {
    const map = new Map(checklistItems.map((item) => [item.id, item]));
    const reordered = orderedIds
      .map((itemId, index) => {
        const item = map.get(itemId);
        return item ? { ...item, order: index } : null;
      })
      .filter((item): item is RoutineChecklistItem => item !== null);
    setChecklistDraft(reordered);
  }

  return (
    <div className="space-y-6 px-4 pt-6 pb-24">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/routines"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Routines
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
          {isNew ? "Create Routine" : "Edit Routine"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure details, schedule, reminders, and checklist steps.
        </p>
      </header>

      <GlassCard>
        <RoutineForm value={draft} onChange={patchDraft} />
      </GlassCard>

      <GlassCard>
        <RoutineChecklistEditor
          items={checklistItems}
          onAdd={handleAddStep}
          onUpdate={patchChecklistItem}
          onDelete={handleDeleteStep}
          onReorder={handleReorderSteps}
        />
      </GlassCard>
    </div>
  );
}
