"use client";

import { useSortable } from "@/components/library/dnd";
import { CSS } from "@/components/library/dnd";
import Link from "next/link";
import {
  Archive,
  Copy,
  GripVertical,
  MoreHorizontal,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LibraryIconDisplay } from "@/components/library/LibraryIconDisplay";
import { cn } from "@/lib/utils";
import type { Habit } from "@/types/habit";
import { useState } from "react";

type Props = {
  habit: Habit;
  sortable?: boolean;
  onDuplicate?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
  onDelete?: () => void;
};

export function HabitCard({
  habit,
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
  } = useSortable({ id: habit.id, disabled: !sortable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const frequencyLabel =
    habit.frequency.type === "daily"
      ? "Daily"
      : habit.frequency.type === "weekly"
        ? "Weekly"
        : "Custom";

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
          style={{ backgroundColor: `${habit.color}22` }}
        >
          <LibraryIconDisplay icon={habit.icon} color={habit.color} size={22} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={`/habits/${habit.id}`}
                className="block truncate text-base font-medium hover:text-primary"
              >
                {habit.title}
              </Link>
              {habit.description ? (
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {habit.description}
                </p>
              ) : null}
            </div>
            <div className="relative">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Habit actions"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              {menuOpen && (
                <div className="absolute right-0 z-20 mt-1 w-40 rounded-xl border border-white/[0.08] bg-background p-1 shadow-xl">
                  {onDuplicate && (
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/[0.05]"
                      onClick={() => {
                        onDuplicate();
                        setMenuOpen(false);
                      }}
                    >
                      <Copy className="h-4 w-4" /> Duplicate
                    </button>
                  )}
                  {habit.archived && onRestore ? (
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/[0.05]"
                      onClick={() => {
                        onRestore();
                        setMenuOpen(false);
                      }}
                    >
                      <RotateCcw className="h-4 w-4" /> Restore
                    </button>
                  ) : onArchive ? (
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/[0.05]"
                      onClick={() => {
                        onArchive();
                        setMenuOpen(false);
                      }}
                    >
                      <Archive className="h-4 w-4" /> Archive
                    </button>
                  ) : null}
                  {onDelete && (
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-white/[0.05]"
                      onClick={() => {
                        onDelete();
                        setMenuOpen(false);
                      }}
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className="rounded-full bg-white/[0.05] px-2 py-0.5">
              {habit.category}
            </span>
            <span className="rounded-full bg-white/[0.05] px-2 py-0.5">
              {frequencyLabel}
            </span>
            {habit.reminder.enabled && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                Reminder {habit.reminder.time}
              </span>
            )}
            {habit.archived && (
              <span className="rounded-full bg-white/[0.05] px-2 py-0.5">
                Archived
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
