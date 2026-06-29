"use client";

import { cn } from "@/lib/utils";
import { LIBRARY_COLOR_PRESETS } from "@/types/library";

type Props = {
  value: string;
  onChange: (color: string) => void;
};

export function ColorPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {LIBRARY_COLOR_PRESETS.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={`Select color ${color}`}
          onClick={() => onChange(color)}
          className={cn(
            "h-9 w-9 rounded-full border-2 transition-transform hover:scale-105",
            value === color ? "border-white/80 scale-105" : "border-transparent"
          )}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}
