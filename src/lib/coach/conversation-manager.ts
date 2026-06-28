"use client";

import { useCallback, useMemo, useState } from "react";
import { runForgeBrain } from "@/lib/brain";
import type { CoachCapabilityId } from "@/lib/brain";
import { buildCoachPromptFromMessage } from "@/lib/coach/coach-pipeline";
import {
  buildForgeCoachViewModel,
  resolveStarterQuestion,
} from "@/lib/coach/coach-prompts";
import {
  buildMessageExperience,
  getThinkingMessage,
  resolveContinuationCapability,
  selectDynamicStarters,
} from "@/lib/coach/conversation-experience";
import {
  createAssistantMessage,
  createInitialConversationState,
  createUserMessage,
} from "@/lib/coach/coach-session";
import {
  createGracefulErrorResponse,
  validateCoachResponseJson,
} from "@/lib/coach/json-validator";
import {
  formatParsedResponse,
  parseCoachResponse,
} from "@/lib/coach/response-parser";
import { llmClient } from "@/lib/coach/llm-client";
import {
  memoryBeforeUserMessage,
  planConversation,
} from "@/lib/conversation";
import type { ConversationMemory } from "@/lib/conversation/conversation-types";
import type {
  CoachConversationTurn,
  CoachMessage,
  ConversationStarter,
  ConversationState,
} from "@/lib/coach/coach-types";

type SendMessageOptions = {
  capabilityId?: CoachCapabilityId;
};

function createConversationState(userName: string): ConversationState {
  const brain = runForgeBrain();
  return {
    ...createInitialConversationState(),
    brain,
    viewModel: buildForgeCoachViewModel(brain, userName),
  };
}

function toConversationHistory(messages: CoachMessage[]): CoachConversationTurn[] {
  return messages.slice(-8).map((message) => ({
    role: message.role,
    content: message.parsed?.summary ?? message.content,
  }));
}

/**
 * Orchestrates Forge conversation flow:
 * Memory → Capability Resolver → Brain → Response Composer → Prompt Builder →
 * LLM Client → JSON Validator → Response Parser → Conversation Planner → State
 */
export function useForgeConversation(userName: string) {
  const [state, setState] = useState<ConversationState>(() =>
    createConversationState(userName)
  );

  const dynamicStarters = useMemo(() => {
    if (!state.viewModel?.brain) return [];
    return selectDynamicStarters(
      state.viewModel.brain,
      state.sessionMemory,
      state.viewModel.starters
    );
  }, [state.viewModel, state.sessionMemory]);

  const sendMessage = useCallback(
    async (text: string, options: SendMessageOptions = {}) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      let priorMessages: CoachMessage[] = [];
      let sessionMemory: ConversationMemory;
      let blocked = false;

      setState((current) => {
        if (current.isThinking || current.isStreaming) {
          blocked = true;
          return current;
        }
        priorMessages = current.messages;
        const capabilityId =
          resolveContinuationCapability(
            trimmed,
            current.sessionMemory,
            options.capabilityId
          ) ?? options.capabilityId ?? null;

        sessionMemory = memoryBeforeUserMessage(
          current.sessionMemory,
          trimmed,
          capabilityId
        );
        return {
          ...current,
          messages: [...current.messages, createUserMessage(trimmed)],
          isThinking: true,
          isStreaming: false,
          partialResponse: "",
          thinkingMessage: null,
          sessionMemory,
        };
      });
      if (blocked) return;

      const effectiveCapability =
        resolveContinuationCapability(
          trimmed,
          sessionMemory!,
          options.capabilityId
        ) ?? options.capabilityId;

      const { prompt, brain, conversationContext } =
        buildCoachPromptFromMessage({
          message: trimmed,
          capabilityId: effectiveCapability,
          conversationHistory: toConversationHistory(priorMessages),
          memory: sessionMemory!,
        });

      setState((current) => ({
        ...current,
        isStreaming: true,
        thinkingMessage: getThinkingMessage(conversationContext),
      }));

      const llmResponse = await llmClient.complete(
        { prompt, stream: true },
        {
          onPartial: (partialText) => {
            setState((current) => ({
              ...current,
              partialResponse: partialText,
            }));
          },
        }
      );

      const validation = llmResponse.rawText
        ? validateCoachResponseJson(llmResponse.rawText)
        : { valid: false as const, error: "empty_response" };

      const coachResponse = validation.valid
        ? validation.data
        : createGracefulErrorResponse();

      const parsed = parseCoachResponse(coachResponse);
      const { plan, memory: updatedMemory } = planConversation({
        parsed,
        context: conversationContext,
        memory: sessionMemory!,
      });

      const experience = buildMessageExperience(
        conversationContext,
        plan,
        parsed,
        updatedMemory
      );

      const assistantMessage = createAssistantMessage(
        formatParsedResponse(parsed),
        parsed,
        experience
      );

      setState((current) => ({
        ...current,
        messages: [...current.messages, assistantMessage],
        isThinking: false,
        isStreaming: false,
        partialResponse: "",
        thinkingMessage: null,
        brain,
        viewModel: buildForgeCoachViewModel(brain, userName),
        sessionMemory: updatedMemory,
        conversationPlan: plan,
      }));
    },
    [userName]
  );

  const sendStarter = useCallback(
    async (starter: ConversationStarter, customQuestion?: string) => {
      const question = resolveStarterQuestion(starter, customQuestion);
      if (!question) return;
      await sendMessage(question, {
        capabilityId: starter.capabilityId ?? undefined,
      });
    },
    [sendMessage]
  );

  const dismissAction = useCallback((actionId: string) => {
    setState((current) => ({
      ...current,
      dismissedActionIds: [...current.dismissedActionIds, actionId],
    }));
  }, []);

  const hasConversation = state.messages.length > 0;

  return useMemo(
    () => ({
      state,
      hasConversation,
      isStreaming: state.isStreaming,
      partialResponse: state.partialResponse,
      thinkingMessage: state.thinkingMessage,
      dynamicStarters,
      sendMessage,
      sendStarter,
      dismissAction,
    }),
    [
      state,
      hasConversation,
      dynamicStarters,
      sendMessage,
      sendStarter,
      dismissAction,
    ]
  );
}

export type ForgeConversation = ReturnType<typeof useForgeConversation>;
