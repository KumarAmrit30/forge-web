"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, X } from "lucide-react";
import { easeOut } from "@/components/home/motion";
import type { ExecutionFlowResult } from "@/lib/execution-ui/intent-types";

type Props = {
  visible: boolean;
  result: ExecutionFlowResult | null;
  onUndo: () => void;
  onDismiss: () => void;
};

export function ExecutionSuccessBanner({
  visible,
  result,
  onUndo,
  onDismiss,
}: Props) {
  if (!result?.success) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: easeOut }}
          className="fixed inset-x-0 bottom-24 z-40 mx-auto w-full max-w-lg px-6"
        >
          <div className="flex items-center gap-3 rounded-[20px] border border-primary/20 bg-[oklch(0.18_0.02_160/0.95)] px-4 py-3 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)] backdrop-blur-sm">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground/90">
                Change applied
              </p>
              <p className="truncate text-xs text-muted-foreground/70">
                {result.message}
              </p>
            </div>

            {result.undoAvailable && (
              <button
                type="button"
                onClick={onUndo}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs text-foreground/85 transition-colors duration-300 ease-out hover:border-primary/25 hover:bg-primary/[0.08]"
              >
                <RotateCcw className="h-3 w-3" strokeWidth={1.75} />
                Undo
              </button>
            )}

            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground/60 transition-colors duration-300 ease-out hover:bg-white/[0.06] hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
