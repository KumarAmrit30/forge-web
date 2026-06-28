import { generateId } from "@/lib/id";
import type { CoachMessage, ConversationState } from "@/lib/coach/coach-types";
import { createConversationMemory } from "@/lib/conversation";

export function createInitialConversationState(): ConversationState {
  return {
    messages: [],
    isThinking: false,
    isStreaming: false,
    partialResponse: "",
    thinkingMessage: null,
    brain: null,
    viewModel: null,
    sessionMemory: createConversationMemory(),
    conversationPlan: null,
    dismissedActionIds: [],
  };
}

export function createUserMessage(content: string): CoachMessage {
  return {
    id: generateId(),
    role: "user",
    content,
    timestamp: new Date().toISOString(),
  };
}

export function createAssistantMessage(
  content: string,
  parsed?: CoachMessage["parsed"],
  experience?: CoachMessage["experience"]
): CoachMessage {
  return {
    id: generateId(),
    role: "assistant",
    content,
    timestamp: new Date().toISOString(),
    parsed,
    experience,
  };
}
