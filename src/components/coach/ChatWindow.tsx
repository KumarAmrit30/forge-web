"use client";

import { useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { ConversationEnding } from "@/components/coach/ConversationEnding";
import { ExecutionPreviewCard } from "@/components/execution/ExecutionPreviewCard";
import { FollowUpChips } from "@/components/coach/FollowUpChips";
import { MessageBubble } from "@/components/coach/MessageBubble";
import { ThinkingIndicator } from "@/components/coach/ThinkingIndicator";
import { HomeSectionLabel } from "@/components/home/home-ui";
import type { ExperienceActionCard } from "@/lib/coach/conversation-experience";
import type { CoachMessage } from "@/lib/coach/coach-types";
import type { ConversationPlan } from "@/lib/conversation/conversation-types";
import {
  buildExecutionIntent,
  toActionPriority,
} from "@/lib/execution-ui";
import type { ExecutionIntent } from "@/lib/execution-ui/intent-types";

type Props = {
  messages: CoachMessage[];
  isThinking: boolean;
  thinkingMessage?: string | null;
  dismissedActionIds: string[];
  conversationPlan: ConversationPlan | null;
  onFollowUp: (question: string, capabilityId?: ExperienceActionCard["capabilityId"]) => void;
  onReviewIntent: (intent: ExecutionIntent) => void;
  onDismissAction: (actionId: string) => void;
  disabled?: boolean;
};

function resolveActionForCard(
  cardId: string,
  plan: ConversationPlan | null,
  parsedActions: Array<{ id: string; label: string; actionType: string }>
) {
  const fromPlan = plan?.prioritizedActions.find((action) => action.id === cardId);
  if (fromPlan) return fromPlan;

  const parsed = parsedActions.find((action) => action.id === cardId);
  if (parsed) {
    return toActionPriority(parsed);
  }

  return null;
}

export function ChatWindow({
  messages,
  isThinking,
  thinkingMessage,
  dismissedActionIds,
  conversationPlan,
  onFollowUp,
  onReviewIntent,
  onDismissAction,
  disabled,
}: Props) {
  const lastAssistant = [...messages]
    .reverse()
    .find((message) => message.role === "assistant");

  const executionIntents = useMemo(() => {
    if (!lastAssistant?.experience?.actionCards) return [];

    return lastAssistant.experience.actionCards
      .filter((card) => !dismissedActionIds.includes(card.id))
      .map((card) => {
        const action = resolveActionForCard(
          card.id,
          conversationPlan,
          lastAssistant.parsed?.actions ?? []
        );
        if (!action) return null;

        return buildExecutionIntent({
          action,
          reason: card.reason,
          messageId: lastAssistant.id,
        });
      })
      .filter((intent): intent is ExecutionIntent => intent !== null);
  }, [
    lastAssistant,
    conversationPlan,
    dismissedActionIds,
  ]);

  const followUpChips = lastAssistant?.experience?.followUpChips ?? [];
  const showEnding =
    !isThinking &&
    lastAssistant?.experience?.endingType === "quiet" &&
    lastAssistant.experience.endingMessage;

  if (messages.length === 0 && !isThinking) {
    return null;
  }

  return (
    <section className="mt-10 space-y-5">
      <HomeSectionLabel>Conversation</HomeSectionLabel>

      <div className="space-y-5">
        {messages.map((message) => (
          <div key={message.id} className="space-y-4">
            <MessageBubble message={message} />
          </div>
        ))}

        {isThinking && <ThinkingIndicator message={thinkingMessage} />}
      </div>

      <AnimatePresence mode="popLayout">
        {!isThinking && executionIntents.length > 0 && (
          <div className="space-y-3 pt-1">
            {executionIntents.map((intent, index) => (
              <ExecutionPreviewCard
                key={intent.id}
                intent={intent}
                index={index}
                onReview={onReviewIntent}
                onDismiss={onDismissAction}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {!isThinking && followUpChips.length > 0 && (
        <FollowUpChips
          chips={followUpChips}
          onSelect={(question) => onFollowUp(question)}
          disabled={disabled}
        />
      )}

      {showEnding && (
        <ConversationEnding message={lastAssistant.experience!.endingMessage!} />
      )}
    </section>
  );
}
