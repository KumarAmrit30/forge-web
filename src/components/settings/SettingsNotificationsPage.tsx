"use client";

import { GlassCard } from "@/components/shared/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  requestNotificationPermission,
  syncRemindersToSW,
} from "@/lib/notifications";
import { useNotificationStore } from "@/stores/notificationStore";
import { SettingsPageHeader } from "@/components/settings/SettingsNavCard";
import { PageShell } from "@/components/ui/page-shell";

export function SettingsNotificationsPage() {
  const reminders = useNotificationStore((s) => s.reminders);
  const addReminder = useNotificationStore((s) => s.addReminder);
  const removeReminder = useNotificationStore((s) => s.removeReminder);
  const updateReminder = useNotificationStore((s) => s.updateReminder);
  const notifEnabled = useNotificationStore((s) => s.enabled);
  const setNotifEnabled = useNotificationStore((s) => s.setEnabled);

  return (
    <PageShell className="space-y-6 pb-24">
      <SettingsPageHeader
        title="Notifications"
        description="Water reminders and alert preferences."
      />

      <GlassCard className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Water Reminders</h2>
          <Switch
            checked={notifEnabled}
            onCheckedChange={(v) => {
              setNotifEnabled(v);
              syncRemindersToSW();
            }}
          />
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => requestNotificationPermission()}
        >
          Enable Notifications
        </Button>
        {reminders.map((r) => (
          <div key={r.id} className="flex items-center gap-2">
            <Input
              type="time"
              value={r.time}
              onChange={(e) => {
                updateReminder(r.id, { time: e.target.value });
                syncRemindersToSW();
              }}
            />
            <Switch
              checked={r.enabled}
              onCheckedChange={(v) => {
                updateReminder(r.id, { enabled: v });
                syncRemindersToSW();
              }}
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                removeReminder(r.id);
                syncRemindersToSW();
              }}
            >
              ×
            </Button>
          </div>
        ))}
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            addReminder("12:00");
            syncRemindersToSW();
          }}
        >
          Add Reminder
        </Button>
      </GlassCard>
    </PageShell>
  );
}
