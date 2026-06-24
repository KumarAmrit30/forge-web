import { useNotificationStore } from "@/stores/notificationStore";
import { useWaterStore } from "@/stores/waterStore";
import { useSettingsStore } from "@/stores/settingsStore";

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  const permission = await Notification.requestPermission();
  const granted = permission === "granted";
  useNotificationStore.getState().setPermissionGranted(granted);
  return granted;
}

export function registerServiceWorker(): void {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(console.error);
  }
}

export function syncRemindersToSW(): void {
  if (!("serviceWorker" in navigator)) return;
  const { reminders, enabled } = useNotificationStore.getState();
  const waterGoal = useSettingsStore.getState().profile.dailyWaterGoal;

  navigator.serviceWorker.ready.then((reg) => {
    reg.active?.postMessage({
      type: "SYNC_REMINDERS",
      reminders: enabled ? reminders.filter((r) => r.enabled) : [],
      waterGoal,
    });
  });
}

export function notifyWaterReminder(): void {
  const todayTotal = useWaterStore.getState().getTodayTotal();
  const waterGoal = useSettingsStore.getState().profile.dailyWaterGoal;
  if (todayTotal >= waterGoal) return;

  if (Notification.permission === "granted") {
    new Notification("Forge — Hydrate", {
      body: `You've had ${(todayTotal / 1000).toFixed(1)}L. Goal: ${(waterGoal / 1000).toFixed(1)}L`,
      icon: "/icons/icon-192.png",
      tag: "water-reminder",
    });
  }
}
