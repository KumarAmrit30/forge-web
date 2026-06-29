"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RoutineIconPicker } from "@/components/routines/RoutineIconPicker";
import { RoutineColorPicker } from "@/components/routines/RoutineColorPicker";
import { RoutineScheduleEditor } from "@/components/routines/RoutineScheduleEditor";
import { RoutineReminderEditor } from "@/components/routines/RoutineReminderEditor";
import { cn } from "@/lib/utils";
import type { Routine, RoutinePeriod } from "@/types/routine";

type Props = {
  value: Routine;
  onChange: (patch: Partial<Routine>) => void;
};

export function RoutineForm({ value, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="routine-title">Title</Label>
        <Input
          id="routine-title"
          value={value.title}
          onChange={(event) => onChange({ title: event.target.value })}
          placeholder="Morning skincare"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="routine-description">Description</Label>
        <Textarea
          id="routine-description"
          value={value.description ?? ""}
          onChange={(event) => onChange({ description: event.target.value })}
          placeholder="What is this routine for?"
          rows={3}
        />
      </div>

      <div className="space-y-3">
        <Label>Period</Label>
        <div className="flex gap-2">
          {(["morning", "night"] as RoutinePeriod[]).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => onChange({ period })}
              className={cn(
                "rounded-full px-4 py-2 text-sm capitalize transition-colors",
                value.period === period
                  ? "bg-primary/15 text-primary"
                  : "bg-white/[0.04] text-muted-foreground"
              )}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Icon</Label>
        <RoutineIconPicker
          value={value.icon}
          color={value.color}
          onChange={(icon) => onChange({ icon })}
        />
      </div>

      <div className="space-y-3">
        <Label>Color</Label>
        <RoutineColorPicker
          value={value.color}
          onChange={(color) => onChange({ color })}
        />
      </div>

      <div className="space-y-3">
        <Label>Schedule</Label>
        <RoutineScheduleEditor
          value={value.schedule}
          onChange={(schedule) => onChange({ schedule })}
        />
      </div>

      <RoutineReminderEditor
        value={value.reminder}
        onChange={(reminder) => onChange({ reminder })}
      />

      <div className="space-y-3">
        <Label htmlFor="routine-notes">Notes</Label>
        <Textarea
          id="routine-notes"
          value={value.notes ?? ""}
          onChange={(event) => onChange({ notes: event.target.value })}
          placeholder="Private notes about this routine"
          rows={4}
        />
      </div>
    </div>
  );
}
