"use client";

import Link from "next/link";
import { todaySectionHref } from "@/lib/priority-engine";
import type { Priority } from "@/types";
import { GlassCard } from "@/components/shared/GlassCard";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export function PriorityList({ priorities }: { priorities: Priority[] }) {
  if (!priorities.length) {
    return (
      <GlassCard>
        <p className="text-center text-sm text-muted-foreground">
          All priorities complete. Strong work today.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="space-y-2">
      <h2 className="text-lg font-semibold">Today&apos;s Priorities</h2>
      <div className="space-y-2">
        {priorities.map((p, i) => (
          <motion.div
            key={p.rank}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              href={todaySectionHref(p.section)}
              className="group flex items-center gap-3 rounded-xl bg-secondary/30 px-3 py-3 transition-colors hover:bg-secondary/50 active:scale-[0.99]"
            >
              <Badge
                variant="outline"
                className="shrink-0 border-emerald-500/50 bg-emerald-500/10 font-mono text-emerald-500"
              >
                {p.rank}
              </Badge>
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-snug">{p.label}</p>
                <p className="text-xs text-muted-foreground">{p.category}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
