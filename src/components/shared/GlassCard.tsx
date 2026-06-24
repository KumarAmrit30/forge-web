import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
