"use client";

import { useNotifications } from "@/hooks/useNotifications";

export function NotificationSync() {
  useNotifications();
  return null;
}
