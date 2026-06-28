"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { easeOut } from "@/components/home/motion";

type Props = {
  message?: string;
};

export function ExecutionStatus({ message = "Applying change…" }: Props) {
  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: easeOut }}
      className="flex items-center gap-2 text-sm text-muted-foreground/75"
    >
      <Loader2
        className="h-4 w-4 animate-spin text-primary/70"
        strokeWidth={1.75}
        aria-hidden
      />
      <span>{message}</span>
    </motion.div>
  );
}
