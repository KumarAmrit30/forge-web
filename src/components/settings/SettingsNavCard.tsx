"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export function SettingsNavCard({ href, title, description, icon: Icon }: Props) {
  return (
    <Link href={href} className="block focus-ring rounded-[24px]">
      <GlassCard className="flex items-center gap-4 !px-4 !py-4 transition-[transform,background-color] duration-200 hover:bg-white/[0.04] active:scale-[0.99]">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </GlassCard>
    </Link>
  );
}

export function SettingsPageHeader({
  title,
  description,
  backHref = "/settings",
  backLabel = "Settings",
}: {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <header className="space-y-2">
      <Link
        href={backHref}
        className={cn("text-sm text-primary hover:underline")}
      >
        ← {backLabel}
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );
}
