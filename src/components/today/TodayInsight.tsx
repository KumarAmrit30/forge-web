"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { assetPublicPath } from "@/lib/asset-catalog";
import { easeOut } from "@/components/home/motion";
import { HomeSectionLabel } from "@/components/home/home-ui";

type Props = {
  insight: string;
};

export function TodayInsight({ insight }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: easeOut, delay: 0.15 }}
      className="mt-6 border-t border-white/[0.03] pt-5"
    >
      <div className="flex items-start gap-2.5">
        <div className="relative mt-0.5 h-7 w-7 shrink-0 opacity-50">
          <Image
            src={assetPublicPath("ai/insight.svg")}
            alt=""
            fill
            className="object-contain"
            sizes="28px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <HomeSectionLabel size="small" className="mb-1">
            Forge noticed
          </HomeSectionLabel>
          <p className="text-[13px] leading-snug text-muted-foreground/75">
            {insight}
          </p>
        </div>
      </div>
    </motion.section>
  );
}
