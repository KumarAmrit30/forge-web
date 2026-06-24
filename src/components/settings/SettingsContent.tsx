"use client";

import { useState, useRef } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useGoalStore } from "@/stores/goalStore";
import { useHabitStore } from "@/stores/habitStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { GlassCard } from "@/components/shared/GlassCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { WorkoutEditor } from "@/components/workout/WorkoutEditor";
import { ReviewHistory } from "@/components/review/ReviewHistory";
import { exportDataBackup, exportFullBackup, importBackup } from "@/lib/backup";
import {
  requestNotificationPermission,
  syncRemindersToSW,
} from "@/lib/notifications";
import { generateId } from "@/lib/id";
import { toast } from "sonner";

export function SettingsContent() {
  const profile = useSettingsStore((s) => s.profile);
  const setProfile = useSettingsStore((s) => s.setProfile);
  const goals = useGoalStore((s) => s.goals);
  const addGoal = useGoalStore((s) => s.addGoal);
  const removeGoal = useGoalStore((s) => s.removeGoal);
  const habits = useHabitStore((s) => s.habits);
  const addHabit = useHabitStore((s) => s.addHabit);
  const removeHabit = useHabitStore((s) => s.removeHabit);
  const reminders = useNotificationStore((s) => s.reminders);
  const addReminder = useNotificationStore((s) => s.addReminder);
  const removeReminder = useNotificationStore((s) => s.removeReminder);
  const updateReminder = useNotificationStore((s) => s.updateReminder);
  const notifEnabled = useNotificationStore((s) => s.enabled);
  const setNotifEnabled = useNotificationStore((s) => s.setEnabled);

  const fileRef = useRef<HTMLInputElement>(null);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newHabitTitle, setNewHabitTitle] = useState("");

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importBackup(file);
      toast.success("Backup restored successfully");
    } catch {
      toast.error("Failed to import backup");
    }
  };

  return (
    <div className="space-y-6 px-4 pt-6 pb-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Forge — Built Daily.</p>
      </header>

      <GlassCard className="space-y-4">
        <h2 className="font-semibold">Profile & Targets</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Name</Label>
            <Input value={profile.name} onChange={(e) => setProfile({ name: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Current Weight</Label>
            <Input type="number" value={profile.currentWeight} onChange={(e) => setProfile({ currentWeight: parseFloat(e.target.value) })} />
          </div>
          <div>
            <Label className="text-xs">Target Weight</Label>
            <Input type="number" value={profile.targetWeight} onChange={(e) => setProfile({ targetWeight: parseFloat(e.target.value) })} />
          </div>
          <div>
            <Label className="text-xs">Protein (g)</Label>
            <Input type="number" value={profile.dailyProteinGoal} onChange={(e) => setProfile({ dailyProteinGoal: parseInt(e.target.value, 10) })} />
          </div>
          <div>
            <Label className="text-xs">Water (ml)</Label>
            <Input type="number" value={profile.dailyWaterGoal} onChange={(e) => setProfile({ dailyWaterGoal: parseInt(e.target.value, 10) })} />
          </div>
          <div>
            <Label className="text-xs">Sleep (h)</Label>
            <Input type="number" value={profile.dailySleepGoal} onChange={(e) => setProfile({ dailySleepGoal: parseFloat(e.target.value) })} />
          </div>
          <div>
            <Label className="text-xs">Steps</Label>
            <Input type="number" value={profile.dailyStepsGoal} onChange={(e) => setProfile({ dailyStepsGoal: parseInt(e.target.value, 10) })} />
          </div>
        </div>
      </GlassCard>

      <GlassCard className="space-y-3">
        <h2 className="font-semibold">Goals</h2>
        {goals.map((g) => (
          <div key={g.id} className="flex items-center justify-between text-sm">
            <span>{g.title}</span>
            <Button size="sm" variant="ghost" onClick={() => removeGoal(g.id)}>Remove</Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Input placeholder="New goal..." value={newGoalTitle} onChange={(e) => setNewGoalTitle(e.target.value)} />
          <Button size="sm" onClick={() => {
            if (!newGoalTitle) return;
            addGoal({ id: generateId(), title: newGoalTitle, category: "Custom", current: 0, target: 100, unit: "%", active: true });
            setNewGoalTitle("");
          }}>Add</Button>
        </div>
      </GlassCard>

      <GlassCard className="space-y-3">
        <h2 className="font-semibold">Habits</h2>
        {habits.filter(h => h.active).map((h) => (
          <div key={h.id} className="flex items-center justify-between text-sm">
            <span>{h.title} <span className="text-muted-foreground">({h.category})</span></span>
            <Button size="sm" variant="ghost" onClick={() => removeHabit(h.id)}>Remove</Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Input placeholder="New habit..." value={newHabitTitle} onChange={(e) => setNewHabitTitle(e.target.value)} />
          <Button size="sm" onClick={() => {
            if (!newHabitTitle) return;
            addHabit({ id: generateId(), title: newHabitTitle, category: "Custom", frequency: "daily", active: true });
            setNewHabitTitle("");
          }}>Add</Button>
        </div>
      </GlassCard>

      <GlassCard className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Water Reminders</h2>
          <Switch checked={notifEnabled} onCheckedChange={(v) => {
            setNotifEnabled(v);
            syncRemindersToSW();
          }} />
        </div>
        <Button size="sm" variant="secondary" onClick={() => requestNotificationPermission()}>
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
            <Button size="icon" variant="ghost" onClick={() => {
              removeReminder(r.id);
              syncRemindersToSW();
            }}>
              ×
            </Button>
          </div>
        ))}
        <Button size="sm" variant="secondary" onClick={() => {
          addReminder("12:00");
          syncRemindersToSW();
        }}>
          Add Reminder
        </Button>
      </GlassCard>

      <div>
        <h2 className="mb-3 font-semibold">Workout Plan</h2>
        <WorkoutEditor />
      </div>

      <div>
        <h2 className="mb-3 font-semibold">Weekly Review History</h2>
        <ReviewHistory />
      </div>

      <GlassCard className="space-y-3">
        <h2 className="font-semibold">Backup</h2>
        <Button className="w-full" variant="secondary" onClick={() => exportDataBackup()}>
          Export Data (forge-backup.json)
        </Button>
        <Button className="w-full" variant="secondary" onClick={() => exportFullBackup()}>
          Export Full (forge-backup-full.json)
        </Button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        <Button className="w-full" variant="outline" onClick={() => fileRef.current?.click()}>
          Import Backup
        </Button>
      </GlassCard>
    </div>
  );
}
