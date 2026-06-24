"use client";

import { useEffect } from "react";
import { runSeed } from "@/lib/seed";
import {
  registerServiceWorker,
  requestNotificationPermission,
  syncRemindersToSW,
} from "@/lib/notifications";
import { syncTodayFromStores } from "@/lib/sync-day";

export function ForgeInitializer() {
  useEffect(() => {
    runSeed();
    syncTodayFromStores();
    registerServiceWorker();

    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        syncRemindersToSW();
      } else if (Notification.permission !== "denied") {
        requestNotificationPermission().then((granted) => {
          if (granted) syncRemindersToSW();
        });
      }
    }
  }, []);

  return null;
}
