import { cn } from "@/lib/utils";
import { FORGE_CARD_PADDING } from "@/components/home/home-ui";

const glassStyles =
  "border-white/[0.06] bg-gradient-to-br from-white/[0.04] via-white/[0.015] to-transparent shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]";

export function GlassCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "forge-card-radius border backdrop-blur-sm",
        glassStyles,
        FORGE_CARD_PADDING,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
