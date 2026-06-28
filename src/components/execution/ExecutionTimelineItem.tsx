"use client";

import { HomeSurfaceCard } from "@/components/home/home-ui";
import type { ExecutionTimelineEntry } from "@/lib/execution-ui/intent-types";

type Props = {
  entry: ExecutionTimelineEntry;
};

export function ExecutionTimelineItem({ entry }: Props) {
  return (
    <li>
      <HomeSurfaceCard
        elevation="progress"
        className="flex items-center justify-between gap-3 px-3 py-2.5"
      >
        <div className="min-w-0">
          <p className="truncate text-sm text-foreground/85">{entry.title}</p>
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/45">
            {entry.category}
            {entry.undone ? " · Undone" : ""}
          </p>
        </div>
        {entry.reversible && !entry.undone && (
          <span className="shrink-0 text-[10px] uppercase tracking-[0.1em] text-primary/50">
            Reversible
          </span>
        )}
      </HomeSurfaceCard>
    </li>
  );
}
