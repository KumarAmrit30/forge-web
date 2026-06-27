"use client";

import { HomeSectionLabel } from "@/components/home/home-ui";
import { TimelineItem } from "@/components/progress/TimelineItem";
import type { GrowthTimelineEvent } from "@/lib/progress-data";

type Props = {
  events: GrowthTimelineEvent[];
};

export function GrowthTimeline({ events }: Props) {
  return (
    <section className="mt-12">
      <HomeSectionLabel className="mb-8">Growth Timeline</HomeSectionLabel>
      <ul className="relative">
        {events.map((event, index) => (
          <TimelineItem
            key={event.id}
            event={event}
            index={index}
            isLast={index === events.length - 1}
          />
        ))}
      </ul>
    </section>
  );
}
