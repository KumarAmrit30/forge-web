"use client";

import { usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { PageShell } from "@/components/ui/page-shell";

function HomeSkeleton() {
  return (
    <PageShell className="space-y-6 pb-8">
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-40 w-full rounded-[24px]" />
      <Skeleton className="h-24 w-full rounded-[24px]" />
      <div className="space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-5 w-3/5" />
      </div>
    </PageShell>
  );
}

function TodaySkeleton() {
  return (
    <PageShell className="space-y-5 pb-8">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-72 w-full rounded-[24px]" />
      <Skeleton className="h-16 w-full" />
      <div className="space-y-3 pt-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
      </div>
    </PageShell>
  );
}

function ListSkeleton() {
  return (
    <PageShell className="space-y-6 pb-24">
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-sm" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-11 w-20 rounded-full" />
        <Skeleton className="h-11 w-24 rounded-full" />
      </div>
      <div className="space-y-3 rounded-[24px] border border-white/[0.06] p-4">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
      </div>
    </PageShell>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-white/[0.06] px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-3 sm:px-6">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="mt-2 h-4 w-56" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-11 w-24 rounded-full" />
          <Skeleton className="h-11 w-24 rounded-full" />
        </div>
      </div>
      <PageShell className="space-y-4 pt-6">
        <Skeleton className="h-32 w-full rounded-[24px]" />
        <Skeleton className="h-48 w-full rounded-[24px]" />
      </PageShell>
    </div>
  );
}

function DefaultSkeleton() {
  return (
    <PageShell className="space-y-4 pb-8 pt-12">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-24 w-full rounded-[24px]" />
    </PageShell>
  );
}

export function PageSkeleton() {
  const pathname = usePathname();

  if (pathname === "/") return <HomeSkeleton />;
  if (pathname === "/today") return <TodaySkeleton />;
  if (pathname.startsWith("/forge")) return <TodaySkeleton />;
  if (pathname.startsWith("/analytics")) return <AnalyticsSkeleton />;
  if (
    pathname.startsWith("/settings") ||
    pathname.startsWith("/routines") ||
    pathname.startsWith("/habits")
  ) {
    return <ListSkeleton />;
  }

  return <DefaultSkeleton />;
}
