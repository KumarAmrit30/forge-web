"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function CoachInput({
  onSend,
  disabled,
  placeholder = "Ask Forge anything…",
}: Props) {
  const [value, setValue] = useState("");

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <div className="mt-6 border-t border-white/[0.05] pt-4">
      <div className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSubmit();
            }
          }}
          rows={2}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "min-h-[52px] flex-1 resize-none rounded-[18px] border border-white/[0.08]",
            "bg-white/[0.03] px-4 py-3 text-sm text-foreground/90",
            "placeholder:text-muted-foreground/45",
            "focus:border-primary/30 focus:outline-none focus:ring-0",
            "disabled:opacity-45"
          )}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
            "bg-primary text-primary-foreground",
            "shadow-[0_0_20px_-4px_oklch(0.72_0.15_160/0.45)]",
            "transition-[transform,opacity] duration-300 ease-out",
            "hover:-translate-y-0.5 disabled:opacity-40"
          )}
        >
          <ArrowUp className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
