"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/GlassCard";
import { RoutineCard } from "@/components/routines/RoutineCard";
import { SortableList } from "@/components/library/SortableList";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useRoutineStore } from "@/stores/routineStore";
import { sortByOrder } from "@/lib/routine-utils";
import { syncTodayFromStores } from "@/lib/sync-day";
import { toast } from "sonner";

type Tab = "active" | "archived";

export function RoutinesScreen() {
  const router = useRouter();
  const routines = useRoutineStore((state) => state.routines);
  const duplicateRoutineById = useRoutineStore((state) => state.duplicateRoutineById);
  const archiveRoutine = useRoutineStore((state) => state.archiveRoutine);
  const restoreRoutine = useRoutineStore((state) => state.restoreRoutine);
  const deleteRoutine = useRoutineStore((state) => state.deleteRoutine);
  const reorderRoutines = useRoutineStore((state) => state.reorderRoutines);

  const [tab, setTab] = useState<Tab>("active");

  const visible = useMemo(() => {
    const filtered = routines.filter((routine) =>
      tab === "active" ? !routine.archived : routine.archived
    );
    return sortByOrder(filtered);
  }, [routines, tab]);

  function handleCreate() {
    router.push("/routines/new");
  }

  function refreshToday() {
    syncTodayFromStores();
  }

  return (
    <PageShell className="space-y-6 pb-24">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
          Routines
        </p>
        <h1 className="text-2xl font-bold tracking-tight">Routine Library</h1>
        <p className="text-sm text-muted-foreground">
          Create, organize, and edit the routines that power your Today checklists.
        </p>
      </header>

      <SegmentedControl
        layoutId="routines-tab"
        options={[
          { value: "active", label: "active" },
          { value: "archived", label: "archived" },
        ]}
        value={tab}
        onChange={setTab}
      />

      <GlassCard className="space-y-4 !p-0">
        {visible.length === 0 ? (
          tab === "active" ? (
            <EmptyState
              icon={ListChecks}
              title="No routines yet."
              description="Morning and evening routines show up in Today as checklists."
              actionLabel="Build a morning routine"
              onAction={handleCreate}
            />
          ) : (
            <EmptyState
              title="No archived routines."
              description="Archived routines are stored here when you retire them."
            />
          )
        ) : tab === "active" ? (
          <SortableList items={visible} onReorder={reorderRoutines}>
            <div className="space-y-3 p-4 sm:p-5">
              {visible.map((routine) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  sortable
                  onDuplicate={() => {
                    duplicateRoutineById(routine.id);
                    refreshToday();
                    toast.success("Routine duplicated");
                  }}
                  onArchive={() => {
                    archiveRoutine(routine.id);
                    refreshToday();
                    toast.success("Routine archived");
                  }}
                  onDelete={() => {
                    deleteRoutine(routine.id);
                    refreshToday();
                    toast.success("Routine deleted");
                  }}
                />
              ))}
            </div>
          </SortableList>
        ) : (
          <div className="space-y-3 p-4 sm:p-5">
            {visible.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                onRestore={() => {
                  restoreRoutine(routine.id);
                  refreshToday();
                  toast.success("Routine restored");
                }}
                onDelete={() => {
                  deleteRoutine(routine.id);
                  refreshToday();
                  toast.success("Routine deleted");
                }}
              />
            ))}
          </div>
        )}
      </GlassCard>

      {tab === "active" && (
        <Button className="min-h-11 w-full" onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New routine
        </Button>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Tap a routine to open the full editor. Drag active routines to reorder.
      </p>

      <div className="text-center">
        <Link href="/settings" className="text-sm text-primary hover:underline focus-ring rounded">
          Back to settings
        </Link>
      </div>
    </PageShell>
  );
}
