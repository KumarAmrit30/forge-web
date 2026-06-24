"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WaterReminder } from "@/types";
import { generateId } from "@/lib/id";

type NotificationState = {
  reminders: WaterReminder[];
  enabled: boolean;
  permissionGranted: boolean;
  addReminder: (time: string) => void;
  removeReminder: (id: string) => void;
  updateReminder: (id: string, updates: Partial<WaterReminder>) => void;
  setEnabled: (v: boolean) => void;
  setPermissionGranted: (v: boolean) => void;
  setReminders: (reminders: WaterReminder[]) => void;
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      reminders: [],
      enabled: true,
      permissionGranted: false,
      addReminder: (time) =>
        set({
          reminders: [
            ...get().reminders,
            { id: generateId(), time, enabled: true },
          ],
        }),
      removeReminder: (id) =>
        set({
          reminders: get().reminders.filter((r) => r.id !== id),
        }),
      updateReminder: (id, updates) =>
        set({
          reminders: get().reminders.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }),
      setEnabled: (v) => set({ enabled: v }),
      setPermissionGranted: (v) => set({ permissionGranted: v }),
      setReminders: (reminders) => set({ reminders }),
    }),
    { name: "forge-notifications" }
  )
);

export function getNotificationSnapshot() {
  const s = useNotificationStore.getState();
  return {
    reminders: s.reminders,
    enabled: s.enabled,
    permissionGranted: s.permissionGranted,
  };
}

export function hydrateNotifications(
  data: ReturnType<typeof getNotificationSnapshot>
) {
  useNotificationStore.setState(data);
}
