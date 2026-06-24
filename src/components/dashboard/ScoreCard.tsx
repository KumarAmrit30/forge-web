"use client";

import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { GlassCard } from "@/components/shared/GlassCard";
import type { ScoreResult } from "@/types";

export function ScoreCard({ scores }: { scores: ScoreResult }) {
  const data = [{ name: "score", value: scores.current.total, fill: "oklch(0.72 0.15 160)" }];

  return (
    <GlassCard className="space-y-4">
      <h2 className="text-lg font-semibold">Daily Score</h2>
      <div className="flex items-center gap-6">
        <div className="h-28 w-28 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="100%"
              data={data}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "oklch(0.22 0.01 260)" }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-3xl font-bold tabular-nums">{scores.current.total}</p>
            <p className="text-xs text-muted-foreground">Current / 100</p>
          </div>
          <div>
            <p className="text-xl font-semibold tabular-nums text-emerald-500">
              {scores.projected.total}
            </p>
            <p className="text-xs text-muted-foreground">Projected / 100</p>
          </div>
          {scores.gap > 0 && (
            <p className="text-sm font-medium text-emerald-500/80">
              Potential Gain: +{scores.gap}
            </p>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
