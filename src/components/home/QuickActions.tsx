"use client";

import Link from "next/link";
import { CheckCircle2, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { easeOut } from "@/components/home/motion";
import { HomeSectionLabel } from "@/components/home/home-ui";
import { cn } from "@/lib/utils";

const actions = [
  { href: "/today", label: "Today", icon: CheckCircle2 },
  { href: "/forge", label: "Forge AI", icon: Sparkles },
  { href: "/analytics", label: "Analytics", icon: TrendingUp },
] as const;

export function QuickActions() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOut, delay: 0.34 }}
      className="forge-section-gap pb-6"
    >
      <HomeSectionLabel className="mb-3">Quick Actions</HomeSectionLabel>
      <div className="grid grid-cols-3 gap-2">
        {actions.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex min-h-11 flex-col items-center justify-center gap-1.5 rounded-2xl",
              "border border-white/[0.06] bg-white/[0.03] px-2 py-3",
              "transition-[transform,background-color] duration-200",
              "hover:bg-white/[0.05] active:scale-[0.97]",
              "focus-ring"
            )}
          >
            <Icon className="h-5 w-5 text-primary" strokeWidth={2} aria-hidden />
            <span className="text-[11px] font-medium text-foreground/85">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </motion.section>
  );
}
