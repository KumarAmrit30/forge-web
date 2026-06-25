"use client";

import { useState } from "react";
import { useCalendarStore } from "@/stores/calendarStore";
import { getMonthGrid } from "@/lib/date-utils";
import { GlassCard } from "@/components/shared/GlassCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { buildDefaultDayRecord } from "@/lib/sync-day";
import type { DayRecord } from "@/types";

const DOT_COLORS = {
  green: "bg-emerald-500",
  yellow: "bg-amber-500",
  red: "bg-red-500",
  empty: "bg-transparent",
};

function scoreLevel(score?: number): keyof typeof DOT_COLORS {
  if (score == null) return "empty";
  if (score >= 80) return "green";
  if (score >= 50) return "yellow";
  return "red";
}

function DaySummary({ record }: { record: DayRecord }) {
  return (
    <div className="space-y-3 text-sm">
      {record.dailyScore != null && (
        <p>Score: <strong>{record.dailyScore}/100</strong></p>
      )}
      <p>Water: {(record.waterMl / 1000).toFixed(1)}L</p>
      <p>Protein: {record.proteinG}g</p>
      <p>Sleep: {record.sleepHours}h</p>
      <p>Steps: {record.steps.toLocaleString()}</p>
      {record.weightKg && <p>Weight: {record.weightKg} kg</p>}
      {record.workoutCompletion?.completed && (
        <p>Workout: Completed ✓</p>
      )}
      {Object.keys(record.habits).length > 0 && (
        <p>
          Habits:{" "}
          {Object.values(record.habits).filter(Boolean).length}/
          {Object.keys(record.habits).length}
        </p>
      )}
      {record.notes && <p className="text-muted-foreground">{record.notes}</p>}
    </div>
  );
}

export function CalendarView() {
  const [viewDate, setViewDate] = useState(new Date());
  const [selected, setSelected] = useState<DayRecord | null>(null);
  const days = useCalendarStore((s) => s.days);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const grid = getMonthGrid(year, month);

  const prevMonth = () =>
    setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () =>
    setViewDate(new Date(year, month + 1, 1));

  return (
    <div className="space-y-4 px-4 pt-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
      </header>

      <GlassCard>
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-semibold">{format(viewDate, "MMMM yyyy")}</h2>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="mb-2 grid grid-cols-7 text-center text-xs text-muted-foreground">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {grid.flat().map((date, i) => {
            if (!date) return <div key={i} />;
            const key = format(date, "yyyy-MM-dd");
            const record = days[key];
            const level = scoreLevel(record?.dailyScore);
            const isToday = key === format(new Date(), "yyyy-MM-dd");

            return (
              <button
                key={key}
                onClick={() =>
                  setSelected(record ?? buildDefaultDayRecord(key))
                }
                className={cn(
                  "flex flex-col items-center rounded-lg py-2 text-sm transition-colors hover:bg-secondary/50",
                  isToday && "ring-1 ring-emerald-500/50",
                  !record && "opacity-60"
                )}
              >
                <span>{date.getDate()}</span>
                <div
                  className={cn(
                    "mt-1 h-1.5 w-1.5 rounded-full",
                    DOT_COLORS[level]
                  )}
                />
              </button>
            );
          })}
        </div>
      </GlassCard>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.date}</DialogTitle>
          </DialogHeader>
          {selected && <DaySummary record={selected} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
