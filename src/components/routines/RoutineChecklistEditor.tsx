"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SortableList } from "@/components/routines/SortableList";
import { ChecklistItemEditor } from "@/components/routines/ChecklistItemEditor";
import { sortByOrder } from "@/lib/routine-utils";
import type { RoutineChecklistItem } from "@/types/routine";

type Props = {
  items: RoutineChecklistItem[];
  onAdd: () => void;
  onUpdate: (itemId: string, patch: Partial<RoutineChecklistItem>) => void;
  onDelete: (itemId: string) => void;
  onReorder: (orderedIds: string[]) => void;
};

export function RoutineChecklistEditor({
  items,
  onAdd,
  onUpdate,
  onDelete,
  onReorder,
}: Props) {
  const sorted = sortByOrder(items);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">Checklist</h3>
          <p className="text-xs text-muted-foreground">
            Steps appear on Today when this routine is active.
          </p>
        </div>
        <Button type="button" size="sm" variant="secondary" onClick={onAdd}>
          <Plus className="mr-1 h-4 w-4" />
          Add step
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] px-4 py-8 text-center text-sm text-muted-foreground">
          No steps yet. Add your first checklist item.
        </div>
      ) : (
        <SortableList items={sorted} onReorder={onReorder}>
          <div className="space-y-3">
            {sorted.map((item) => (
              <ChecklistItemEditor
                key={item.id}
                item={item}
                onChange={(patch) => onUpdate(item.id, patch)}
                onDelete={() => onDelete(item.id)}
              />
            ))}
          </div>
        </SortableList>
      )}
    </div>
  );
}
