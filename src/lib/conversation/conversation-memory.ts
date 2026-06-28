import type { CoachCapabilityId } from "@/lib/brain";
import type { ConversationMemory } from "@/lib/conversation/conversation-types";

/** Create empty session memory. */
export function createConversationMemory(): ConversationMemory {
  return {
    currentTopic: null,
    lastRecommendation: null,
    lastFollowUp: null,
    referencedHabit: null,
    previousCapability: null,
    messageCount: 0,
  };
}

export type UpdateMemoryInput = {
  userMessage: string;
  capabilityId: CoachCapabilityId | null;
  topRecommendation?: string | null;
  topFollowUp?: string | null;
  referencedHabit?: string | null;
};

/** Update session memory after a user message or assistant response. */
export function updateConversationMemory(
  memory: ConversationMemory,
  input: UpdateMemoryInput
): ConversationMemory {
  return {
    currentTopic: input.userMessage.trim() || memory.currentTopic,
    lastRecommendation:
      input.topRecommendation ?? memory.lastRecommendation,
    lastFollowUp: input.topFollowUp ?? memory.lastFollowUp,
    referencedHabit: input.referencedHabit ?? memory.referencedHabit,
    previousCapability: input.capabilityId ?? memory.previousCapability,
    messageCount: memory.messageCount + 1,
  };
}

/** Record memory state before processing an incoming user message. */
export function memoryBeforeUserMessage(
  memory: ConversationMemory,
  userMessage: string,
  capabilityId: CoachCapabilityId | null
): ConversationMemory {
  return updateConversationMemory(memory, {
    userMessage,
    capabilityId,
  });
}

/** Record memory state after receiving an assistant response. */
export function memoryAfterAssistantResponse(
  memory: ConversationMemory,
  input: {
    capabilityId: CoachCapabilityId | null;
    topRecommendation?: string | null;
    selectedFollowUp?: string | null;
    referencedHabit?: string | null;
  }
): ConversationMemory {
  return updateConversationMemory(memory, {
    userMessage: memory.currentTopic ?? "",
    capabilityId: input.capabilityId,
    topRecommendation: input.topRecommendation,
    topFollowUp: input.selectedFollowUp,
    referencedHabit: input.referencedHabit,
  });
}

/** Whether the user is continuing the same topic as the previous turn. */
export function isTopicContinuation(
  memory: ConversationMemory,
  capabilityId: CoachCapabilityId | null
): boolean {
  return (
    memory.previousCapability !== null &&
    memory.previousCapability === capabilityId &&
    memory.messageCount > 1
  );
}
