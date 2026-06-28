import { COACH_RESPONSE_JSON_SCHEMA } from "@/lib/coach/json-validator";
import { LLM_MODEL_CONFIG } from "@/lib/coach/model-config";
import type {
  CoachConversationTurn,
  ForgeCoachPrompt,
} from "@/lib/coach/coach-types";
import type { ConversationContext } from "@/lib/conversation/conversation-types";
import { buildPersonalityPromptForCapability } from "@/lib/personality";

export type BuildCoachPromptInput = {
  conversationContext: ConversationContext;
  conversationHistory: CoachConversationTurn[];
  userMessage: string;
  strict?: boolean;
};

function section(title: string, body: unknown): string {
  return `${title}\n${typeof body === "string" ? body : JSON.stringify(body, null, 2)}`;
}

/**
 * Build the fixed-order Forge Coach prompt for the LLM layer.
 * Consumes ConversationContext (orchestrated) + Personality Layer — never raw Brain slices.
 * Section order must never change.
 */
export function buildCoachPrompt(input: BuildCoachPromptInput): ForgeCoachPrompt {
  const { conversationContext, conversationHistory, userMessage, strict } =
    input;

  const { resolved, optimized, modeId } = conversationContext;

  const personality = buildPersonalityPromptForCapability(
    resolved.id,
    strict
  );

  const systemSections = [
    "SYSTEM",
    section("FORGE PERSONALITY", personality.identity),
    section("COMMUNICATION PRINCIPLES", personality.principles),
    section("WRITING RULES", personality.writingRules),
    section("CONVERSATION MODE", personality.conversationMode),
    section("GUARDRAILS", personality.guardrails),
    section("RESPONSE GUIDELINES", personality.responseGuidelines),
    section("ORCHESTRATION DIRECTIVES", {
      modeId,
      responseDepth: conversationContext.responseDepth,
      insightLimit: conversationContext.insightLimit,
      recommendationLimit: conversationContext.recommendationLimit,
      followUpLimit: conversationContext.followUpLimit,
      followUpCandidates: conversationContext.followUpCandidates,
    }),
    section("FORGE IDENTITY", optimized.identity),
    section("CAPABILITY", {
      id: resolved.id,
      title: resolved.title,
      description: resolved.description,
      source: resolved.source,
    }),
    section("CONTEXT", {
      today: optimized.today,
      settings: optimized.settings,
      dayRecords: optimized.dayRecords,
      monthRecords: optimized.monthRecords,
      workout: optimized.workout,
      water: optimized.water,
      progress: optimized.progress,
      memory: optimized.memory,
    }),
    section("SURFACED INSIGHTS", conversationContext.rankedInsights),
    section("SURFACED RECOMMENDATIONS", conversationContext.rankedRecommendations),
    section("SURFACED PATTERNS", conversationContext.rankedPatterns),
    section("SURFACED BEHAVIORS", conversationContext.rankedBehaviors),
    section("SURFACED PREDICTIONS", conversationContext.rankedPredictions),
    section("SURFACED TRENDS", conversationContext.rankedTrends),
    section("CONVERSATION HISTORY", conversationHistory),
    section("USER MESSAGE", userMessage),
    section("EXPECTED JSON SCHEMA", COACH_RESPONSE_JSON_SCHEMA),
  ];

  return {
    systemInstruction: systemSections.join("\n\n"),
    userContent: userMessage,
    responseJsonSchema: COACH_RESPONSE_JSON_SCHEMA,
    modelConfig: LLM_MODEL_CONFIG,
    strict: Boolean(strict),
  };
}
