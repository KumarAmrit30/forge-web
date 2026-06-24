"use client";

import { useBlueprintStore } from "@/stores/blueprintStore";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LIFE_AREAS } from "@/types";

const SECTIONS = [
  { key: "goals" as const, label: "Goals" },
  { key: "skincare" as const, label: "Skincare" },
  { key: "haircare" as const, label: "Haircare" },
  { key: "nutrition" as const, label: "Nutrition" },
  { key: "overnightOats" as const, label: "Overnight Oats" },
  { key: "dietPlan" as const, label: "Diet Plan" },
  { key: "workoutPlan" as const, label: "Workout Plan" },
  { key: "goldenRules" as const, label: "Golden Rules" },
  { key: "trackingSystem" as const, label: "Tracking System" },
];

export function BlueprintContent() {
  const editMode = useBlueprintStore((s) => s.editMode);
  const setEditMode = useBlueprintStore((s) => s.setEditMode);
  const setSection = useBlueprintStore((s) => s.setSection);
  const setLifeArea = useBlueprintStore((s) => s.setLifeArea);
  const store = useBlueprintStore();

  return (
    <div className="space-y-6 px-4 pt-6 pb-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blueprint</h1>
          <p className="text-sm text-muted-foreground">Your transformation system</p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="edit-mode" className="text-xs">Edit</Label>
          <Switch id="edit-mode" checked={editMode} onCheckedChange={setEditMode} />
        </div>
      </header>

      <Accordion multiple defaultValue={["goals", "life-areas"]} className="space-y-2">
        <AccordionItem value="goals" className="rounded-2xl border border-border/50 px-4">
          <AccordionTrigger>Goals</AccordionTrigger>
          <AccordionContent>
            {editMode ? (
              <Textarea
                value={store.goals}
                onChange={(e) => setSection("goals", e.target.value)}
                rows={6}
              />
            ) : (
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {store.goals}
              </pre>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="life-areas" className="rounded-2xl border border-border/50 px-4">
          <AccordionTrigger>Life Areas</AccordionTrigger>
          <AccordionContent className="space-y-4">
            {LIFE_AREAS.map((area) => (
              <div key={area}>
                <p className="mb-1 text-sm font-medium">{area}</p>
                {editMode ? (
                  <Textarea
                    value={store.lifeAreas[area] ?? ""}
                    onChange={(e) => setLifeArea(area, e.target.value)}
                    rows={2}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {store.lifeAreas[area] || "—"}
                  </p>
                )}
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        {SECTIONS.filter((s) => s.key !== "goals").map(({ key, label }) => (
          <AccordionItem key={key} value={key} className="rounded-2xl border border-border/50 px-4">
            <AccordionTrigger>{label}</AccordionTrigger>
            <AccordionContent>
              {editMode ? (
                <Textarea
                  value={store[key]}
                  onChange={(e) => setSection(key, e.target.value)}
                  rows={6}
                />
              ) : (
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {store[key]}
                </pre>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
