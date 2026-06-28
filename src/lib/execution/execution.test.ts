import { describe, expect, it } from "vitest";
import {
  buildDefaultPayload,
  buildValidationContext,
  clearExecutionHistory,
  cloneHistoryEntries,
  createExecutionRequest,
  dispatchExecutionEvent,
  exportExecutionHistory,
  getHistoryEntry,
  importExecutionHistory,
  listExecutionHistory,
  resolveRegistryEntry,
  runExecution,
  subscribeExecutionEvents,
  undoExecution,
  validateExecutionRequest,
  VALIDATION_RULES,
} from "@/lib/execution";
import type { ExecutionRequest } from "@/lib/execution/execution-types";
import { getSettingsSnapshot } from "@/stores/settingsStore";
import { getWorkoutSnapshot } from "@/stores/workoutStore";
import { defaultSettings } from "@/lib/execution/execution.test-setup";

function makeRequest(
  input: Omit<ExecutionRequest, "id"> & { id?: string }
): ExecutionRequest {
  return {
    id: input.id ?? "test-request-id",
    handlerId: input.handlerId,
    category: input.category,
    actionType: input.actionType,
    payload: input.payload,
    source: input.source,
    metadata: input.metadata,
  };
}

describe("registry resolution", () => {
  it("resolves hydration by label pattern", () => {
    const entry = resolveRegistryEntry({
      actionType: "general",
      label: "Increase hydration goal",
    });
    expect(entry?.handlerId).toBe("update-water-goal");
  });

  it("resolves workout by actionType fallback", () => {
    const entry = resolveRegistryEntry({
      actionType: "workout",
      label: "Generic label",
    });
    expect(entry?.handlerId).toBe("move-workout-schedule");
  });

  it("returns undefined for unknown actions", () => {
    expect(
      resolveRegistryEntry({ actionType: "unknown", label: "Nothing here" })
    ).toBeUndefined();
  });
});

describe("validation", () => {
  const context = buildValidationContext();

  it("passes valid hydration request", () => {
    const result = validateExecutionRequest(
      makeRequest({
        handlerId: "update-water-goal",
        category: "hydration",
        actionType: "hydration",
        payload: { targetMl: 4000 },
        source: "manual",
      }),
      context
    );
    expect(result.valid).toBe(true);
  });

  it("fails hydration when goal exceeds bounds", () => {
    const result = validateExecutionRequest(
      makeRequest({
        handlerId: "update-water-goal",
        category: "hydration",
        actionType: "hydration",
        payload: { targetMl: 50_000 },
        source: "manual",
      }),
      context
    );
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors[0]?.code).toBe("invalid_water_goal");
    }
  });

  it("fails sleep when targetHours missing", () => {
    const result = validateExecutionRequest(
      makeRequest({
        handlerId: "update-sleep-goal",
        category: "sleep",
        actionType: "sleep",
        payload: {},
        source: "manual",
      }),
      context
    );
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => e.code === "missing_payload")).toBe(true);
    }
  });

  it("fails placeholder handlers", () => {
    const result = validateExecutionRequest(
      makeRequest({
        handlerId: "schedule-notification",
        category: "notifications",
        actionType: "notifications",
        payload: {},
        source: "manual",
      }),
      context
    );
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors[0]?.code).toBe("not_implemented");
    }
  });

  it("fails settings profile without profile object", () => {
    const result = validateExecutionRequest(
      makeRequest({
        handlerId: "update-settings-profile",
        category: "settings",
        actionType: "settings",
        payload: {},
        source: "manual",
      }),
      context
    );
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors[0]?.code).toBe("invalid_profile");
    }
  });

  it("fails invalid calendar date", () => {
    const result = validateExecutionRequest(
      makeRequest({
        handlerId: "mark-calendar-day",
        category: "calendar",
        actionType: "calendar",
        payload: { date: "not-a-date" },
        source: "manual",
      }),
      context
    );
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors[0]?.code).toBe("invalid_date");
    }
  });

  it("skips payload validation for undo source", () => {
    const result = validateExecutionRequest(
      makeRequest({
        handlerId: "update-water-goal",
        category: "hydration",
        actionType: "hydration",
        payload: { dailyWaterGoal: defaultSettings.profile.dailyWaterGoal },
        source: "undo",
      }),
      context
    );
    expect(result.valid).toBe(true);
  });

  it("never throws on malformed input", () => {
    const result = validateExecutionRequest(
      makeRequest({
        handlerId: "update-water-goal",
        category: "hydration",
        actionType: "hydration",
        payload: { targetMl: Number.NaN },
        source: "manual",
      }),
      context
    );
    expect(result.valid).toBe(false);
  });
});

describe("execution pipeline", () => {
  it("executes hydration and produces one result, history entry, and event", () => {
    clearExecutionHistory();
    const events: string[] = [];
    const unsubscribe = subscribeExecutionEvents((event) => {
      events.push(event.type);
    });

    const request = createExecutionRequest({
      handlerId: "update-water-goal",
      category: "hydration",
      actionType: "hydration",
      payload: { targetMl: 3750 },
      source: "manual",
      metadata: {
        conversationId: "conv-1",
        capabilityId: "analyze-hydration",
      },
    });

    const beforeCount = listExecutionHistory().length;
    const result = runExecution(request);

    unsubscribe();

    expect(result.success).toBe(true);
    expect(result.events).toHaveLength(1);
    expect(result.events[0]?.type).toBe("HydrationGoalUpdated");
    expect(events).toHaveLength(1);
    expect(listExecutionHistory().length).toBe(beforeCount + 1);
    expect(getSettingsSnapshot().profile.dailyWaterGoal).toBe(3750);
    expect(result.undoAvailable).toBe(true);
    expect(result.historyEntryId).toBeDefined();
  });

  it("does not record history or emit events on validation failure", () => {
    clearExecutionHistory();
    const events: string[] = [];
    const unsubscribe = subscribeExecutionEvents((event) => {
      events.push(event.type);
    });

    const result = runExecution(
      makeRequest({
        handlerId: "update-sleep-goal",
        category: "sleep",
        actionType: "sleep",
        payload: {},
        source: "manual",
      })
    );

    unsubscribe();

    expect(result.success).toBe(false);
    expect(result.events).toHaveLength(0);
    expect(events).toHaveLength(0);
    expect(listExecutionHistory()).toHaveLength(0);
  });

  it("does not mutate stores on execution failure", () => {
    const before = getSettingsSnapshot().profile.dailySleepGoal;
    runExecution(
      makeRequest({
        handlerId: "update-sleep-goal",
        category: "sleep",
        actionType: "sleep",
        payload: { targetHours: 99 },
        source: "manual",
      })
    );
    expect(getSettingsSnapshot().profile.dailySleepGoal).toBe(before);
  });

  it("executes workout schedule shift", () => {
    const before = getWorkoutSnapshot().plan.days.map((day) => day.id);
    const result = runExecution(
      createExecutionRequest({
        handlerId: "move-workout-schedule",
        category: "workout",
        actionType: "workout",
        payload: { shiftDays: 1 },
        source: "manual",
      })
    );
    expect(result.success).toBe(true);
    const after = getWorkoutSnapshot().plan.days.map((day) => day.id);
    expect(after).not.toEqual(before);
  });
});

describe("undo pipeline", () => {
  it("restores previous values and emits one undo event", () => {
    const request = createExecutionRequest({
      handlerId: "update-water-goal",
      category: "hydration",
      actionType: "hydration",
      payload: { targetMl: 3800 },
      source: "manual",
    });

    const original = getSettingsSnapshot().profile.dailyWaterGoal;
    const executed = runExecution(request);
    expect(executed.success).toBe(true);

    const undoEvents: string[] = [];
    const unsubscribe = subscribeExecutionEvents((event) => {
      undoEvents.push(event.type);
    });

    const undone = undoExecution({
      historyEntryId: executed.historyEntryId!,
      source: "undo",
    });

    unsubscribe();

    expect(undone.success).toBe(true);
    expect(undone.events).toHaveLength(1);
    expect(undone.events[0]?.type).toBe("HydrationGoalUpdatedUndone");
    expect(undoEvents).toHaveLength(1);
    expect(getSettingsSnapshot().profile.dailyWaterGoal).toBe(original);

    const entry = getHistoryEntry(executed.historyEntryId!);
    expect(entry?.undone).toBe(true);
  });

  it("returns structured failure when undo is unavailable", () => {
    const result = undoExecution({
      historyEntryId: "missing-entry",
      source: "undo",
    });
    expect(result.success).toBe(false);
    expect(result.message).toContain("not found");
    expect(result.events).toHaveLength(0);
  });

  it("returns structured failure when already undone", () => {
    const executed = runExecution(
      createExecutionRequest({
        handlerId: "update-protein-goal",
        category: "nutrition",
        actionType: "nutrition",
        payload: { targetGrams: 140 },
        source: "manual",
      })
    );

    undoExecution({
      historyEntryId: executed.historyEntryId!,
      source: "undo",
    });

    const secondUndo = undoExecution({
      historyEntryId: executed.historyEntryId!,
      source: "undo",
    });

    expect(secondUndo.success).toBe(false);
    expect(secondUndo.message).toContain("already been undone");
  });
});

describe("history serialization", () => {
  it("creates JSON-serializable entries with required fields", () => {
    const result = runExecution(
      createExecutionRequest({
        handlerId: "update-sleep-goal",
        category: "sleep",
        actionType: "sleep",
        payload: { targetHours: 7 },
        source: "conversation-action",
        metadata: {
          conversationId: "conv-99",
          capabilityId: "adjust-routine",
          actionLabel: "Sleep more",
        },
      })
    );

    const exported = exportExecutionHistory();
    const cloned = cloneHistoryEntries(exported);
    const roundTrip = JSON.parse(JSON.stringify(cloned));

    expect(roundTrip).toEqual(cloned);
    expect(cloned[0]).toMatchObject({
      handlerId: "update-sleep-goal",
      category: "sleep",
      source: "conversation-action",
      undoAvailable: true,
      undone: false,
      metadata: {
        conversationId: "conv-99",
        capabilityId: "adjust-routine",
      },
    });
    expect(cloned[0]?.timestamp).toBeTruthy();
    expect(cloned[0]?.previousValues).toBeDefined();
    expect(cloned[0]?.newValues).toBeDefined();
    expect(result.historyEntryId).toBe(cloned[0]?.id);
  });

  it("import/export produces identical data", () => {
    runExecution(
      createExecutionRequest({
        handlerId: "update-water-goal",
        category: "hydration",
        actionType: "hydration",
        payload: { targetMl: 3600 },
        source: "manual",
      })
    );

    const exported = exportExecutionHistory();
    clearExecutionHistory();
    expect(listExecutionHistory()).toHaveLength(0);

    importExecutionHistory(exported);
    expect(listExecutionHistory()).toEqual(exported);
  });
});

describe("event emission", () => {
  it("dispatches exactly one event per successful execution", () => {
    let count = 0;
    const unsubscribe = subscribeExecutionEvents(() => {
      count += 1;
    });

    runExecution(
      createExecutionRequest({
        handlerId: "open-reflection",
        category: "reflection",
        actionType: "reflection",
        payload: buildDefaultPayload("open-reflection", "Reflect"),
        source: "manual",
      })
    );

    unsubscribe();
    expect(count).toBe(1);
  });

  it("does not duplicate events on dispatch", () => {
    const seen: string[] = [];
    dispatchExecutionEvent({
      type: "TestEvent",
      category: "hydration",
      handlerId: "update-water-goal",
      timestamp: new Date().toISOString(),
      payload: {},
    });

    subscribeExecutionEvents((event) => {
      seen.push(event.type);
    });

    expect(seen).toHaveLength(0);
  });
});

describe("performance benchmarks", () => {
  it("reports average operation times", () => {
    const iterations = 500;
    const context = buildValidationContext();

    const measure = (label: string, fn: () => void) => {
      const start = performance.now();
      for (let i = 0; i < iterations; i += 1) {
        fn();
      }
      const avgMs = (performance.now() - start) / iterations;
      console.log(`[execution-benchmark] ${label}: ${avgMs.toFixed(4)}ms avg`);
      expect(avgMs).toBeLessThan(50);
    };

    measure("registry lookup", () => {
      resolveRegistryEntry({ actionType: "hydration", label: "Drink more water" });
    });

    measure("validation", () => {
      validateExecutionRequest(
        makeRequest({
          handlerId: "update-water-goal",
          category: "hydration",
          actionType: "hydration",
          payload: { targetMl: 3600 },
          source: "manual",
        }),
        context
      );
    });

    measure("execution", () => {
      runExecution(
        createExecutionRequest({
          handlerId: "update-water-goal",
          category: "hydration",
          actionType: "hydration",
          payload: {
            targetMl:
              VALIDATION_RULES.waterGoal.minMl +
              (iterations % 100) +
              3000,
          },
          source: "manual",
        })
      );
    });

    const executed = runExecution(
      createExecutionRequest({
        handlerId: "update-protein-goal",
        category: "nutrition",
        actionType: "nutrition",
        payload: { targetGrams: 135 },
        source: "manual",
      })
    );

    measure("undo", () => {
      if (executed.historyEntryId) {
        undoExecution({ historyEntryId: executed.historyEntryId, source: "undo" });
        runExecution(
          createExecutionRequest({
            handlerId: "update-protein-goal",
            category: "nutrition",
            actionType: "nutrition",
            payload: { targetGrams: 136 },
            source: "manual",
          })
        );
      }
    });

    measure("history recording", () => {
      listExecutionHistory();
    });

    measure("event dispatch", () => {
      dispatchExecutionEvent({
        type: "HydrationGoalUpdated",
        category: "hydration",
        handlerId: "update-water-goal",
        timestamp: new Date().toISOString(),
        payload: { dailyWaterGoal: 3500 },
      });
    });
  });
});
