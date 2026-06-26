"use client";

import Image from "next/image";
import { HomeSectionLabel } from "@/components/home/home-ui";
import type { TodayNextPreview } from "@/lib/today-data";

type Props = {
  preview: TodayNextPreview | null;
};

export function TodayNextCard({ preview }: Props) {
  if (!preview) return null;

  return (
    <section className="mt-5">
      <HomeSectionLabel className="mb-2.5">Next</HomeSectionLabel>
      <div className="flex items-start gap-2.5 py-0.5">
        <div className="relative mt-0.5 h-8 w-8 shrink-0 opacity-60">
          <Image
            src={preview.illustration}
            alt=""
            fill
            className="object-contain"
            sizes="32px"
          />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-medium text-foreground/90">
            {preview.title}
          </p>
          <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground/75">
            {preview.supportingLine}
          </p>
        </div>
      </div>
    </section>
  );
}
