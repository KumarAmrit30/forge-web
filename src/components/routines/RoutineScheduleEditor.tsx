"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ROUTINE_WEEKDAYS, type RoutineSchedule } from "@/types/routine";

type Props = {
  value: RoutineSchedule;
  onChange: (schedule: RoutineSchedule) => void;
};

export function RoutineScheduleEditor({ value, onChange }: Props) {
  function toggleDay(day: number) {
    const days = value.daysOfWeek.includes(day)
      ? value.daysOfWeek.filter((entry) => entry !== day)
      : [...value.daysOfWeek, day].sort((a, b) => a - b);
    onChange({ ...value, daysOfWeek: days });
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["daily", "weekly"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() =>
              onChange({
                ...value,
                type,
                daysOfWeek:
                  type === "daily" ? [0, 1, 2, 3, 4, 5, 6] : value.daysOfWeek,
              })
            }
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors",
              value.type === type
                ? "bg-primary/15 text-primary"
                : "bg-white/[0.04] text-muted-foreground hover:text-foreground"
            )}
          >
            {type}
          </button>
        ))}
      </div>

      {value.type === "weekly" && (
        <div className="flex flex-wrap gap-1.5">
          {ROUTINE_WEEKDAYS.map(({ value: day, label }) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={cn(
                "min-w-[2.5rem] rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
                value.daysOfWeek.includes(day)
                  ? "bg-primary/15 text-primary"
                  : "bg-white/[0.04] text-muted-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div>
        <Label className="text-xs text-muted-foreground">Preferred time</Label>
        <Input
          type="time"
          value={value.time}
          onChange={(event) => onChange({ ...value, time: event.target.value })}
          className="mt-1.5"
        />
      </div>
    </div>
  );
}
