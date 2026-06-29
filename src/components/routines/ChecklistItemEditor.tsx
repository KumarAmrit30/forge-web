"use client";

import { useSortable, CSS } from "@/components/library/dnd";
import { GripVertical, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RoutineChecklistItem } from "@/types/routine";

type Props = {
  item: RoutineChecklistItem;
  onChange: (patch: Partial<RoutineChecklistItem>) => void;
  onDelete: () => void;
};

export function ChecklistItemEditor({ item, onChange, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4",
        isDragging && "z-10 opacity-80 shadow-lg"
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-2 touch-none text-muted-foreground hover:text-foreground"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1 space-y-3">
          <Input
            value={item.title}
            onChange={(event) => onChange({ title: event.target.value })}
            placeholder="Step title"
          />
          <Textarea
            value={item.description ?? ""}
            onChange={(event) => onChange({ description: event.target.value })}
            placeholder="Optional description"
            rows={2}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Duration (min)</Label>
              <Input
                type="number"
                min={0}
                value={item.estimatedMinutes ?? ""}
                onChange={(event) =>
                  onChange({
                    estimatedMinutes: event.target.value
                      ? Number(event.target.value)
                      : undefined,
                  })
                }
                className="mt-1"
              />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <Switch
                checked={item.optional}
                onCheckedChange={(optional) => onChange({ optional })}
              />
              <Label className="text-xs">Optional step</Label>
            </div>
          </div>
        </div>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="Delete step"
          onClick={onDelete}
          className="shrink-0 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
