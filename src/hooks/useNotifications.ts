"use client";

import { useEffect } from "react";
import { syncRemindersToSW } from "@/lib/notifications";
import { useWaterStore } from "@/stores/waterStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { todayKey } from "@/lib/date-utils";

export function useNotifications() {
  const today = todayKey();
  const total = useWaterStore((s) => s.dailyLogs[today]?.totalMl ?? 0);
  const reminders = useNotificationStore((s) => s.reminders);
  const enabled = useNotificationStore((s) => s.enabled);

  useEffect(() => {
    syncRemindersToSW();
  }, [reminders, enabled]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.active?.postMessage({
          type: "UPDATE_WATER",
          total,
        });
      });
    }
  }, [total]);
}
