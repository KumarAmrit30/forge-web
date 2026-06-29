"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { easeOut } from "@/components/home/motion";
import {
  HomeCircleAction,
  HomeSectionLabel,
  HomeSurfaceCard,
  homeSerif,
} from "@/components/home/home-ui";
import type { HomeMission } from "@/lib/home-data";

type Props = {
  mission: HomeMission;
};

export function MissionCard({ mission }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: easeOut, delay: 0.1 }}
    >
      <Link href={mission.href} className="group block focus-ring rounded-[24px]">
        <HomeSurfaceCard elevation="mission" interactive className="px-5 py-5 sm:px-6 sm:py-6">
          <HomeSectionLabel>Today&apos;s Focus</HomeSectionLabel>

          <div className="mt-4 flex items-center gap-4">
            <div className="relative h-24 w-24 shrink-0">
              <Image
                src={mission.illustration}
                alt=""
                fill
                className="object-contain object-left"
                sizes="96px"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h2
                className={`${homeSerif} text-[26px] leading-tight text-white sm:text-[28px]`}
              >
                {mission.title}
              </h2>
              {mission.isRestDay ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {mission.subtitle}
                </p>
              ) : (
                <p className="mt-1 text-[13px] tabular-nums text-muted-foreground">
                  {mission.duration}
                </p>
              )}
            </div>

            <HomeCircleAction />
          </div>
        </HomeSurfaceCard>
      </Link>
    </motion.section>
  );
}
