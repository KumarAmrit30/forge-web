"use client";

import { GlassCard } from "@/components/shared/GlassCard";
import { SettingsPageHeader } from "@/components/settings/SettingsNavCard";
import { PageShell } from "@/components/ui/page-shell";

export function SettingsAppearancePage() {
  return (
    <PageShell className="space-y-6 pb-24">
      <SettingsPageHeader
        title="Appearance"
        description="Theme and display preferences."
      />

      <GlassCard className="px-5 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Appearance settings will be available in a future update.
        </p>
        <p className="mt-2 text-xs text-muted-foreground/70">
          Forge currently uses the default dark theme.
        </p>
      </GlassCard>
    </PageShell>
  );
}
