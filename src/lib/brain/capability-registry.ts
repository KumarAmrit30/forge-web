import type { CoachCapability, CoachCapabilityId } from "@/lib/brain/types";

const CAPABILITIES: CoachCapability[] = [
  {
    id: "review-today",
    title: "Review Today",
    description: "Summarize today's habits, progress, and open loops.",
    requiredContext: ["forge-context", "identity"],
    requiredPermissions: ["read:calendar", "read:settings"],
    handlerName: "handleReviewToday",
  },
  {
    id: "review-week",
    title: "Review Week",
    description: "Analyze the past seven days of habit and routine data.",
    requiredContext: [
      "forge-context",
      "identity",
      "patterns",
      "trends",
      "behaviors",
    ],
    requiredPermissions: ["read:calendar", "read:workout"],
    requiredPatterns: ["workout", "routine", "consistency"],
    requiredBehaviors: ["routine_chain", "consistency_chain"],
    handlerName: "handleReviewWeek",
  },
  {
    id: "review-month",
    title: "Review Month",
    description: "Reflect on monthly consistency and identity growth.",
    requiredContext: ["forge-context", "identity", "trends", "predictions"],
    requiredPermissions: ["read:calendar", "read:progress"],
    requiredPredictions: ["momentum"],
    handlerName: "handleReviewMonth",
  },
  {
    id: "explain-trend",
    title: "Explain Trend",
    description: "Explain a detected long-term trend in plain language.",
    requiredContext: ["forge-context", "trends", "patterns"],
    requiredPermissions: ["read:calendar"],
    requiredPatterns: ["workout", "hydration", "sleep", "consistency"],
    handlerName: "handleExplainTrend",
  },
  {
    id: "analyze-workout",
    title: "Analyze Workout",
    description: "Review workout consistency, volume, and recovery signals.",
    requiredContext: ["forge-context", "patterns", "behaviors"],
    requiredPermissions: ["read:workout"],
    requiredPatterns: ["workout", "routine"],
    requiredBehaviors: ["routine_chain", "recovery_chain"],
    requiredPredictions: ["workout_likelihood"],
    handlerName: "handleAnalyzeWorkout",
  },
  {
    id: "analyze-hydration",
    title: "Analyze Hydration",
    description: "Review hydration patterns and weekday variation.",
    requiredContext: ["forge-context", "patterns", "trends", "predictions"],
    requiredPermissions: ["read:water"],
    requiredPatterns: ["hydration"],
    requiredPredictions: ["hydration_risk"],
    handlerName: "handleAnalyzeHydration",
  },
  {
    id: "plan-tomorrow",
    title: "Plan Tomorrow",
    description: "Suggest a focused plan for the next day.",
    requiredContext: [
      "forge-context",
      "identity",
      "recommendations",
      "predictions",
    ],
    requiredPermissions: ["read:calendar", "read:settings"],
    requiredPredictions: ["workout_likelihood", "hydration_risk"],
    handlerName: "handlePlanTomorrow",
  },
  {
    id: "plan-next-week",
    title: "Plan Next Week",
    description: "Suggest a weekly focus based on recent patterns.",
    requiredContext: [
      "forge-context",
      "identity",
      "patterns",
      "trends",
      "behaviors",
      "predictions",
      "recommendations",
    ],
    requiredPermissions: ["read:calendar", "read:workout"],
    requiredPatterns: ["workout", "routine", "hydration"],
    requiredBehaviors: ["routine_chain", "hydration_chain"],
    requiredPredictions: ["momentum", "workout_likelihood"],
    handlerName: "handlePlanNextWeek",
  },
  {
    id: "adjust-routine",
    title: "Adjust Routine",
    description: "Recommend routine adjustments based on life context.",
    requiredContext: [
      "forge-context",
      "identity",
      "memory",
      "recommendations",
      "behaviors",
    ],
    requiredPermissions: ["read:settings", "read:memory"],
    requiredBehaviors: ["routine_chain", "recovery_chain"],
    handlerName: "handleAdjustRoutine",
  },
  {
    id: "compare-months",
    title: "Compare Months",
    description: "Compare current and previous month habit performance.",
    requiredContext: ["forge-context", "trends", "predictions"],
    requiredPermissions: ["read:calendar", "read:progress"],
    requiredPredictions: ["momentum"],
    handlerName: "handleCompareMonths",
  },
  {
    id: "generate-reflection",
    title: "Generate Reflection",
    description: "Produce an observational reflection on recent identity growth.",
    requiredContext: [
      "forge-context",
      "identity",
      "patterns",
      "behaviors",
    ],
    requiredPermissions: ["read:calendar", "read:settings"],
    requiredPatterns: ["reflection", "consistency"],
    requiredBehaviors: ["reflection_chain", "consistency_chain"],
    handlerName: "handleGenerateReflection",
  },
];

const capabilityMap = new Map<CoachCapabilityId, CoachCapability>(
  CAPABILITIES.map((capability) => [capability.id, capability])
);

/** Return all approved Coach capabilities. */
export function listCapabilities(): CoachCapability[] {
  return [...CAPABILITIES];
}

/** Look up a single capability by id. */
export function getCapability(id: CoachCapabilityId): CoachCapability | undefined {
  return capabilityMap.get(id);
}

/** Placeholder handler registry keyed by handlerName. Sprint 6 wires real handlers. */
export function invokeCapabilityHandler(
  handlerName: string
): { invoked: false; handlerName: string } {
  return { invoked: false, handlerName };
}
