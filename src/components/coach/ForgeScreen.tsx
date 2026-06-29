"use client";

import { useMemo, useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useForgeConversation } from "@/lib/coach/conversation-manager";
import { ForgeHero } from "@/components/coach/ForgeHero";
import { ConversationStarters } from "@/components/coach/ConversationStarters";
import { ChatWindow } from "@/components/coach/ChatWindow";
import { CoachInput } from "@/components/coach/CoachInput";
import { ExecutionConfirmationDialog } from "@/components/execution/ExecutionConfirmationDialog";
import { ExecutionSuccessBanner } from "@/components/execution/ExecutionSuccessBanner";
import { ExecutionTimeline } from "@/components/execution/ExecutionTimeline";
import type { ConversationStarter } from "@/lib/coach/coach-types";
import {
  buildExecutionTimeline,
  useExecutionFlow,
} from "@/lib/execution-ui";
import { PageShell } from "@/components/ui/page-shell";
import { Skeleton } from "@/components/ui/skeleton";

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
    appendAcknowledgement,
  } = useForgeConversation(profile.name);
  const [awaitingCustomAsk, setAwaitingCustomAsk] = useState(false);
  const [timelineVersion, setTimelineVersion] = useState(0);

  const timelineEntries = useMemo(
    () => buildExecutionTimeline(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- timelineVersion forces refresh after execution
    [timelineVersion]
  );

  const executionFlow = useExecutionFlow({
    onConversationAcknowledge: appendAcknowledgement,
    onTimelineRefresh: () => setTimelineVersion((v) => v + 1),
    onExecutionComplete: dismissAction,
  });

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

  if (!viewModel) {
    return (
      <PageShell className="space-y-4 pb-10">
        <Skeleton className="h-32 w-full rounded-[24px]" />
        <Skeleton className="h-24 w-full rounded-[24px]" />
        <Skeleton className="h-12 w-full rounded-full" />
      </PageShell>
    );
  }

  return (
    <PageShell className="overflow-hidden pb-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,oklch(0.72_0.15_160/0.05),transparent_68%)]"
      />

      <div className="relative">
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
          conversationPlan={state.conversationPlan}
          onFollowUp={(question, capabilityId) =>
            void sendMessage(question, { capabilityId })
          }
          onDismissAction={dismissAction}
          onReviewIntent={executionFlow.beginReview}
          disabled={state.isThinking || executionFlow.status === "executing"}
        />

        <ExecutionTimeline entries={timelineEntries} />

        {(hasConversation || awaitingCustomAsk) && (
          <div className="mt-6">
            <CoachInput
              onSend={handleSend}
              disabled={state.isThinking || executionFlow.status === "executing"}
              placeholder={
                awaitingCustomAsk
                  ? "What would you like to ask Forge?"
                  : "Continue the conversation…"
              }
            />
          </div>
        )}
      </div>

      <ExecutionConfirmationDialog
        open={executionFlow.confirmOpen}
        intent={executionFlow.pendingIntent}
        status={executionFlow.status}
        onConfirm={executionFlow.applyConfirmed}
        onCancel={executionFlow.cancelReview}
      />

      <ExecutionSuccessBanner
        visible={executionFlow.bannerVisible}
        result={executionFlow.flowResult}
        onUndo={executionFlow.undoLast}
        onDismiss={executionFlow.dismissBanner}
      />
    </PageShell>
  );
}
