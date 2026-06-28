"use client";

import { ExecutionTimelineItem } from "@/components/execution/ExecutionTimelineItem";
import { HomeSectionLabel } from "@/components/home/home-ui";
import { groupTimelineByDay } from "@/lib/execution-ui";
import type { ExecutionTimelineEntry } from "@/lib/execution-ui/intent-types";

type Props = {
  entries: ExecutionTimelineEntry[];
};

export function ExecutionTimeline({ entries }: Props) {
  if (entries.length === 0) return null;

  const groups = groupTimelineByDay(entries);

  return (
    <section className="mt-8 space-y-4" aria-label="Recent changes">
      <HomeSectionLabel size="small">Recent changes</HomeSectionLabel>
      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.day} className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/45">
              {group.day}
            </p>
            <ul className="space-y-2">
              {group.entries.map((entry) => (
                <ExecutionTimelineItem key={entry.id} entry={entry} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
