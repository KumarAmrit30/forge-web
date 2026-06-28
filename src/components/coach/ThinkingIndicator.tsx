"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { assetPublicPath } from "@/lib/asset-catalog";
import { easeOut } from "@/components/home/motion";

type Props = {
  message?: string | null;
};

export function ThinkingIndicator({ message }: Props) {
  const label = message ?? "Reviewing your recent patterns…";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.3, ease: easeOut }}
      className="flex items-start gap-3 py-3"
    >
      <div className="relative mt-0.5 h-8 w-8 shrink-0 opacity-80">
        <Image
          src={assetPublicPath("ai/thinking.svg")}
          alt=""
          fill
          className="object-contain"
          sizes="32px"
        />
      </div>
      <p className="pt-1.5 text-sm leading-relaxed text-muted-foreground/70">
        {label}
      </p>
    </motion.div>
  );
}
