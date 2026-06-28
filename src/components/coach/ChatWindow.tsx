"use client";

import { AnimatePresence } from "framer-motion";
import { CoachActionCard } from "@/components/coach/CoachActionCard";
import { ConversationEnding } from "@/components/coach/ConversationEnding";
import { FollowUpChips } from "@/components/coach/FollowUpChips";
import { MessageBubble } from "@/components/coach/MessageBubble";
import { ThinkingIndicator } from "@/components/coach/ThinkingIndicator";
import { HomeSectionLabel } from "@/components/home/home-ui";
import type { ExperienceActionCard } from "@/lib/coach/conversation-experience";
import type { CoachMessage } from "@/lib/coach/coach-types";

type Props = {
  messages: CoachMessage[];
  isThinking: boolean;
  thinkingMessage?: string | null;
  dismissedActionIds: string[];
  onFollowUp: (question: string, capabilityId?: ExperienceActionCard["capabilityId"]) => void;
  onDismissAction: (actionId: string) => void;
  disabled?: boolean;
};

export function ChatWindow({
  messages,
  isThinking,
  thinkingMessage,
  dismissedActionIds,
  onFollowUp,
  onDismissAction,
  disabled,
}: Props) {
  const lastAssistant = [...messages]
    .reverse()
    .find((message) => message.role === "assistant");

  if (messages.length === 0 && !isThinking) {
    return null;
  }

  const visibleActionCards =
    lastAssistant?.experience?.actionCards.filter(
      (card) => !dismissedActionIds.includes(card.id)
    ) ?? [];

  const followUpChips = lastAssistant?.experience?.followUpChips ?? [];
  const showEnding =
    !isThinking &&
    lastAssistant?.experience?.endingType === "quiet" &&
    lastAssistant.experience.endingMessage;

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
        {!isThinking && visibleActionCards.length > 0 && (
          <div className="space-y-3 pt-1">
            {visibleActionCards.map((card, index) => (
              <CoachActionCard
                key={card.id}
                card={card}
                index={index}
                onPrimary={(selected) =>
                  onFollowUp(
                    `Help me with: ${selected.title}`,
                    selected.capabilityId
                  )
                }
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
