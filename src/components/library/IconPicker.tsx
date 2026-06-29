"use client";

import { cn } from "@/lib/utils";
import {
  LIBRARY_ICON_OPTIONS,
  LibraryIconDisplay,
} from "@/components/library/LibraryIconDisplay";
import type { LibraryIconId } from "@/types/library";

type Props = {
  value: LibraryIconId;
  color: string;
  onChange: (icon: LibraryIconId) => void;
};

export function IconPicker({ value, color, onChange }: Props) {
  return (
    <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
      {LIBRARY_ICON_OPTIONS.map((icon) => (
        <button
          key={icon}
          type="button"
          aria-label={`Select ${icon} icon`}
          onClick={() => onChange(icon)}
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl border transition-colors",
            value === icon
              ? "border-primary/50 bg-primary/10"
              : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]"
          )}
        >
          <LibraryIconDisplay icon={icon} color={color} size={20} />
        </button>
      ))}
    </div>
  );
}
