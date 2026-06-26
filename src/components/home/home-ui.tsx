import { cn } from "@/lib/utils";

export type HomeCardElevation = "mission" | "insight" | "progress";

/** Uppercase emerald section label — TODAY'S MISSION, FORGE NOTICED, etc. */
export function HomeSectionLabel({
  children,
  className,
  size = "default",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "small";
}) {
  return (
    <p
      className={cn(
        "font-semibold uppercase tracking-[0.2em] text-primary/80",
        size === "small"
          ? "text-[9px] tracking-[0.18em]"
          : "text-[10px] tracking-[0.2em]",
        className
      )}
    >
      {children}
    </p>
  );
}

const elevationStyles: Record<HomeCardElevation, string> = {
  mission: cn(
    "border-white/[0.09]",
    "bg-gradient-to-br from-white/[0.06] via-white/[0.025] to-transparent",
    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07),0_8px_32px_-16px_rgba(0,0,0,0.5)]"
  ),
  insight: cn(
    "border-white/[0.06]",
    "bg-gradient-to-br from-white/[0.04] via-white/[0.015] to-transparent",
    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
  ),
  progress: cn(
    "border-white/[0.04]",
    "bg-gradient-to-br from-white/[0.03] via-transparent to-transparent",
    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]"
  ),
};

/** Elevated surface card — elevation varies by role on the page. */
export function HomeSurfaceCard({
  children,
  className,
  elevation = "insight",
}: {
  children: React.ReactNode;
  className?: string;
  elevation?: HomeCardElevation;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] border",
        elevationStyles[elevation],
        className
      )}
    >
      {children}
    </div>
  );
}

/** Circular emerald CTA — used on the mission card. */
export function HomeCircleAction({
  className,
}: {
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
        "bg-primary text-primary-foreground",
        "shadow-[0_0_24px_-4px_oklch(0.72_0.15_160/0.5),0_4px_16px_-6px_oklch(0.72_0.15_160/0.35)]",
        "transition-[transform,box-shadow] duration-300 ease-out",
        "group-hover:-translate-y-0.5 group-hover:shadow-[0_0_32px_-2px_oklch(0.72_0.15_160/0.55),0_6px_20px_-6px_oklch(0.72_0.15_160/0.4)]",
        "group-active:scale-95",
        className
      )}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform duration-300 ease-out group-hover:translate-x-0.5"
        aria-hidden
      >
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    </span>
  );
}

export const homeSerif = "font-serif tracking-[-0.01em]";
