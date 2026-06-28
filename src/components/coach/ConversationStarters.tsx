"use client";

import { motion } from "framer-motion";
import { easeOut } from "@/components/home/motion";
import { SuggestedPrompt } from "@/components/coach/SuggestedPrompt";
import { HomeSectionLabel } from "@/components/home/home-ui";
import type { ConversationStarter } from "@/lib/coach/coach-types";

type Props = {
  starters: ConversationStarter[];
  onSelect: (starter: ConversationStarter) => void;
  disabled?: boolean;
};

export function ConversationStarters({
  starters,
  onSelect,
  disabled,
}: Props) {
  if (starters.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOut, delay: 0.1 }}
      className="mt-10"
    >
      <HomeSectionLabel className="mb-4">Start a conversation</HomeSectionLabel>
      <div className="flex flex-wrap gap-2.5">
        {starters.map((starter, index) => (
          <SuggestedPrompt
            key={starter.id}
            label={starter.label}
            index={index}
            onClick={() => onSelect(starter)}
            disabled={disabled}
          />
        ))}
      </div>
    </motion.section>
  );
}
