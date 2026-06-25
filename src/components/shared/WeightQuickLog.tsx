"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useProgressStore } from "@/stores/progressStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { updateTodayRecord } from "@/lib/sync-day";
import { todayKey } from "@/lib/date-utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function WeightQuickLog({ open, onOpenChange }: Props) {
  const weightLogs = useProgressStore((s) => s.weightLogs);
  const profile = useSettingsStore((s) => s.profile);

  const latestWeight = useMemo(() => {
    if (!weightLogs.length) return null;
    return weightLogs[weightLogs.length - 1].weightKg;
  }, [weightLogs]);

  const [value, setValue] = useState(
    latestWeight?.toString() ?? profile.currentWeight.toString()
  );

  const save = () => {
    const weight = parseFloat(value);
    if (isNaN(weight) || weight <= 0) return;
    useProgressStore.getState().logWeight(todayKey(), weight);
    useSettingsStore.getState().setProfile({ currentWeight: weight });
    updateTodayRecord({ weightKg: weight });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs rounded-2xl">
        <DialogHeader>
          <DialogTitle>Log Weight</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            step="0.1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            onBlur={save}
            className="text-2xl font-semibold tabular-nums"
            autoFocus
          />
          <span className="text-muted-foreground">kg</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
