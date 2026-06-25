"use client";

import { useState, useRef } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { GlassCard } from "@/components/shared/GlassCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { exportDataBackup, exportFullBackup, importBackup } from "@/lib/backup";
import {
  requestNotificationPermission,
  syncRemindersToSW,
} from "@/lib/notifications";
import { useNotificationStore } from "@/stores/notificationStore";
import { runSeed } from "@/lib/seed";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function SettingsContent() {
  const profile = useSettingsStore((s) => s.profile);
  const setProfile = useSettingsStore((s) => s.setProfile);
  const reminders = useNotificationStore((s) => s.reminders);
  const addReminder = useNotificationStore((s) => s.addReminder);
  const removeReminder = useNotificationStore((s) => s.removeReminder);
  const updateReminder = useNotificationStore((s) => s.updateReminder);
  const notifEnabled = useNotificationStore((s) => s.enabled);
  const setNotifEnabled = useNotificationStore((s) => s.setEnabled);

  const fileRef = useRef<HTMLInputElement>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setImportOpen(true);
  };

  const confirmImport = async () => {
    if (!pendingFile) return;
    try {
      await importBackup(pendingFile);
      toast.success("Backup restored successfully");
    } catch {
      toast.error("Failed to import backup");
    } finally {
      setImportOpen(false);
      setPendingFile(null);
    }
  };

  const reseed = () => {
    useSettingsStore.getState().setHasSeeded(false);
    runSeed();
    toast.success("Blueprint and routines re-seeded");
  };

  return (
    <div className="space-y-6 px-4 pt-6 pb-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Profile, notifications, and data safety.
        </p>
      </header>

      <GlassCard className="space-y-4">
        <h2 className="font-semibold">Profile</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label className="text-xs">Name</Label>
            <Input
              value={profile.name}
              onChange={(e) => setProfile({ name: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs">Current Weight (kg)</Label>
            <Input
              type="number"
              step="0.1"
              value={profile.currentWeight}
              onChange={(e) =>
                setProfile({ currentWeight: parseFloat(e.target.value) })
              }
            />
          </div>
          <div>
            <Label className="text-xs">Target Weight (kg)</Label>
            <Input
              type="number"
              step="0.1"
              value={profile.targetWeight}
              onChange={(e) =>
                setProfile({ targetWeight: parseFloat(e.target.value) })
              }
            />
          </div>
          <div>
            <Label className="text-xs">Protein (g/day)</Label>
            <Input
              type="number"
              value={profile.dailyProteinGoal}
              onChange={(e) =>
                setProfile({ dailyProteinGoal: parseInt(e.target.value, 10) })
              }
            />
          </div>
          <div>
            <Label className="text-xs">Water (ml/day)</Label>
            <Input
              type="number"
              value={profile.dailyWaterGoal}
              onChange={(e) =>
                setProfile({ dailyWaterGoal: parseInt(e.target.value, 10) })
              }
            />
          </div>
          <div>
            <Label className="text-xs">Sleep (h)</Label>
            <Input
              type="number"
              step="0.5"
              value={profile.dailySleepGoal}
              onChange={(e) =>
                setProfile({ dailySleepGoal: parseFloat(e.target.value) })
              }
            />
          </div>
          <div>
            <Label className="text-xs">Steps</Label>
            <Input
              type="number"
              value={profile.dailyStepsGoal}
              onChange={(e) =>
                setProfile({ dailyStepsGoal: parseInt(e.target.value, 10) })
              }
            />
          </div>
        </div>
      </GlassCard>

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

      <GlassCard className="space-y-3">
        <h2 className="font-semibold">Backup & Restore</h2>
        <p className="text-xs text-muted-foreground">
          All data stays on this device. Export regularly for safety.
        </p>
        <Button className="w-full" variant="secondary" onClick={() => exportDataBackup()}>
          Export Data (forge-backup.json)
        </Button>
        <Button className="w-full" variant="secondary" onClick={() => exportFullBackup()}>
          Export Full (+ photos)
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button className="w-full" variant="outline" onClick={() => fileRef.current?.click()}>
          Import Backup
        </Button>
        <Button className="w-full" variant="ghost" onClick={reseed}>
          Re-seed from Blueprint defaults
        </Button>
      </GlassCard>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Import backup?</DialogTitle>
            <DialogDescription>
              This replaces all local Forge data with{" "}
              <strong>{pendingFile?.name}</strong>. Export first if unsure.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmImport}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
