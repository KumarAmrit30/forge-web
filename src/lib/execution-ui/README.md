# Execution UX Layer

Presentation layer between Forge Conversation recommendations and the Execution Engine.

**ExecutionIntent is UI-only. ExecutionRequest is engine-only.**

## Architecture

```
ActionPriority (Conversation)
  ↓
buildExecutionIntent()          ← intent-builder.ts (read-only store snapshots)
  ↓
ExecutionIntent                 ← presentation model
  ↓
ExecutionPreviewCard            ← user reviews
  ↓
ExecutionConfirmationDialog     ← user approves
  ↓
runExecution(intent.executionRequest)   ← engine boundary
  ↓
ExecutionSuccessBanner + Undo
  ↓
buildExecutionAcknowledgement() ← coach/execution-continuation.ts
  ↓
Conversation continues
```

## Module Responsibilities

| Module | Role |
|--------|------|
| `intent-types.ts` | UI-only types — never imported by Execution Engine |
| `intent-builder.ts` | ActionPriority → ExecutionIntent (no mutations, no engine calls) |
| `execution-intent.ts` | Timeline helpers + re-exports |
| `use-execution-flow.ts` | Preview → confirm → execute → undo state machine |
| `index.ts` | Public API |

## UI Components

Located in `src/components/execution/`:

- `ExecutionPreviewCard` — proposed change with Review Change CTA
- `ExecutionConfirmationDialog` — Apply / Cancel with focus trap
- `ExecutionStatus` — applying indicator
- `ExecutionSuccessBanner` — success + undo, auto-dismiss
- `ExecutionTimeline` / `ExecutionTimelineItem` — reflection-oriented history

## Conversation Continuation

Acknowledgement copy lives in `src/lib/coach/execution-continuation.ts` — deterministic, not hardcoded in React components. The Conversation Manager appends assistant messages via `appendAcknowledgement()`.

## Boundary Rules

1. Never pass `ExecutionIntent` to `runExecution()` — use `intent.executionRequest`
2. Never mutate stores outside the Execution Engine
3. Undo always uses `undoExecution()` from `@/lib/execution`
4. UI types (`IntentCategory`, `IntentScreen`) are separate from engine types

## Coach Integration

`ChatWindow` builds intents from `ExperienceActionCard` + `ConversationPlan.prioritizedActions`.
`ForgeScreen` orchestrates `useExecutionFlow` + timeline + dialog + banner.
