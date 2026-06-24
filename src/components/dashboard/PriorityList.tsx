"use client";

import type { Priority } from "@/types";
import { GlassCard } from "@/components/shared/GlassCard";
import { Badge } from "@/components/ui/badge";

export function PriorityList({ priorities }: { priorities: Priority[] }) {
  if (!priorities.length) {
    return (
      <GlassCard>
        <p className="text-center text-sm text-muted-foreground">
          All priorities complete. Great work today.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="space-y-3">
      <h2 className="text-lg font-semibold">Today&apos;s Priorities</h2>
      <div className="space-y-2">
        {priorities.map((p) => (
          <div
            key={p.rank}
            className="flex items-start gap-3 rounded-xl bg-secondary/30 px-3 py-3"
          >
            <Badge
              variant="outline"
              className="shrink-0 border-emerald-500/50 bg-emerald-500/10 font-mono text-emerald-500"
            >
              {p.rank}
            </Badge>
            <div>
              <p className="font-medium leading-snug">{p.label}</p>
              <p className="text-xs text-muted-foreground">{p.category}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
