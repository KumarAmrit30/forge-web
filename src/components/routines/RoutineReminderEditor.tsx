"use client";

import { ReminderEditor } from "@/components/library/ReminderEditor";
import type { RoutineReminder } from "@/types/routine";

type Props = {
  value: RoutineReminder;
  onChange: (reminder: RoutineReminder) => void;
};

export function RoutineReminderEditor({ value, onChange }: Props) {
  return (
    <ReminderEditor
      value={value}
      onChange={onChange}
      description="Get notified when it's time for this routine."
    />
  );
}
