# Forge Conversation Orchestration Layer

The Conversation Orchestration layer decides **what deserves attention** before content reaches the LLM, and **how the conversation flows** after the LLM responds.

## Separation of responsibilities

| Layer | Decides |
|-------|---------|
| **Forge Brain** | What Forge knows — patterns, trends, recommendations |
| **Personality Layer** | How Forge speaks — voice, guardrails, modes |
| **Conversation Orchestrator** | What to surface — ranking, depth, limits, follow-ups |
| **LLM Provider** | Natural language communication only |

## Architecture

```
Conversation Manager
  ↓
Conversation Memory (session-only)
  ↓
Capability Resolver
  ↓
Forge Brain
  ↓
Context Optimizer
  ↓
Response Composer        → ConversationContext
  ↓
Prompt Builder           → consumes ConversationContext + Personality
  ↓
Groq
  ↓
Response Parser
  ↓
Conversation Planner     → ConversationPlan
  ↓
Conversation State
```

## Modules

| Module | Role |
|--------|------|
| `conversation-types.ts` | Strict TypeScript interfaces |
| `conversation-ranking.ts` | Deterministic scoring for all Brain outputs |
| `response-composer.ts` | Ranks, deduplicates, sets depth/limits → `ConversationContext` |
| `conversation-memory.ts` | Session-only memory (no persistence) |
| `conversation-planner.ts` | Post-LLM follow-up, actions, continuation |
| `action-prioritizer.ts` | Maps recommendations → prioritized actions |
| `index.ts` | Public API + `orchestrateConversation()` pipeline helper |

## Ranking heuristics

All scoring is documented in `conversation-ranking.ts`:

- **Recommendations:** `confidence × 10 + priority weight + category match + evidence count`
- **Patterns:** `confidence × 10 + evidence count (capped)`
- **Behaviors:** `confidence × 10 + related pattern count + evidence count`
- **Predictions:** `confidence × 10 + likelihood × 5`
- **Trends:** `confidence × 10 + direction weight + delta magnitude + window size`

## Session memory

Memory tracks: current topic, last recommendation, last follow-up, referenced habit, previous capability, message count.

Memory survives messages within a session. It does not persist across sessions, use a database, or use local storage.

## Rules

- Strict TypeScript. No `any`.
- Pure deterministic logic. No AI in orchestration.
- Never modify Brain engines or Personality Layer.
- Never write English prose in the composer — only structured data.
- Prompt Builder consumes `ConversationContext`, not raw Brain slices.

## Adding orchestration behavior

1. Add scoring heuristics to `conversation-ranking.ts`
2. Adjust limits in `response-composer.ts` via conversation mode from Personality Layer
3. Add follow-up candidates in `response-composer.ts` or planner logic in `conversation-planner.ts`
4. Do not embed orchestration rules in Prompt Builder
