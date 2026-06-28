"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildUndoAcknowledgement,
  buildExecutionAcknowledgement,
} from "@/lib/coach/execution-continuation";
import { runExecution, undoExecution } from "@/lib/execution";
import type { ExecutionRequest, ExecutionResult } from "@/lib/execution/execution-types";
import type {
  ExecutionFlowResult,
  ExecutionFlowStatus,
  ExecutionIntent,
} from "@/lib/execution-ui/intent-types";

const BANNER_DISMISS_MS = 6000;

function toEngineRequest(intent: ExecutionIntent): ExecutionRequest {
  return intent.executionRequest as unknown as ExecutionRequest;
}

type UseExecutionFlowOptions = {
  onConversationAcknowledge?: (content: string) => void;
  onTimelineRefresh?: () => void;
  onExecutionComplete?: (intentId: string) => void;
};

export function useExecutionFlow(options: UseExecutionFlowOptions = {}) {
  const [pendingIntent, setPendingIntent] = useState<ExecutionIntent | null>(
    null
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [status, setStatus] = useState<ExecutionFlowStatus>("idle");
  const [flowResult, setFlowResult] = useState<ExecutionFlowResult | null>(
    null
  );
  const [bannerVisible, setBannerVisible] = useState(false);
  const [lastHandlerId, setLastHandlerId] = useState<string | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDismissTimer = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  const scheduleBannerDismiss = useCallback(() => {
    clearDismissTimer();
    dismissTimerRef.current = setTimeout(() => {
      setBannerVisible(false);
    }, BANNER_DISMISS_MS);
  }, [clearDismissTimer]);

  useEffect(() => () => clearDismissTimer(), [clearDismissTimer]);

  const beginReview = useCallback((intent: ExecutionIntent) => {
    setPendingIntent(intent);
    setConfirmOpen(true);
    setStatus("reviewing");
  }, []);

  const cancelReview = useCallback(() => {
    setConfirmOpen(false);
    setPendingIntent(null);
    setStatus("idle");
  }, []);

  const applyConfirmed = useCallback(() => {
    if (!pendingIntent) return;

    setStatus("executing");
    const engineResult: ExecutionResult = runExecution(
      toEngineRequest(pendingIntent)
    );

    setLastHandlerId(pendingIntent.executionRequest.handlerId);
    setConfirmOpen(false);

    if (engineResult.success) {
      const result: ExecutionFlowResult = {
        success: true,
        message: `${pendingIntent.title} applied`,
        historyEntryId: engineResult.historyEntryId,
        undoAvailable: engineResult.undoAvailable,
        intentId: pendingIntent.id,
      };
      setFlowResult(result);
      setStatus("success");
      setBannerVisible(true);
      scheduleBannerDismiss();
      options.onExecutionComplete?.(pendingIntent.id);
      options.onConversationAcknowledge?.(
        buildExecutionAcknowledgement(engineResult, pendingIntent)
      );
      options.onTimelineRefresh?.();
    } else {
      setFlowResult({
        success: false,
        message: engineResult.message,
        undoAvailable: false,
        intentId: pendingIntent.id,
      });
      setStatus("error");
      options.onConversationAcknowledge?.(
        buildExecutionAcknowledgement(engineResult, pendingIntent)
      );
    }

    setPendingIntent(null);
  }, [pendingIntent, options, scheduleBannerDismiss]);

  const undoLast = useCallback(() => {
    if (!flowResult?.historyEntryId || !lastHandlerId) return;

    setStatus("executing");
    const undoResult = undoExecution({
      historyEntryId: flowResult.historyEntryId,
      source: "undo",
    });

    if (undoResult.success) {
      setFlowResult({
        success: true,
        message: "Change undone",
        undoAvailable: false,
        intentId: flowResult.intentId,
      });
      setBannerVisible(false);
      clearDismissTimer();
      options.onConversationAcknowledge?.(
        buildUndoAcknowledgement(undoResult, lastHandlerId)
      );
      options.onTimelineRefresh?.();
      setStatus("idle");
    } else {
      setFlowResult({
        success: false,
        message: undoResult.message,
        undoAvailable: flowResult.undoAvailable,
        intentId: flowResult.intentId,
      });
      setStatus("error");
      options.onConversationAcknowledge?.(
        buildUndoAcknowledgement(undoResult, lastHandlerId)
      );
    }
  }, [flowResult, lastHandlerId, options, clearDismissTimer]);

  const dismissBanner = useCallback(() => {
    setBannerVisible(false);
    clearDismissTimer();
    if (status === "success") {
      setStatus("idle");
    }
  }, [clearDismissTimer, status]);

  return {
    pendingIntent,
    confirmOpen,
    status,
    flowResult,
    bannerVisible,
    beginReview,
    cancelReview,
    applyConfirmed,
    undoLast,
    dismissBanner,
  };
}
