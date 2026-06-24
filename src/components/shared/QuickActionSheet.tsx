"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { updateTodayRecord } from "@/lib/sync-day";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "protein" | "notes";
  initialValue?: string | number;
};

export function QuickActionSheet({
  open,
  onOpenChange,
  type,
  initialValue = "",
}: Props) {
  const [value, setValue] = useState(String(initialValue));

  const save = () => {
    if (type === "protein") {
      const protein = parseInt(value, 10);
      if (!isNaN(protein)) updateTodayRecord({ proteinG: protein });
    } else {
      updateTodayRecord({ notes: value });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {type === "protein" ? "Log Protein" : "Add Note"}
          </DialogTitle>
        </DialogHeader>
        {type === "protein" ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              onBlur={save}
              className="text-2xl font-semibold tabular-nums"
              autoFocus
            />
            <span className="text-muted-foreground">g</span>
          </div>
        ) : (
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={save}
            placeholder="Today's note..."
            autoFocus
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
