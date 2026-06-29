"use client";

import { useSortable, CSS } from "@/components/library/dnd";
import Link from "next/link";
import { Archive, Copy, GripVertical, MoreHorizontal, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoutineIcon } from "@/components/routines/RoutineIconDisplay";
import { cn } from "@/lib/utils";
import { sortByOrder } from "@/lib/routine-utils";
import type { Routine } from "@/types/routine";
import { useState } from "react";

type Props = {
  routine: Routine;
  sortable?: boolean;
  onDuplicate?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
  onDelete?: () => void;
};

export function RoutineCard({
  routine,
  sortable = false,
  onDuplicate,
  onArchive,
  onRestore,
  onDelete,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: routine.id, disabled: !sortable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const itemCount = sortByOrder(routine.checklistItems).length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4",
        isDragging && "z-10 opacity-90 shadow-lg"
      )}
    >
      <div className="flex items-start gap-3">
        {sortable && (
          <button
            type="button"
            className="mt-1 touch-none text-muted-foreground"
            aria-label="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}

        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${routine.color}22` }}
        >
          <RoutineIcon icon={routine.icon} color={routine.color} size={22} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link href={`/routines/${routine.id}`} className="block truncate text-base font-medium hover:text-primary">
                {routine.title}
              </Link>
              {routine.description ? (
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {routine.description}
                </p>
              ) : null}
            </div>
            <div className="relative">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Routine actions"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              {menuOpen && (
                <div className="absolute right-0 z-20 mt-1 w-40 rounded-xl border border-white/[0.08] bg-background p-1 shadow-xl">
                  {onDuplicate && (
                    <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/[0.05]" onClick={() => { onDuplicate(); setMenuOpen(false); }}>
                      <Copy className="h-4 w-4" /> Duplicate
                    </button>
                  )}
                  {routine.archived && onRestore ? (
                    <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/[0.05]" onClick={() => { onRestore(); setMenuOpen(false); }}>
                      <RotateCcw className="h-4 w-4" /> Restore
                    </button>
                  ) : onArchive ? (
                    <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/[0.05]" onClick={() => { onArchive(); setMenuOpen(false); }}>
                      <Archive className="h-4 w-4" /> Archive
                    </button>
                  ) : null}
                  {onDelete && (
                    <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-white/[0.05]" onClick={() => { onDelete(); setMenuOpen(false); }}>
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className="rounded-full bg-white/[0.05] px-2 py-0.5 capitalize">{routine.period}</span>
            <span className="rounded-full bg-white/[0.05] px-2 py-0.5">
              {itemCount} step{itemCount === 1 ? "" : "s"}
            </span>
            {routine.reminder.enabled && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                Reminder {routine.reminder.time}
              </span>
            )}
            {routine.archived && (
              <span className="rounded-full bg-white/[0.05] px-2 py-0.5">Archived</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
