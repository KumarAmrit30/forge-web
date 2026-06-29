"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { assetPublicPath } from "@/lib/asset-catalog";
import { easeOut } from "@/components/home/motion";
import { HomeSectionLabel, HomeSurfaceCard } from "@/components/home/home-ui";

type Props = {
  insight: string;
  learnWhyHref?: string;
};

export function ForgeInsight({ insight, learnWhyHref }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOut, delay: 0.24 }}
      className="forge-section-gap"
    >
      <HomeSurfaceCard elevation="insight" className="px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex items-start gap-4">
          <div className="relative h-16 w-16 shrink-0">
            <Image
              src={assetPublicPath("ai/insight.svg")}
              alt=""
              fill
              className="object-contain"
              sizes="64px"
            />
          </div>

          <div className="min-w-0 flex-1">
            <HomeSectionLabel size="small" className="mb-3">
              Forge noticed
            </HomeSectionLabel>
            <p className="text-base leading-normal text-foreground/95">
              {insight}
            </p>
            {learnWhyHref && (
              <a
                href={learnWhyHref}
                className="mt-3 inline-block text-sm text-primary/80 transition-colors hover:text-primary"
              >
                Learn Why →
              </a>
            )}
          </div>
        </div>
      </HomeSurfaceCard>
    </motion.section>
  );
}
