"use client";

import Link from "next/link";
import { GlassCard } from "@/components/shared/GlassCard";
import { SettingsPageHeader } from "@/components/settings/SettingsNavCard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/ui/page-shell";

export function SettingsAboutPage() {
  return (
    <PageShell className="space-y-6 pb-24">
      <SettingsPageHeader
        title="About Forge"
        description="Built Daily. — Your personal transformation operating system."
      />

      <GlassCard className="space-y-4 px-5 py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">
            Version
          </p>
          <p className="mt-1 text-sm text-foreground">Forge 0.1.0</p>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Forge helps you understand your wellbeing through calm, evidence-aware
          coaching — connecting routines, habits, and progress into one daily
          experience.
        </p>
        <Link
          href="/settings/profile"
          className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
        >
          Edit profile & goals
        </Link>
      </GlassCard>
    </PageShell>
  );
}
