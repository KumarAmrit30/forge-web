"use client";

import { BottomNav } from "./BottomNav";
import { ForgeInitializer } from "./ForgeInitializer";
import { Toaster } from "@/components/ui/sonner";
import { NotificationSync } from "./NotificationSync";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ForgeInitializer />
      <NotificationSync />
      <div className="mx-auto min-h-screen max-w-lg pb-24">
        {children}
      </div>
      <BottomNav />
      <Toaster position="top-center" richColors />
    </>
  );
}
