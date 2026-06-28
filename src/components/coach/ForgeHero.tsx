"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { easeOut } from "@/components/home/motion";
import { HomeSectionLabel, homeSerif } from "@/components/home/home-ui";
import type { ForgeCoachHero } from "@/lib/coach/coach-types";

type Props = {
  hero: ForgeCoachHero;
};

export function ForgeHero({ hero }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: easeOut }}
      className="relative pb-2 pt-2"
    >
      <HomeSectionLabel className="mb-4">Forge</HomeSectionLabel>

      <p className="text-sm font-medium text-primary/85">{hero.greeting}</p>

      <h1
        className={`${homeSerif} mt-2 text-[36px] leading-[1.05] tracking-[-0.02em] text-white sm:text-[40px]`}
      >
        {hero.identityTitle}
      </h1>

      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground/75">
        {hero.contextualSummary}
      </p>

      <div className="relative mx-auto mt-8 flex justify-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_55%,oklch(0.72_0.15_160/0.07),transparent_72%)]"
        />
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative h-[180px] w-full max-w-[220px]"
        >
          <Image
            src={hero.illustration}
            alt=""
            fill
            priority
            className="object-contain"
            sizes="220px"
          />
        </motion.div>
      </div>
    </motion.section>
  );
}
