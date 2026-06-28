# Forge Personality Layer

The Personality Layer is the **single source of truth** for how Forge communicates. It defines voice, style, conversation modes, guardrails, and response structure — without performing any reasoning or modifying Brain outputs.

## Architecture

```
Conversation Manager
  ↓
Capability Resolver
  ↓
Forge Brain                    ← WHAT Forge knows (reasoning)
  ↓
Personality Layer              ← HOW Forge speaks (communication)
  ↓
Prompt Builder                   ← Assembly only
  ↓
LLM Provider
```

## Responsibilities

| Module | Role |
|--------|------|
| `forge-personality.ts` | Core identity — voice, tone, mission, principles |
| `writing-rules.ts` | Deterministic writing constraints |
| `conversation-modes.ts` | Mode profiles (Daily Review, Planning, etc.) |
| `response-guidelines.ts` | Response section flow per mode |
| `guardrails.ts` | Forbidden and required communication rules |
| `starter-generator.ts` | Which starters to surface and when |
| `style-examples.ts` | Before/after documentation (not runtime) |
| `forge-manifesto.md` | Human-readable identity document |

## Relationship with Brain

The Brain produces structured reasoning: patterns, trends, predictions, recommendations, identity.

The Personality Layer **never reads, modifies, or replaces** Brain outputs. It only provides communication guidance that the Prompt Builder attaches alongside Brain context.

## Relationship with Prompt Builder

Prompt Builder imports from `@/lib/personality` via:

- `buildPersonalityPromptForCapability()` — resolves mode from capability id
- `flattenPersonalitySections()` — optional flat assembly helper

Prompt Builder must **never** embed personality rules inline. All communication rules live in this layer.

## How to Add a Conversation Mode

1. Add the mode id to `ConversationModeId` in `personality-types.ts`
2. Define the mode in `CONVERSATION_MODES` in `conversation-modes.ts`
3. Map relevant `CoachCapabilityId` values to the mode
4. Add mode-specific section notes in `response-guidelines.ts` if needed
5. Prompt Builder picks up the mode automatically via capability routing

## How to Change Forge's Personality

1. Edit `FORGE_PERSONALITY` in `forge-personality.ts`
2. Update `forge-manifesto.md` to reflect the change
3. Add style examples in `style-examples.ts` if the change affects phrasing
4. Do not edit Prompt Builder or Brain

## How to Update Writing Rules

1. Add or modify entries in `WRITING_RULES` in `writing-rules.ts`
2. Each rule must include `id`, `category`, `rule`, and `rationale`
3. Add corresponding style examples for non-obvious rules

## How to Add Guardrails

1. Add entries to `GUARDRAILS` in `guardrails.ts`
2. Set `category` to `"forbidden"` or `"required"`
3. Include a clear `rationale`

## Starter Generation

Brain determines which starters are *possible* (via patterns, trends, signals).

`starter-generator.ts` determines which starters are *surfaced* using:

- Brain signal scoring (declining trends, pattern matches)
- Typed context boosts (day-of-week + time-of-day configuration)

No hardcoded weekday logic — all temporal boosts use `StarterContextBoost` configuration.

## Rules

- Strict TypeScript. No `any`.
- Pure configuration. No reasoning logic.
- No circular dependencies.
- No prompt text duplication outside format helpers.
- Style examples are documentation only — never imported at runtime by Prompt Builder.
