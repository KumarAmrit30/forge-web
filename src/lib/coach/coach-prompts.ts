import { assetPublicPath } from "@/lib/asset-catalog";
import { getGreetingLabel, getTimeOfDay } from "@/lib/home-data";
import type { CoachCapabilityId, ForgeBrainResult } from "@/lib/brain";
import type {
  ConversationStarter,
  ForgeCoachHero,
  ForgeCoachViewModel,
} from "@/lib/coach/coach-types";
import {
  capabilityForStarterStrategy,
  rankConversationStarters,
  resolveStarterQuestionText,
} from "@/lib/personality";

function contextualSummary(brain: ForgeBrainResult): string {
  const topRecommendation = brain.recommendations[0];
  if (topRecommendation) {
    return formatStructuredReason(topRecommendation.reason);
  }
  if (brain.identity.heroReflection[0]) {
    return brain.identity.heroReflection[0];
  }
  return brain.identity.forgeInsight;
}

function formatStructuredReason(reason: string): string {
  const formatted = reason
    .replace(/_/g, " ")
    .replace(/(\d+)d window/, "$1-day window");
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/** Build hero and conversation starters from a Forge Brain snapshot. */
export function buildForgeCoachViewModel(
  brain: ForgeBrainResult,
  userName: string
): ForgeCoachViewModel {
  const greeting = getGreetingLabel(getTimeOfDay());
  const firstName = userName.split(" ")[0];

  const hero: ForgeCoachHero = {
    greeting: `${greeting}, ${firstName}`,
    identityTitle: brain.identity.title,
    contextualSummary: contextualSummary(brain),
    illustration: assetPublicPath("ai/assistant.svg"),
  };

  const starters = rankConversationStarters(brain);

  return { hero, starters, brain };
}

export function resolveStarterQuestion(
  starter: ConversationStarter,
  customQuestion?: string
): string {
  return resolveStarterQuestionText(starter, customQuestion);
}

export function capabilityForStarter(
  starter: ConversationStarter
): CoachCapabilityId | undefined {
  return capabilityForStarterStrategy(starter);
}
