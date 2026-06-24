"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/shared/GlassCard";

type Props = {
  title: string;
  items: Record<string, boolean>;
  onToggle: (key: string) => void;
};

export function ChecklistSection({ title, items, onToggle }: Props) {
  return (
    <GlassCard className="space-y-3">
      <h3 className="font-semibold">{title}</h3>
      <div className="space-y-2">
        {Object.entries(items).map(([key, done]) => (
          <button
            key={key}
            onClick={() => onToggle(key)}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-secondary/50"
          >
            <motion.div
              animate={{ scale: done ? 1 : 0.9 }}
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                done
                  ? "border-emerald-500 bg-emerald-500"
                  : "border-muted-foreground/30"
              )}
            >
              {done && <Check className="h-3.5 w-3.5 text-white" />}
            </motion.div>
            <span
              className={cn(
                "text-sm",
                done && "text-muted-foreground line-through"
              )}
            >
              {key}
            </span>
          </button>
        ))}
      </div>
    </GlassCard>
  );
}
