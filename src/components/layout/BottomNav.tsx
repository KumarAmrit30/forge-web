"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Home;
};

const leftTabs: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/today", label: "Today", icon: CheckCircle2 },
];

const rightTabs: NavItem[] = [
  { href: "/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/settings", label: "Settings", icon: Settings },
];

function isNavActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/analytics") {
    return (
      pathname.startsWith("/analytics") ||
      pathname.startsWith("/progress") ||
      pathname.startsWith("/calendar")
    );
  }
  if (href === "/settings") {
    return pathname.startsWith("/settings");
  }
  return pathname.startsWith(href);
}

function NavTab({ href, label, icon: Icon }: NavItem) {
  const pathname = usePathname();
  const active = isNavActive(href, pathname);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex min-h-11 min-w-[4.5rem] flex-col items-center justify-center gap-1 px-2 py-1.5 text-[10px] transition-colors duration-300 ease-out focus-ring rounded-lg",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground/70"
      )}
    >
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute -top-2 h-0.5 w-8 rounded-full bg-primary"
          transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
        />
      )}
      <Icon
        className={cn(
          "transition-[filter,transform] duration-300 ease-out",
          active
            ? "h-[22px] w-[22px] drop-shadow-[0_0_8px_oklch(0.72_0.15_160/0.45)]"
            : "h-5 w-5"
        )}
        strokeWidth={active ? 2.2 : 1.8}
        aria-hidden
      />
      <span className="font-medium">{label}</span>
    </Link>
  );
}

function ForgeFab() {
  const pathname = usePathname();
  const active = pathname.startsWith("/forge");

  return (
    <Link
      href="/forge"
      className="relative -mt-7 flex min-h-11 flex-col items-center gap-1.5 px-2 pb-1 text-[10px] focus-ring rounded-lg"
      aria-label="Forge AI"
      aria-current={active ? "page" : undefined}
    >
      <span
        className={cn(
          "flex h-[3.75rem] w-[3.75rem] items-center justify-center rounded-full bg-primary",
          "shadow-[0_0_28px_-4px_oklch(0.72_0.15_160/0.55)]",
          "transition-[transform,box-shadow] duration-300 ease-out",
          "hover:-translate-y-0.5 active:scale-95",
          active && "ring-2 ring-primary/35 ring-offset-2 ring-offset-background"
        )}
      >
        <Sparkles
          className="h-7 w-7 text-primary-foreground"
          strokeWidth={active ? 2.2 : 2}
          aria-hidden
        />
      </span>
      <span
        className={cn(
          "font-semibold",
          active ? "text-primary" : "text-muted-foreground"
        )}
      >
        Forge AI
      </span>
    </Link>
  );
}

export function BottomNav() {
  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/80 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto grid max-w-lg grid-cols-[1fr_auto_1fr] items-end px-1 py-2">
        <div className="flex items-end justify-around">
          {leftTabs.map((tab) => (
            <NavTab key={tab.href} {...tab} />
          ))}
        </div>
        <ForgeFab />
        <div className="flex items-end justify-around">
          {rightTabs.map((tab) => (
            <NavTab key={tab.href} {...tab} />
          ))}
        </div>
      </div>
    </nav>
  );
}
