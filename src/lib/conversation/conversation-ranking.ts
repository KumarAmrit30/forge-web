import type {
  BehaviorInsight,
  CoachCapabilityId,
  Pattern,
  Prediction,
  Recommendation,
  RecommendationPriority,
  Trend,
} from "@/lib/brain";
import type {
  RankedBehavior,
  RankedInsight,
  RankedPattern,
  RankedPrediction,
  RankedRecommendation,
  RankedTrend,
  ResponseDepth,
} from "@/lib/conversation/conversation-types";

const PRIORITY_WEIGHT: Record<RecommendationPriority, number> = {
  high: 5,
  medium: 3,
  low: 1,
};

const TREND_DIRECTION_WEIGHT: Record<string, number> = {
  improving: 3,
  declining: 4,
  plateau: 2,
  volatile: 1,
};

/** Score a recommendation: confidence (primary), priority, recency via evidence window. */
export function scoreRecommendation(
  recommendation: Recommendation,
  capabilityCategory: string | null
): number {
  let score = recommendation.confidence * 10 + PRIORITY_WEIGHT[recommendation.priority];

  if (capabilityCategory && recommendation.category === capabilityCategory) {
    score += 4;
  }

  const evidenceCount = recommendation.evidence.length;
  score += Math.min(evidenceCount, 3);

  return score;
}

/** Rank recommendations deterministically — does not modify items. */
export function rankRecommendations(
  recommendations: Recommendation[],
  capabilityCategory: string | null
): RankedRecommendation[] {
  return recommendations
    .map((item) => ({
      id: item.id,
      score: scoreRecommendation(item, capabilityCategory),
      priority: item.priority,
      category: item.category,
      reason: item.reason,
      recommendedAction: item.recommendedAction,
      confidence: item.confidence,
    }))
    .sort((a, b) => b.score - a.score);
}

/** Score a pattern: confidence and evidence strength. */
export function scorePattern(pattern: Pattern): number {
  return pattern.confidence * 10 + Math.min(pattern.evidence.length, 3);
}

/** Rank patterns deterministically. */
export function rankPatterns(patterns: Pattern[]): RankedPattern[] {
  return patterns
    .map((item) => ({ id: item.id, score: scorePattern(item), item }))
    .sort((a, b) => b.score - a.score);
}

/** Score a behavior insight: confidence and related pattern count. */
export function scoreBehavior(behavior: BehaviorInsight): number {
  return (
    behavior.confidence * 10 +
    Math.min(behavior.relatedPatternIds.length, 2) +
    Math.min(behavior.evidence.length, 2)
  );
}

/** Rank behavior insights deterministically. */
export function rankBehaviors(behaviors: BehaviorInsight[]): RankedBehavior[] {
  return behaviors
    .map((item) => ({ id: item.id, score: scoreBehavior(item), item }))
    .sort((a, b) => b.score - a.score);
}

/** Score a prediction: confidence and likelihood. */
export function scorePrediction(prediction: Prediction): number {
  return prediction.confidence * 10 + prediction.likelihood * 5;
}

/** Rank predictions deterministically. */
export function rankPredictions(predictions: Prediction[]): RankedPrediction[] {
  return predictions
    .map((item) => ({ id: item.id, score: scorePrediction(item), item }))
    .sort((a, b) => b.score - a.score);
}

/** Score a trend: confidence, direction importance, and delta magnitude. */
export function scoreTrend(trend: Trend): number {
  let score = trend.confidence * 10;
  score += TREND_DIRECTION_WEIGHT[trend.direction] ?? 1;
  if (trend.deltaPercent !== null) {
    score += Math.min(Math.abs(trend.deltaPercent) / 10, 4);
  }
  score += Math.min(trend.windowDays / 7, 2);
  return score;
}

/** Rank trends deterministically. */
export function rankTrends(trends: Trend[]): RankedTrend[] {
  return trends
    .map((item) => ({ id: item.id, score: scoreTrend(item), item }))
    .sort((a, b) => b.score - a.score);
}

/** Derive ranked insights from patterns, behaviors, and trends. */
export function deriveRankedInsights(
  patterns: Pattern[],
  behaviors: BehaviorInsight[],
  trends: Trend[]
): RankedInsight[] {
  const fromPatterns: RankedInsight[] = patterns.map((p) => ({
    id: `insight-pattern-${p.id}`,
    sourceType: "pattern" as const,
    score: scorePattern(p),
    confidence: p.confidence,
    category: p.category,
    description: p.description,
    relatedIds: [p.id],
  }));

  const fromBehaviors: RankedInsight[] = behaviors.map((b) => ({
    id: `insight-behavior-${b.id}`,
    sourceType: "behavior" as const,
    score: scoreBehavior(b),
    confidence: b.confidence,
    category: b.type,
    description: `${b.trigger} → ${b.action} → ${b.outcome}`,
    relatedIds: [b.id, ...b.relatedPatternIds],
  }));

  const fromTrends: RankedInsight[] = trends.map((t) => ({
    id: `insight-trend-${t.id}`,
    sourceType: "trend" as const,
    score: scoreTrend(t),
    confidence: t.confidence,
    category: t.metric,
    description: `${t.metric} ${t.direction} over ${t.windowDays}d`,
    relatedIds: [t.id],
  }));

  return deduplicateInsights(
    [...fromPatterns, ...fromBehaviors, ...fromTrends].sort(
      (a, b) => b.score - a.score
    )
  );
}

/** Remove insights with substantially overlapping descriptions. */
function deduplicateInsights(insights: RankedInsight[]): RankedInsight[] {
  const seen = new Set<string>();
  const result: RankedInsight[] = [];

  for (const insight of insights) {
    const key = normalizeKey(insight.category, insight.description);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(insight);
  }

  return result;
}

/** Merge insights sharing the same category with similar descriptions. */
export function mergeSimilarInsights(
  insights: RankedInsight[]
): { merged: RankedInsight[]; mergeCount: number } {
  const groups = new Map<string, RankedInsight[]>();

  for (const insight of insights) {
    const key = insight.category;
    const group = groups.get(key) ?? [];
    group.push(insight);
    groups.set(key, group);
  }

  const merged: RankedInsight[] = [];
  let mergeCount = 0;

  for (const group of groups.values()) {
    if (group.length === 1) {
      merged.push(group[0]);
      continue;
    }

    const best = group.reduce((a, b) => (a.score >= b.score ? a : b));
    const relatedIds = [...new Set(group.flatMap((i) => i.relatedIds))];
    mergeCount += group.length - 1;
    merged.push({ ...best, relatedIds });
  }

  return {
    merged: merged.sort((a, b) => b.score - a.score),
    mergeCount,
  };
}

function normalizeKey(category: string, description: string): string {
  return `${category}:${description.toLowerCase().replace(/\s+/g, " ").trim()}`;
}

/** Map conversation mode length to response depth. */
export function depthFromModeLength(
  length: "brief" | "moderate" | "extended"
): ResponseDepth {
  return length;
}

/** Derive insight/recommendation limits from mode intensity levels. */
export function limitsFromMode(
  depth: ResponseDepth,
  recommendationIntensity: number,
  reflectionIntensity: number
): { insightLimit: number; recommendationLimit: number; followUpLimit: number } {
  const base = depth === "brief" ? 2 : depth === "moderate" ? 4 : 6;
  return {
    insightLimit: base + Math.min(reflectionIntensity, 2),
    recommendationLimit: Math.max(0, recommendationIntensity),
    followUpLimit: depth === "brief" ? 1 : 2,
  };
}

/** Infer primary category focus from capability id for ranking boosts. */
export function capabilityCategoryFocus(
  capabilityId: CoachCapabilityId | null
): string | null {
  if (!capabilityId) return null;
  const map: Partial<Record<CoachCapabilityId, string>> = {
    "analyze-workout": "workout",
    "analyze-hydration": "hydration",
    "adjust-routine": "routine",
    "generate-reflection": "reflection",
    "review-today": "consistency",
    "plan-tomorrow": "routine",
    "plan-next-week": "consistency",
  };
  return map[capabilityId] ?? null;
}
