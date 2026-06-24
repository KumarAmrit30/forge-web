"use client";

import { useEffect, useState } from "react";
import { getOrCreateTodayRecord, updateTodayRecord } from "@/lib/sync-day";
import { ChecklistSection } from "@/components/today/ChecklistSection";
import { WorkoutSessionPanel } from "@/components/today/WorkoutSessionPanel";
import { WaterWidget } from "@/components/today/WaterWidget";
import { GlassCard } from "@/components/shared/GlassCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettingsStore } from "@/stores/settingsStore";
import type { DayRecord } from "@/types";

export function TodayPageContent() {
  const profile = useSettingsStore((s) => s.profile);
  const [record, setRecord] = useState<DayRecord>(() => getOrCreateTodayRecord());

  useEffect(() => {
    setRecord(getOrCreateTodayRecord());
  }, []);

  const toggleChecklist = (
    section: "morningChecklist" | "dayChecklist" | "nightChecklist",
    key: string
  ) => {
    const updated = {
      ...record,
      [section]: {
        ...record[section],
        [key]: !record[section][key],
      },
    };
    const saved = updateTodayRecord(updated);
    setRecord(saved);
  };

  const updateMetric = (field: "proteinG" | "steps" | "sleepHours", val: number) => {
    const saved = updateTodayRecord({ [field]: val });
    setRecord(saved);
  };

  return (
    <div className="space-y-6 px-4 pt-6">
      <header>
        <p className="text-sm text-muted-foreground">Today</p>
        <h1 className="text-2xl font-bold tracking-tight">Execute.</h1>
      </header>

      <ChecklistSection
        title="Morning"
        items={record.morningChecklist}
        onToggle={(k) => toggleChecklist("morningChecklist", k)}
      />

      <GlassCard className="space-y-4">
        <h3 className="font-semibold">Day Goals</h3>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">
              Protein ({record.proteinG}/{profile.dailyProteinGoal}g)
            </Label>
            <Input
              type="number"
              value={record.proteinG || ""}
              onChange={(e) =>
                updateMetric("proteinG", parseInt(e.target.value, 10) || 0)
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              Steps ({record.steps.toLocaleString()}/{profile.dailyStepsGoal.toLocaleString()})
            </Label>
            <Input
              type="number"
              value={record.steps || ""}
              onChange={(e) =>
                updateMetric("steps", parseInt(e.target.value, 10) || 0)
              }
              className="mt-1"
            />
          </div>
        </div>
      </GlassCard>

      <WaterWidget showTimeline />

      <WorkoutSessionPanel />

      <ChecklistSection
        title="Night"
        items={record.nightChecklist}
        onToggle={(k) => toggleChecklist("nightChecklist", k)}
      />

      <GlassCard>
        <Label className="text-xs text-muted-foreground">
          Sleep ({record.sleepHours}/{profile.dailySleepGoal}h)
        </Label>
        <Input
          type="number"
          step="0.5"
          value={record.sleepHours || ""}
          onChange={(e) =>
            updateMetric("sleepHours", parseFloat(e.target.value) || 0)
          }
          className="mt-1"
        />
      </GlassCard>
    </div>
  );
}
