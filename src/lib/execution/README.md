# Forge Execution Engine

The Execution Engine transforms Forge Brain recommendations into validated, reversible application actions.

**The LLM may recommend. Only the Execution Engine may execute.**

## Execution Lifecycle

```
Recommendation / ActionPriority
  ↓
buildExecutionRequestFrom*()     ← conversation adapters (index.ts)
  ↓
runExecution(request)
  ├─ Registry lookup
  ├─ validateExecutionRequest()    ← structured errors, never throws
  ├─ isHandlerSupported()          ← rejects placeholders
  ├─ executeHandler()              ← Zustand mutations only
  ├─ recordExecutionHistory()      ← one entry per success
  ├─ createExecutionEvent()        ← one event per success
  └─ buildSuccessResult()          ← one result object
```

Failed executions return early — no store mutation, no history, no events.

## Validation Pipeline

Validation runs in fixed order:

1. **Client** — browser environment required (`client_unavailable`)
2. **Registry** — handler exists, category matches (`unknown_handler`, `category_mismatch`)
3. **Permissions** — allowed `source` values (`permission_denied`)
4. **Handler payload** — per-handler rules (skipped when `source === "undo"`)
5. **Placeholders** — `schedule-notification`, `queue-sync` rejected (`not_implemented`)

All bounds live in `execution-validation-rules.ts` (`VALIDATION_RULES`, `VALIDATION_RULE_DOCS`).

| Handler | Rules |
|---------|-------|
| `update-water-goal` | `targetMl` or `deltaMl`; resolved goal 500–10,000 ml; finite numbers |
| `move-workout-schedule` | `shiftDays` optional; if present, ±7 and finite |
| `update-sleep-goal` | `targetHours` required; 4–12 hours |
| `update-protein-goal` | `targetGrams` required; 50–400 g |
| `open-reflection` | `mode` optional; `guided` or `freeform` |
| `update-routine` | `morning`/`night` optional; string arrays when present |
| `update-settings-profile` | `profile` object required |
| `mark-calendar-day` | `date` optional; YYYY-MM-DD when present |
| Undo requests | Payload rules skipped — snapshots trusted from history |

## Undo Lifecycle

```
undoExecution({ historyEntryId })
  ├─ getHistoryEntry()             ← fail if missing / undone / not undoable
  ├─ validateExecutionRequest()    ← client + registry + permissions only
  ├─ undoHandler()                 ← restore previousValues
  ├─ markHistoryUndone()
  ├─ recordExecutionHistory()      ← undo audit entry (undoAvailable: false)
  ├─ createUndoEvent()             ← one *Undone event
  └─ buildSuccessResult()
```

## History Lifecycle

Every successful execution creates one `ExecutionHistoryEntry`:

- `timestamp`, `handlerId`, `category`, `source`
- `previousValues`, `newValues` (JSON-serializable snapshots)
- `metadata` — `conversationId`, `capabilityId`, `recommendationId`, `actionLabel`
- `undoAvailable`, `undone`

`exportExecutionHistory()` deep-clones via JSON. `importExecutionHistory()` round-trips identically.

## Event Lifecycle

One event per successful execution or undo:

| Handler | Event | Undo Event |
|---------|-------|------------|
| `update-water-goal` | `HydrationGoalUpdated` | `HydrationGoalUpdatedUndone` |
| `move-workout-schedule` | `WorkoutMoved` | `WorkoutMovedUndone` |
| `update-sleep-goal` | `SleepGoalChanged` | `SleepGoalChangedUndone` |
| `update-protein-goal` | `NutritionGoalChanged` | `NutritionGoalChangedUndone` |
| `open-reflection` | `ReflectionStarted` | `ReflectionStartedUndone` |
| `update-routine` | `RoutineUpdated` | `RoutineUpdatedUndone` |
| `update-settings-profile` | `SettingsProfileUpdated` | `SettingsProfileUpdatedUndone` |
| `mark-calendar-day` | `CalendarDayMarked` | `CalendarDayMarkedUndone` |

Subscribe via `subscribeExecutionEvents()` for future notifications.

## Module Responsibilities

| Module | Role |
|--------|------|
| `execution-types.ts` | Strict interfaces |
| `execution-validation-rules.ts` | Bounds + rule documentation |
| `execution-payloads.ts` | Default payloads for conversation adapters |
| `execution-registry.ts` | Label/actionType → handler routing |
| `execution-validator.ts` | Pre-flight validation |
| `execution-executor.ts` | Store mutations only |
| `execution-engine.ts` | Public orchestration API |
| `execution-history.ts` | Audit log with export/import |
| `undo-manager.ts` | Reversible execution |
| `execution-events.ts` | Internal event bus |
| `execution-result.ts` | Standard result shape |
| `index.ts` | Public exports + conversation adapters |

## Testing Strategy

Pure execution tests in `execution.test.ts` (Vitest + jsdom):

- Registry resolution
- Validation success and failure paths
- Execution pipeline (one result, one history entry, one event)
- Undo success and failure paths
- History JSON serialization and import/export parity
- Event emission counts
- Performance benchmarks (logged, not optimized)

Run: `npm run test`

## Client-Only Execution

Handlers mutate Zustand stores. Server-side calls return `client_unavailable`.

## Future Extension Points

### Firebase / Cloud Sync

Replace in-memory history with `exportExecutionHistory()` / `importExecutionHistory()` Firestore adapter.

### Notification Scheduler

Subscribe to `subscribeExecutionEvents()` — placeholder `schedule-notification` handler reserved.

### Action Analytics

`listExecutionHistory()` provides before/after snapshots per action.

### Multi-Device Sync

Undo replays `previousValues` through handler undo paths — portable JSON snapshots.

## Usage

```typescript
import {
  buildExecutionRequestFromPrioritizedAction,
  runExecution,
  undoExecution,
} from "@/lib/execution";

const request = buildExecutionRequestFromPrioritizedAction(action, {
  conversationId: "conv-123",
});
if (request) {
  const result = runExecution(request);
  if (result.success && result.undoAvailable && result.historyEntryId) {
    undoExecution({ historyEntryId: result.historyEntryId, source: "undo" });
  }
}
```

## Out of Scope

- UI wiring (Sprint 8 Phase 2)
- Firebase, cloud sync, notifications, analytics implementations
- Modifications to Brain, Personality, Conversation, or existing screens
