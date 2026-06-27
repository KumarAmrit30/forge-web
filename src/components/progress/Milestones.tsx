"use client";

import { HomeSectionLabel } from "@/components/home/home-ui";
import { MilestoneCard } from "@/components/progress/MilestoneCard";
import type { MilestoneModel } from "@/lib/progress-data";

type Props = {
  milestones: MilestoneModel[];
};

export function Milestones({ milestones }: Props) {
  return (
    <section className="mt-12">
      <HomeSectionLabel className="mb-5">Milestones</HomeSectionLabel>
      <div className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {milestones.map((milestone, index) => (
          <MilestoneCard
            key={milestone.id}
            milestone={milestone}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
