import type {
  BehaviorInsight,
  CoachCapability,
  CoachCapabilityId,
  ForgeContext,
  IdentityProfile,
  MemoryEntry,
  Pattern,
  Prediction,
  PromptPayload,
  Recommendation,
  Trend,
} from "@/lib/brain/types";

export type PromptBuilderInput = {
  question: string;
  capabilityId?: CoachCapabilityId | null;
  context: ForgeContext;
  identity: IdentityProfile;
  patterns: Pattern[];
  trends: Trend[];
  behaviors: BehaviorInsight[];
  predictions: Prediction[];
  recommendations: Recommendation[];
  memory: MemoryEntry[];
  capabilities: CoachCapability[];
};

/**
 * Assemble a PromptPayload for Gemini.
 * Phase 2 extends the contract — no prompt text or Vertex AI calls.
 */
export function buildPromptPayload(input: PromptBuilderInput): PromptPayload {
  return {
    question: input.question,
    capabilityId: input.capabilityId ?? null,
    context: input.context,
    identity: input.identity,
    patterns: input.patterns,
    trends: input.trends,
    behaviors: input.behaviors,
    predictions: input.predictions,
    recommendations: input.recommendations,
    memory: input.memory,
    capabilities: input.capabilities,
    systemInstructions: "",
    userContent: "",
  };
}
