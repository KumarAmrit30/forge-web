"use client";

import { useMemo } from "react";
import { useCheckpointStore } from "@/stores/checkpointStore";
import { GlassCard } from "@/components/shared/GlassCard";

export function CheckpointTimeline() {
  const allCheckpoints = useCheckpointStore((s) => s.checkpoints);
  const checkpoints = useMemo(
    () => [...allCheckpoints].sort((a, b) => b.month.localeCompare(a.month)),
    [allCheckpoints]
  );

  if (!checkpoints.length) {
    return (
      <GlassCard>
        <p className="text-sm text-muted-foreground">
          No monthly checkpoints yet. Add your first this month.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      {checkpoints.map((cp) => (
        <GlassCard key={cp.id} className="space-y-2">
          <p className="font-semibold">{cp.month}</p>
          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            {cp.weight && <span>Weight: {cp.weight} kg</span>}
            {cp.measurements.waist && <span>Waist: {cp.measurements.waist} cm</span>}
            {cp.measurements.chest && <span>Chest: {cp.measurements.chest} cm</span>}
            {cp.measurements.arms && <span>Arms: {cp.measurements.arms} cm</span>}
          </div>
          {cp.progressNotes && (
            <p className="text-sm">{cp.progressNotes}</p>
          )}
        </GlassCard>
      ))}
    </div>
  );
}
