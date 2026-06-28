import type { Recommendation } from "@/lib/brain";
import { scoreRecommendation } from "@/lib/conversation/conversation-ranking";
import type { ActionPriority } from "@/lib/conversation/conversation-types";

const MAX_VISIBLE_ACTIONS = 3;

/** Map recommendations to prioritized actions — recommendations are never modified. */
export function prioritizeActions(
  recommendations: Recommendation[],
  capabilityCategory: string | null
): ActionPriority[] {
  return recommendations
    .map((rec, index) => {
      const score = scoreRecommendation(rec, capabilityCategory);
      return {
        id: `action-${rec.id}`,
        label: rec.recommendedAction,
        actionType: rec.category,
        score,
        visible: index < MAX_VISIBLE_ACTIONS,
        order: index,
        sourceRecommendationId: rec.id,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((action, index) => ({
      ...action,
      order: index,
      visible: index < MAX_VISIBLE_ACTIONS,
    }));
}

/** Rank actions from ranked recommendation ids, preserving orchestrator order. */
export function prioritizeFromRankedRecommendations(
  recommendations: Recommendation[],
  rankedIds: string[],
  capabilityCategory: string | null
): ActionPriority[] {
  const rankIndex = new Map(rankedIds.map((id, i) => [id, i]));
  const sorted = [...recommendations].sort((a, b) => {
    const aRank = rankIndex.get(a.id) ?? rankedIds.length;
    const bRank = rankIndex.get(b.id) ?? rankedIds.length;
    return aRank - bRank;
  });

  return prioritizeActions(sorted, capabilityCategory);
}
