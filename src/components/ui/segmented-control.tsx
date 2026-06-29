"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  layoutId: string;
  className?: string;
  size?: "sm" | "md";
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  layoutId,
  className,
  size = "md",
}: Props<T>) {
  return (
    <div
      role="tablist"
      className={cn("flex flex-wrap gap-2", className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative min-h-11 rounded-full capitalize transition-colors",
              size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
              active
                ? "text-primary"
                : "bg-white/[0.04] text-muted-foreground hover:text-foreground/80"
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-primary/15"
                transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
              />
            )}
            <span className="relative z-10 font-medium">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
