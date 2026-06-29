"use client";

import {
  ListChecks,
  Target,
  Palette,
  Bell,
  Database,
  ArrowDownUp,
  Info,
  User,
} from "lucide-react";
import { SettingsNavCard } from "@/components/settings/SettingsNavCard";
import { PageShell } from "@/components/ui/page-shell";

const cards = [
  {
    href: "/settings/profile",
    title: "Profile & Goals",
    description: "Name, targets, and daily goals.",
    icon: User,
  },
  {
    href: "/routines",
    title: "Routine Library",
    description: "Morning and evening routines with checklist steps.",
    icon: ListChecks,
  },
  {
    href: "/habits",
    title: "Habit Library",
    description: "Daily habits, frequency, and reminders.",
    icon: Target,
  },
  {
    href: "/settings/appearance",
    title: "Appearance",
    description: "Theme and display preferences.",
    icon: Palette,
  },
  {
    href: "/settings/notifications",
    title: "Notifications",
    description: "Water reminders and alert preferences.",
    icon: Bell,
  },
  {
    href: "/settings/backup",
    title: "Backup / Restore",
    description: "Export and restore your Forge data.",
    icon: Database,
  },
  {
    href: "/settings/import-export",
    title: "Import / Export",
    description: "Move data on or off this device.",
    icon: ArrowDownUp,
  },
  {
    href: "/settings/about",
    title: "About Forge",
    description: "Version, philosophy, and support.",
    icon: Info,
  },
];

export function SettingsHub() {
  return (
    <PageShell className="space-y-6 pb-24">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Libraries, preferences, and data management.
        </p>
      </header>

      <div className="space-y-3">
        {cards.map((card) => (
          <SettingsNavCard key={card.href} {...card} />
        ))}
      </div>
    </PageShell>
  );
}
