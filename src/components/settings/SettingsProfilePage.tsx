"use client";

import { useSettingsStore } from "@/stores/settingsStore";
import { GlassCard } from "@/components/shared/GlassCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsPageHeader } from "@/components/settings/SettingsNavCard";
import { PageShell } from "@/components/ui/page-shell";

export function SettingsProfilePage() {
  const profile = useSettingsStore((s) => s.profile);
  const setProfile = useSettingsStore((s) => s.setProfile);

  return (
    <PageShell className="space-y-6 pb-24">
      <SettingsPageHeader
        title="Profile & Goals"
        description="Update your profile and daily targets."
      />

      <GlassCard className="space-y-4">
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
    </PageShell>
  );
}
