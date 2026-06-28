import type { CoachCapabilityId, ForgeBrainResult } from "@/lib/brain";
import { resolveCapability } from "@/lib/coach/capability-resolver";
import { optimizeContext } from "@/lib/coach/context-optimizer";
import type {
  ConversationStarter,
  ParsedCoachResponse,
} from "@/lib/coach/coach-types";
import {
  composeConversationContext,
  type ConversationContext,
  type ConversationMemory,
  type ConversationPlan,
} from "@/lib/conversation";
import type { ConversationModeId } from "@/lib/personality/personality-types";

/** UI-facing follow-up chip derived from orchestration — never random. */
export type FollowUpChip = {
  id: string;
  label: string;
  question: string;
};

/** UI-facing action card derived from orchestrator prioritized actions. */
export type ExperienceActionCard = {
  id: string;
  title: string;
  reason: string;
  actionLabel: string;
  capabilityId?: CoachCapabilityId;
};

/** Per-message experience metadata consumed by Forge UI components. */
export type MessageExperience = {
  isReflectionMode: boolean;
  followUpChips: FollowUpChip[];
  actionCards: ExperienceActionCard[];
  endingType: "follow-up" | "action" | "quiet" | null;
  endingMessage: string | null;
};

const REFLECTION_MODES = new Set<ConversationModeId>([
  "reflection",
  "monthly-reflection",
]);

const THINKING_MESSAGES: Partial<
  Record<ConversationModeId, string[]>
> = {
  "daily-review": [
    "Reviewing your recent patterns…",
    "Connecting today's habits…",
  ],
  "weekly-review": [
    "Reviewing your recent patterns…",
    "Looking for meaningful changes…",
  ],
  "monthly-reflection": [
    "Reflecting on your consistency…",
    "Looking for meaningful changes…",
  ],
  planning: [
    "Connecting today's habits…",
    "Reviewing what comes next…",
  ],
  explanation: [
    "Looking for meaningful changes…",
    "Reviewing your recent patterns…",
  ],
  reflection: [
    "Reflecting on your consistency…",
    "Reviewing your recent patterns…",
  ],
  celebration: [
    "Reviewing your recent patterns…",
  ],
  "open-conversation": [
    "Reviewing your recent patterns…",
    "Connecting today's habits…",
  ],
};

const DETERMINISTIC_CHIP_TEMPLATES: Array<{
  id: string;
  label: string;
  buildQuestion: (topic: string | null) => string;
  when: (ctx: ConversationContext) => boolean;
}> = [
  {
    id: "explain-why",
    label: "Explain Why",
    buildQuestion: (topic) =>
      topic ? `Explain why ${topic.toLowerCase()}` : "Explain why this happened",
    when: (ctx) => ctx.rankedInsights.length > 0,
  },
  {
    id: "show-evidence",
    label: "Show Evidence",
    buildQuestion: () => "Show me the evidence for that",
    when: (ctx) =>
      ctx.rankedPatterns.length > 0 || ctx.rankedTrends.length > 0,
  },
  {
    id: "plan-tomorrow",
    label: "Plan Tomorrow",
    buildQuestion: () => "Help me plan tomorrow",
    when: (ctx) => ctx.modeId === "daily-review" || ctx.modeId === "planning",
  },
  {
    id: "review-week",
    label: "Review This Week",
    buildQuestion: () => "Reflect on my week",
    when: (ctx) => ctx.modeId !== "weekly-review",
  },
];

function orchestrationScore(context: ConversationContext): number {
  const insightScore = context.rankedInsights.reduce((s, i) => s + i.score, 0);
  const recScore = context.rankedRecommendations.reduce(
    (s, r) => s + r.score,
    0
  );
  const followUpScore = context.followUpCandidates.reduce(
    (s, c) => s + c.score,
    0
  );
  return insightScore + recScore + followUpScore;
}

/**
 * Re-rank personality starters using orchestration context richness.
 * Consumes composeConversationContext — no duplicated ranking heuristics.
 */
export function selectDynamicStarters(
  brain: ForgeBrainResult,
  memory: ConversationMemory,
  starters: ConversationStarter[],
  maxVisible = 4
): ConversationStarter[] {
  const askForge = starters.find((s) => s.id === "ask-forge");
  const candidates = starters.filter((s) => s.id !== "ask-forge");

  const scored = candidates.map((starter) => {
    const resolved = resolveCapability(
      starter.question,
      starter.capabilityId ?? undefined
    );
    const optimized = optimizeContext(brain, resolved);
    const context = composeConversationContext({
      brain,
      resolved,
      optimized,
      memory,
      userMessage: starter.question,
    });
    return { starter, score: orchestrationScore(context) };
  });

  scored.sort((a, b) => b.score - a.score);
  const visible = scored.slice(0, maxVisible).map((s) => s.starter);

  return askForge ? [...visible, askForge] : visible;
}

/** Deterministic thinking copy from orchestration mode. */
export function getThinkingMessage(context: ConversationContext): string {
  const pool =
    THINKING_MESSAGES[context.modeId] ??
    THINKING_MESSAGES["open-conversation"]!;
  const index =
    (context.rankedInsights.length + context.rankedRecommendations.length) %
    pool.length;
  return pool[index];
}

export function isReflectionExperience(context: ConversationContext): boolean {
  return (
    REFLECTION_MODES.has(context.modeId) ||
    context.resolved.id === "generate-reflection"
  );
}

/** Build 0–3 deterministic follow-up chips from orchestration outputs. */
export function buildFollowUpChips(
  context: ConversationContext,
  plan: ConversationPlan,
  parsed: ParsedCoachResponse,
  memory: ConversationMemory
): FollowUpChip[] {
  const chips: FollowUpChip[] = [];
  const seen = new Set<string>();

  function add(id: string, label: string, question: string) {
    const key = question.toLowerCase();
    if (seen.has(key) || chips.length >= 3) return;
    seen.add(key);
    chips.push({ id, label, question });
  }

  if (plan.selectedFollowUp) {
    add("planner-primary", truncateLabel(plan.selectedFollowUp), plan.selectedFollowUp);
  }

  for (const candidate of context.followUpCandidates) {
    add(`orch-${candidate.id}`, truncateLabel(candidate.question), candidate.question);
  }

  for (const template of DETERMINISTIC_CHIP_TEMPLATES) {
    if (template.when(context)) {
      add(
        template.id,
        template.label,
        template.buildQuestion(memory.currentTopic)
      );
    }
  }

  for (const question of parsed.suggestedQuestions) {
    add(`llm-${question.slice(0, 12)}`, truncateLabel(question), question);
  }

  return chips.slice(0, 3);
}

/** Map orchestrator prioritized actions to interactive action cards. */
export function buildActionCards(
  context: ConversationContext,
  plan: ConversationPlan,
  parsed: ParsedCoachResponse,
  isReflection: boolean
): ExperienceActionCard[] {
  if (isReflection && parsed.confidence < 0.6) {
    return [];
  }

  const reasonByRecId = new Map(
    context.rankedRecommendations.map((r) => [r.id, r.reason])
  );

  const cards: ExperienceActionCard[] = [];

  for (const action of plan.prioritizedActions) {
    const reason =
      reasonByRecId.get(action.sourceRecommendationId) ??
      context.rankedRecommendations[0]?.reason ??
      "Based on your recent patterns.";

    cards.push({
      id: action.id,
      title: action.label,
      reason: formatReason(reason),
      actionLabel: "Explore",
      capabilityId: mapCategoryToCapability(action.actionType),
    });
  }

  if (cards.length === 0) {
    for (const action of parsed.actions.slice(0, 3)) {
      cards.push({
        id: action.id,
        title: action.label,
        reason: "Suggested based on your conversation.",
        actionLabel: "Explore",
      });
    }
  }

  return cards.slice(0, 3);
}

/** Build per-message experience bundle from orchestration outputs. */
export function buildMessageExperience(
  context: ConversationContext,
  plan: ConversationPlan,
  parsed: ParsedCoachResponse,
  memory: ConversationMemory
): MessageExperience {
  const isReflection = isReflectionExperience(context);
  const followUpChips = buildFollowUpChips(context, plan, parsed, memory);
  const actionCards = buildActionCards(context, plan, parsed, isReflection);
  const ending = resolveConversationEnding(plan, followUpChips, actionCards);

  return {
    isReflectionMode: isReflection,
    followUpChips,
    actionCards,
    endingType: ending.type,
    endingMessage: ending.message,
  };
}

function resolveConversationEnding(
  plan: ConversationPlan,
  chips: FollowUpChip[],
  cards: ExperienceActionCard[]
): { type: MessageExperience["endingType"]; message: string | null } {
  if (plan.shouldEnd && !plan.shouldContinue) {
    return {
      type: "quiet",
      message: "Forge will be here when you're ready.",
    };
  }

  if (cards.length > 0) {
    return { type: "action", message: null };
  }

  if (chips.length > 0 || plan.selectedFollowUp) {
    return { type: "follow-up", message: null };
  }

  return { type: "quiet", message: null };
}

/** Resolve capability for multi-turn continuity from session memory. */
export function resolveContinuationCapability(
  message: string,
  memory: ConversationMemory,
  explicit?: CoachCapabilityId
): CoachCapabilityId | undefined {
  if (explicit) return explicit;
  if (!memory.previousCapability || memory.messageCount < 2) return undefined;

  const wordCount = message.trim().split(/\s+/).length;
  const isShortFollowUp = wordCount <= 8;
  const refersToPrior =
    /\b(change|that|this|it|those|same|again|more|why|what should)\b/i.test(
      message
    );

  if (isShortFollowUp && refersToPrior) {
    return memory.previousCapability;
  }

  return undefined;
}

function truncateLabel(text: string, max = 28): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

function formatReason(reason: string): string {
  const formatted = reason
    .replace(/_/g, " ")
    .replace(/(\d+)d window/, "$1-day window");
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function mapCategoryToCapability(
  category: string
): CoachCapabilityId | undefined {
  const map: Record<string, CoachCapabilityId> = {
    workout: "analyze-workout",
    hydration: "analyze-hydration",
    sleep: "adjust-routine",
    routine: "adjust-routine",
    reflection: "generate-reflection",
    consistency: "review-week",
  };
  return map[category];
}
