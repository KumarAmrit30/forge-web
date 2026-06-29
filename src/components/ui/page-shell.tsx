import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Extra bottom padding for scroll clearance above bottom nav */
  paddedBottom?: boolean;
};

export function PageShell({
  children,
  className,
  paddedBottom = false,
}: Props) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-lg overflow-x-hidden",
        "px-4 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6",
        paddedBottom && "pb-6",
        className
      )}
    >
      {children}
    </div>
  );
}
