"use client";

import { BottomNav } from "./BottomNav";
import { HydrationGate } from "./HydrationGate";
import { NotificationSync } from "./NotificationSync";
import { Toaster } from "@/components/ui/sonner";
import { OnboardingDialog } from "@/components/shared/OnboardingDialog";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <HydrationGate>
      <OnboardingDialog />
      <NotificationSync />
      <div className="mx-auto min-h-dvh w-full max-w-lg overflow-x-hidden pb-28">
        {children}
      </div>
      <BottomNav />
      <Toaster position="top-center" richColors />
    </HydrationGate>
  );
}
