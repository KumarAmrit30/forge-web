"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { easeOut } from "@/components/home/motion";

type Props = {
  greeting: string;
  name: string;
  dateLine: string;
  brief: [string, string];
  illustration: string;
};

export function HeroSection({
  greeting,
  name,
  dateLine,
  brief,
  illustration,
}: Props) {
  const briefLines = brief.filter(Boolean);

  return (
    <section className="relative min-h-[200px] overflow-hidden pb-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-primary/[0.13] blur-[72px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 top-16 h-48 w-48 rounded-full bg-primary/[0.08] blur-[48px]"
      />

      <div className="relative z-10 max-w-[58%]">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: easeOut }}
          className="text-sm font-medium text-primary/90"
        >
          {greeting}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easeOut, delay: 0.06 }}
          className="font-serif mt-2 text-[40px] leading-none font-normal tracking-[-0.02em] text-white"
        >
          {name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: easeOut, delay: 0.1 }}
          className="mt-2 text-sm text-muted-foreground/80"
        >
          {dateLine}
        </motion.p>

        {briefLines.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: easeOut, delay: 0.14 }}
            className="mt-6 space-y-1"
          >
            {briefLines.map((line) => (
              <p
                key={line}
                className="text-[15px] leading-normal text-foreground/90"
              >
                {line}
              </p>
            ))}
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: easeOut, delay: 0.08 }}
        className="pointer-events-none absolute -right-2 -bottom-4 z-0 h-[168px] w-[192px] sm:h-[176px] sm:w-[200px]"
      >
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative h-full w-full"
        >
          <Image
            src={illustration}
            alt=""
            fill
            priority
            className="object-contain object-bottom-right"
            sizes="200px"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
