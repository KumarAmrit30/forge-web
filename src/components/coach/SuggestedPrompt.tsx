"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { easeOut } from "@/components/home/motion";

type Props = {
  label: string;
  index: number;
  onClick: () => void;
  disabled?: boolean;
};

export function SuggestedPrompt({ label, index, onClick, disabled }: Props) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: easeOut, delay: 0.12 + index * 0.04 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2.5",
        "text-sm text-foreground/85 transition-colors duration-300 ease-out",
        "hover:border-primary/25 hover:bg-primary/[0.06] hover:text-white",
        "disabled:pointer-events-none disabled:opacity-45"
      )}
    >
      {label}
    </motion.button>
  );
}
