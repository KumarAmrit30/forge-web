"use client";

import { motion } from "framer-motion";
import { SuggestedPrompt } from "@/components/coach/SuggestedPrompt";
import { HomeSectionLabel } from "@/components/home/home-ui";
import type { FollowUpChip } from "@/lib/coach/conversation-experience";

type Props = {
  chips: FollowUpChip[];
  onSelect: (question: string) => void;
  disabled?: boolean;
};

export function FollowUpChips({ chips, onSelect, disabled }: Props) {
  if (chips.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0, 0, 0.2, 1] }}
      className="pt-3"
    >
      <HomeSectionLabel size="small" className="mb-3">
        Continue
      </HomeSectionLabel>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip, index) => (
          <SuggestedPrompt
            key={chip.id}
            label={chip.label}
            index={index}
            onClick={() => onSelect(chip.question)}
            disabled={disabled}
          />
        ))}
      </div>
    </motion.div>
  );
}
