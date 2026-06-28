"use client";

import { motion } from "framer-motion";
import { easeOut } from "@/components/home/motion";
import { homeSerif } from "@/components/home/home-ui";

type Props = {
  message: string;
};

export function ConversationEnding({ message }: Props) {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: easeOut }}
      className={`${homeSerif} pt-2 text-center text-sm italic text-muted-foreground/55`}
    >
      {message}
    </motion.p>
  );
}
