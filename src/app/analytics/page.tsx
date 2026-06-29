import { Suspense } from "react";
import { AnalyticsScreen } from "@/components/analytics/AnalyticsScreen";

function AnalyticsFallback() {
  return (
    <div className="px-4 pt-8 pb-24">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-white/[0.06]" />
      <div className="mt-4 h-10 w-full animate-pulse rounded-full bg-white/[0.04]" />
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<AnalyticsFallback />}>
      <AnalyticsScreen />
    </Suspense>
  );
}
