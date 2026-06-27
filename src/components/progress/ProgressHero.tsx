"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { easeOut } from "@/components/home/motion";
import { HomeSectionLabel, homeSerif } from "@/components/home/home-ui";
import type { ProgressHeroModel } from "@/lib/progress-data";

type Props = {
  hero: ProgressHeroModel;
};

export function ProgressHero({ hero }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: easeOut }}
      className="relative pb-4 pt-2 text-center"
    >
      <HomeSectionLabel className="mb-5">{hero.label}</HomeSectionLabel>

      <h1
        className={`${homeSerif} text-[40px] leading-[1.05] tracking-[-0.02em] text-white sm:text-[44px]`}
      >
        {hero.identityTitle}
      </h1>

      <div className="mx-auto mt-6 max-w-sm space-y-2">
        {hero.reflection.map((line) => (
          <p
            key={line}
            className="text-[15px] leading-relaxed text-muted-foreground/75"
          >
            {line}
          </p>
        ))}
      </div>

      <div className="relative mx-auto mt-12 flex justify-center">
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
          className="relative h-[240px] w-full max-w-[260px] sm:h-[260px]"
        >
          <Image
            src={hero.illustration}
            alt=""
            fill
            priority
            className="object-contain"
            sizes="260px"
          />
        </motion.div>
      </div>
    </motion.section>
  );
}
