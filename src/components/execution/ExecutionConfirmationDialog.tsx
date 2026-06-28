"use client";

import { useEffect, useRef } from "react";
import { ArrowDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getIntentScreenLabels } from "@/lib/execution-ui";
import type { ExecutionIntent } from "@/lib/execution-ui/intent-types";
import { ExecutionStatus } from "@/components/execution/ExecutionStatus";

type Props = {
  open: boolean;
  intent: ExecutionIntent | null;
  status: "reviewing" | "executing" | "idle" | "success" | "error";
  onConfirm: () => void;
  onCancel: () => void;
};

export function ExecutionConfirmationDialog({
  open,
  intent,
  status,
  onConfirm,
  onCancel,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open && confirmRef.current) {
      confirmRef.current.focus();
    }
  }, [open]);

  if (!intent) return null;

  const screens = getIntentScreenLabels(intent.affectedScreens);
  const isExecuting = status === "executing";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isExecuting) onCancel();
      }}
    >
      <DialogContent
        showCloseButton={!isExecuting}
        className="max-w-md rounded-[24px] border-white/[0.08] bg-[oklch(0.16_0.01_260)] p-0 text-foreground ring-white/[0.06] sm:max-w-md"
        aria-describedby="execution-confirm-summary"
      >
        <DialogHeader className="space-y-1 px-5 pt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/55">
            Confirm change
          </p>
          <DialogTitle className="font-heading text-lg font-medium leading-snug text-foreground/95">
            {intent.title}
          </DialogTitle>
          <DialogDescription
            id="execution-confirm-summary"
            className="text-sm leading-relaxed text-muted-foreground/75"
          >
            {intent.summary}
          </DialogDescription>
        </DialogHeader>

        <div className="mx-5 rounded-[16px] border border-white/[0.06] bg-white/[0.02] px-4 py-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/50">
                Current
              </p>
              <p className="mt-1 text-muted-foreground/80">{intent.currentValue}</p>
            </div>
            <ArrowDown
              className="h-4 w-4 shrink-0 text-primary/45"
              strokeWidth={1.75}
              aria-hidden
            />
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/50">
                New
              </p>
              <p className="mt-1 font-medium text-foreground/90">
                {intent.proposedValue}
              </p>
            </div>
          </div>
        </div>

        {screens.length > 0 && (
          <p className="px-5 text-xs text-muted-foreground/60">
            Affected: {screens.map((s) => s.label).join(", ")}
          </p>
        )}

        <p className="px-5 text-xs text-muted-foreground/55">
          {intent.reversible
            ? "You can undo this change after applying."
            : "This change cannot be undone."}
        </p>

        {isExecuting && (
          <div className="px-5 pb-2">
            <ExecutionStatus message="Applying change…" />
          </div>
        )}

        <DialogFooter className="flex-row gap-2 border-t border-white/[0.06] bg-transparent px-5 py-4 sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isExecuting}
            className="rounded-full px-4 py-2 text-sm text-muted-foreground/80 transition-colors duration-300 ease-out hover:bg-white/[0.04] hover:text-foreground disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={isExecuting}
            className="rounded-full border border-primary/30 bg-primary/[0.12] px-5 py-2 text-sm font-medium text-foreground/90 transition-colors duration-300 ease-out hover:bg-primary/[0.18] disabled:opacity-50"
          >
            Apply
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
