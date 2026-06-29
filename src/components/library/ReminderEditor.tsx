"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { LibraryReminder } from "@/types/library";

type Props = {
  value: LibraryReminder;
  onChange: (reminder: LibraryReminder) => void;
  description?: string;
};

export function ReminderEditor({
  value,
  onChange,
  description = "Get notified when it's time.",
}: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Reminder</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Switch
          checked={value.enabled}
          onCheckedChange={(enabled) => onChange({ ...value, enabled })}
        />
      </div>
      {value.enabled && (
        <div>
          <Label className="text-xs text-muted-foreground">Reminder time</Label>
          <Input
            type="time"
            value={value.time}
            onChange={(event) => onChange({ ...value, time: event.target.value })}
            className="mt-1.5"
          />
        </div>
      )}
    </div>
  );
}
