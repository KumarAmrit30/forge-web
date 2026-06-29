"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { IconPicker } from "@/components/library/IconPicker";
import { ColorPicker } from "@/components/library/ColorPicker";
import { FrequencyEditor } from "@/components/library/FrequencyEditor";
import { ReminderEditor } from "@/components/library/ReminderEditor";
import { cn } from "@/lib/utils";
import { HABIT_CATEGORIES, type Habit, type HabitCategory } from "@/types/habit";

type Props = {
  value: Habit;
  onChange: (patch: Partial<Habit>) => void;
};

export function HabitForm({ value, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="habit-title">Title</Label>
        <Input
          id="habit-title"
          value={value.title}
          onChange={(event) => onChange({ title: event.target.value })}
          placeholder="Drink 3.5L water"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="habit-description">Description</Label>
        <Textarea
          id="habit-description"
          value={value.description ?? ""}
          onChange={(event) => onChange({ description: event.target.value })}
          placeholder="Why this habit matters"
          rows={3}
        />
      </div>

      <div className="space-y-3">
        <Label>Category</Label>
        <div className="flex flex-wrap gap-2">
          {HABIT_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onChange({ category: category as HabitCategory })}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                value.category === category
                  ? "bg-primary/15 text-primary"
                  : "bg-white/[0.04] text-muted-foreground"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Icon</Label>
        <IconPicker
          value={value.icon}
          color={value.color}
          onChange={(icon) => onChange({ icon })}
        />
      </div>

      <div className="space-y-3">
        <Label>Color</Label>
        <ColorPicker value={value.color} onChange={(color) => onChange({ color })} />
      </div>

      <div className="space-y-3">
        <Label>Frequency</Label>
        <FrequencyEditor
          value={value.frequency}
          onChange={(frequency) => onChange({ frequency })}
        />
      </div>

      <ReminderEditor
        value={value.reminder}
        onChange={(reminder) => onChange({ reminder })}
        description="Get notified when it's time for this habit."
      />

      <div className="space-y-3">
        <Label htmlFor="habit-notes">Notes</Label>
        <Textarea
          id="habit-notes"
          value={value.notes ?? ""}
          onChange={(event) => onChange({ notes: event.target.value })}
          placeholder="Private notes about this habit"
          rows={4}
        />
      </div>
    </div>
  );
}
