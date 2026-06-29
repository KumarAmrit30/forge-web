"use client";

import { IconPicker } from "@/components/library/IconPicker";
import type { RoutineIconId } from "@/types/routine";

type Props = {
  value: RoutineIconId;
  color: string;
  onChange: (icon: RoutineIconId) => void;
};

export function RoutineIconPicker({ value, color, onChange }: Props) {
  return (
    <IconPicker
      value={value}
      color={color}
      onChange={(icon) => onChange(icon as RoutineIconId)}
    />
  );
}
