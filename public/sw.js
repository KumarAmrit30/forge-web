const WATER_GOAL_KEY = "forge-water-goal";
const WATER_TOTAL_KEY = "forge-water-total";
const REMINDERS_KEY = "forge-reminders";

let reminderTimers = [];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open("forge-v1").then((cache) => cache.addAll(["/"])));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SYNC_REMINDERS") {
    clearAllTimers();
    const { reminders, waterGoal } = event.data;
    if (typeof waterGoal === "number") {
      // stored for smart-stop checks
    }
    scheduleReminders(reminders, waterGoal);
  }

  if (event.data?.type === "UPDATE_WATER") {
    // Client can push current water total for smart-stop
  }
});

function clearAllTimers() {
  reminderTimers.forEach(clearTimeout);
  reminderTimers = [];
}

function scheduleReminders(reminders, waterGoal) {
  if (!reminders?.length) return;

  reminders.forEach((reminder) => {
    const [hours, minutes] = reminder.time.split(":").map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);

    const delay = target.getTime() - now.getTime();
    const timer = setTimeout(() => {
      showWaterNotification(waterGoal);
      scheduleReminders([reminder], waterGoal);
    }, delay);
    reminderTimers.push(timer);
  });
}

function showWaterNotification(waterGoal) {
  // Smart-stop: client posts UPDATE_WATER messages with today's total
  self.registration.showNotification("Forge — Hydrate", {
    body: "Time to drink water. Stay on track with your daily goal.",
    icon: "/icons/icon-192.png",
    tag: "water-reminder",
    renotify: true,
  });
}
