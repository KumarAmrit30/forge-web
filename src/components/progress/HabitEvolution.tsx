"use client";

import { HomeSectionLabel } from "@/components/home/home-ui";
import { HabitCard } from "@/components/progress/HabitCard";
import type { HabitEvolutionModel } from "@/lib/progress-data";

type Props = {
  habits: HabitEvolutionModel[];
};

export function HabitEvolution({ habits }: Props) {
  return (
    <section className="mt-12">
      <HomeSectionLabel className="mb-6">Habit Evolution</HomeSectionLabel>
      <div className="space-y-4">
        {habits.map((habit, index) => (
          <HabitCard key={habit.id} habit={habit} index={index} />
        ))}
      </div>
    </section>
  );
}
