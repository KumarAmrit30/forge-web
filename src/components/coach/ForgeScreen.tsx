"use client";

import { useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useForgeConversation } from "@/lib/coach/conversation-manager";
import { ForgeHero } from "@/components/coach/ForgeHero";
import { ConversationStarters } from "@/components/coach/ConversationStarters";
import { ChatWindow } from "@/components/coach/ChatWindow";
import { CoachInput } from "@/components/coach/CoachInput";
import type { ConversationStarter } from "@/lib/coach/coach-types";
import type { ExperienceActionCard } from "@/lib/coach/conversation-experience";

export function ForgeScreen() {
  const profile = useSettingsStore((s) => s.profile);
  const {
    state,
    hasConversation,
    thinkingMessage,
    dynamicStarters,
    sendMessage,
    sendStarter,
    dismissAction,
  } = useForgeConversation(profile.name);
  const [awaitingCustomAsk, setAwaitingCustomAsk] = useState(false);

  const viewModel = state.viewModel;

  function handleStarterSelect(starter: ConversationStarter) {
    if (starter.id === "ask-forge") {
      setAwaitingCustomAsk(true);
      return;
    }
    void sendStarter(starter);
  }

  function handleSend(message: string) {
    setAwaitingCustomAsk(false);
    void sendMessage(message);
  }

  function handleFollowUp(
    question: string,
    capabilityId?: ExperienceActionCard["capabilityId"]
  ) {
    void sendMessage(question, { capabilityId });
  }

  if (!viewModel) {
    return (
      <div className="px-6 pt-8">
        <div className="h-48 animate-pulse rounded-[24px] bg-white/[0.03]" />
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,oklch(0.72_0.15_160/0.05),transparent_68%)]"
      />

      <div className="relative px-6 pt-8 pb-10">
        {!hasConversation && <ForgeHero hero={viewModel.hero} />}

        {!hasConversation && (
          <ConversationStarters
            starters={dynamicStarters}
            onSelect={handleStarterSelect}
            disabled={state.isThinking}
          />
        )}

        <ChatWindow
          messages={state.messages}
          isThinking={state.isThinking}
          thinkingMessage={thinkingMessage}
          dismissedActionIds={state.dismissedActionIds}
          onFollowUp={handleFollowUp}
          onDismissAction={dismissAction}
          disabled={state.isThinking}
        />

        {(hasConversation || awaitingCustomAsk) && (
          <div className="mt-6">
            <CoachInput
              onSend={handleSend}
              disabled={state.isThinking}
              placeholder={
                awaitingCustomAsk
                  ? "What would you like to ask Forge?"
                  : "Continue the conversation…"
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
