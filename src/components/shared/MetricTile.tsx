import { cn } from "@/lib/utils";

export function MetricTile({
  value,
  label,
  sublabel,
  accent,
  className,
}: {
  value: string | number;
  label: string;
  sublabel?: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-0.5", className)}>
      <p
        className={cn(
          "text-2xl font-bold tabular-nums",
          accent && "text-emerald-500"
        )}
      >
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {sublabel && (
        <p className="text-[10px] text-muted-foreground/80">{sublabel}</p>
      )}
    </div>
  );
}

export function StatDelta({
  value,
  label,
  unit = "kg",
}: {
  value: number | null;
  label: string;
  unit?: string;
}) {
  if (value === null) return null;
  const positive = value < 0;
  return (
    <span className="text-xs text-muted-foreground">
      {label}:{" "}
      <span className={positive ? "text-emerald-500" : "text-amber-500"}>
        {value > 0 ? "+" : ""}
        {value} {unit}
      </span>
    </span>
  );
}
