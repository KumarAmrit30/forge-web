import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type Props = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: Props) {
  const actionClass = cn(
    buttonVariants({ variant: "outline", size: "sm" }),
    "mt-4 min-h-11"
  );

  return (
    <div
      className={cn(
        "flex flex-col items-center px-4 py-10 text-center",
        className
      )}
    >
      {Icon ? (
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />
        </span>
      ) : null}
      <p className="text-sm font-medium text-foreground/90">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {actionLabel && actionHref ? (
        <Link href={actionHref} className={actionClass}>
          {actionLabel}
        </Link>
      ) : actionLabel && onAction ? (
        <button type="button" onClick={onAction} className={actionClass}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
