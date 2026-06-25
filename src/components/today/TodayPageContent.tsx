"use client";

import { useEffect, useState, useCallback } from "react";
import { getOrCreateTodayRecord, updateTodayRecord } from "@/lib/sync-day";
import { ChecklistSection } from "@/components/today/ChecklistSection";
import { WorkoutSessionPanel } from "@/components/today/WorkoutSessionPanel";
import { WaterWidget } from "@/components/today/WaterWidget";
import { HabitsSection } from "@/components/today/HabitsSection";
import { GlassCard } from "@/components/shared/GlassCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettingsStore } from "@/stores/settingsStore";
import { useCalendarStore } from "@/stores/calendarStore";
import { todayKey } from "@/lib/date-utils";
import type { DayRecord } from "@/types";

function scrollToSection(hash: string) {
  if (!hash) return;
  const id = hash.replace("#", "");
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function TodayPageContent() {
  const profile = useSettingsStore((s) => s.profile);
  const todayDate = todayKey();
  const calendarDay = useCalendarStore((s) => s.days[todayDate]);

  const [record, setRecord] = useState<DayRecord>(() => getOrCreateTodayRecord());

  const refresh = useCallback(() => {
    setRecord(getOrCreateTodayRecord());
  }, []);

  useEffect(() => {
    refresh();
    scrollToSection(window.location.hash);
    const onHash = () => scrollToSection(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [refresh]);

  useEffect(() => {
    if (calendarDay) {
      setRecord(calendarDay);
    }
  }, [calendarDay]);

  const toggleChecklist = (
    section: "morningChecklist" | "nightChecklist",
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

  const updateMetric = (
    field: "proteinG" | "steps" | "sleepHours",
    val: number
  ) => {
    const saved = updateTodayRecord({ [field]: val });
    setRecord(saved);
  };

  return (
    <div className="space-y-6 px-4 pt-6 pb-8">
      <header>
        <p className="text-sm text-muted-foreground">Today</p>
        <h1 className="text-2xl font-bold tracking-tight">Execute</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Complete everything here — one surface, no confusion.
        </p>
      </header>

      <div id="morning" className="scroll-mt-20">
        <ChecklistSection
          title="Morning Routine"
          items={record.morningChecklist}
          onToggle={(k) => toggleChecklist("morningChecklist", k)}
        />
      </div>

      <div id="nutrition" className="scroll-mt-20">
        <GlassCard className="space-y-4">
          <h3 className="font-semibold">Nutrition & Movement</h3>
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
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Steps ({record.steps.toLocaleString()}/
                {profile.dailyStepsGoal.toLocaleString()})
              </Label>
              <Input
                type="number"
                value={record.steps || ""}
                onChange={(e) =>
                  updateMetric("steps", parseInt(e.target.value, 10) || 0)
                }
              />
            </div>
          </div>
        </GlassCard>
      </div>

      <div id="water" className="scroll-mt-20">
        <WaterWidget showTimeline />
      </div>

      <div id="workout" className="scroll-mt-20">
        <WorkoutSessionPanel />
      </div>

      <HabitsSection onToggle={refresh} />

      <div id="night" className="scroll-mt-20">
        <ChecklistSection
          title="Evening Routine"
          items={record.nightChecklist}
          onToggle={(k) => toggleChecklist("nightChecklist", k)}
        />
      </div>

      <div id="sleep" className="scroll-mt-20">
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
    </div>
  );
}
