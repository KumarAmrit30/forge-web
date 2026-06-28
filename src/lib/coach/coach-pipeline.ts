import type { CoachCapabilityId, ForgeBrainResult } from "@/lib/brain";
import type { ForgeContext } from "@/lib/brain/types";
import type {
  CoachConversationTurn,
  ForgeCoachPrompt,
} from "@/lib/coach/coach-types";
import {
  createConversationMemory,
  orchestrateConversation,
  type ConversationContext,
  type ConversationMemory,
} from "@/lib/conversation";

export type BuildCoachPromptFromMessageInput = {
  message: string;
  capabilityId?: CoachCapabilityId;
  conversationHistory?: CoachConversationTurn[];
  memory?: ConversationMemory;
  strict?: boolean;
  /** When set, Brain reads this context instead of Zustand stores (server path). */
  context?: ForgeContext;
};

export type CoachPromptPipelineResult = {
  prompt: ForgeCoachPrompt;
  brain: ForgeBrainResult;
  conversationContext: ConversationContext;
  memory: ConversationMemory;
};

/**
 * Run Capability Resolver → Brain → Context Optimizer → Response Composer → Prompt Builder
 * for a user message. Shared by the Forge UI and the generate API route.
 */
export function buildCoachPromptFromMessage(
  input: BuildCoachPromptFromMessageInput
): CoachPromptPipelineResult {
  const memory = input.memory ?? createConversationMemory();
  const result = orchestrateConversation({
    message: input.message,
    capabilityId: input.capabilityId,
    conversationHistory: input.conversationHistory,
    memory,
    strict: input.strict,
    context: input.context,
  });

  return {
    prompt: result.prompt,
    brain: result.brain,
    conversationContext: result.conversationContext,
    memory,
  };
}
