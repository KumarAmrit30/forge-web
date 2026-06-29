"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { LIBRARY_WEEKDAYS, type LibraryFrequency } from "@/types/library";

type Props = {
  value: LibraryFrequency;
  onChange: (frequency: LibraryFrequency) => void;
};

export function FrequencyEditor({ value, onChange }: Props) {
  function toggleDay(day: number) {
    const days = value.daysOfWeek.includes(day)
      ? value.daysOfWeek.filter((entry) => entry !== day)
      : [...value.daysOfWeek, day].sort((a, b) => a - b);
    onChange({ ...value, daysOfWeek: days });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["daily", "weekly", "custom"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() =>
              onChange({
                type,
                daysOfWeek:
                  type === "daily"
                    ? [0, 1, 2, 3, 4, 5, 6]
                    : type === "weekly"
                      ? [1, 3, 5]
                      : value.daysOfWeek.length
                        ? value.daysOfWeek
                        : [1, 2, 3, 4, 5],
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

      {value.type !== "daily" && (
        <div>
          <Label className="text-xs text-muted-foreground">Active days</Label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {LIBRARY_WEEKDAYS.map(({ value: day, label }) => (
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
        </div>
      )}
    </div>
  );
}
