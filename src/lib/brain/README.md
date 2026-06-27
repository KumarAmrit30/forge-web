# The Forge Brain

The Forge Brain is Forge's deterministic reasoning layer. It decides what information exists, what matters, what relationships exist, and what structured recommendations should be made **before** any language model is involved.

Gemini is not the brain. Vertex AI is not the brain. Gemini receives a finished `PromptPayload` from the Prompt Builder only after the Brain has finished thinking.

## Architecture

```
User
  ↓
Coach UI (Sprint 6)
  ↓
Prompt Builder
  ↓
Forge Brain
  ↓
Zustand Stores
  ↓
Firebase / Firestore
```

## Reasoning pipeline (Phase 2)

```
Context Engine
  ↓
Identity Engine
  ↓
Pattern Engine
  ↓
Trend Engine
  ↓
Behavior Engine
  ↓
Prediction Engine
  ↓
Recommendation Engine
  ↓
Prompt Builder
```

Each stage produces structured data with confidence scores and traceable evidence. No module bypasses the pipeline.

## Modules

| Module | Question it answers | Output |
|--------|---------------------|--------|
| **Context Engine** | What is happening right now? | `ForgeContext` |
| **Identity Engine** | Who is the user becoming? | `IdentityProfile` |
| **Pattern Engine** | What repeats? | `Pattern[]` |
| **Trend Engine** | What is moving long-term? | `Trend[]` |
| **Behavior Engine** | Why do patterns occur? | `BehaviorInsight[]` |
| **Prediction Engine** | What is likely next? | `Prediction[]` |
| **Recommendation Engine** | What should Forge recommend? | `Recommendation[]` |
| **Memory Engine** | What life context applies? | `MemoryEntry[]` |
| **Prompt Builder** | What should Gemini receive? | `PromptPayload` |
| **Capability Registry** | What actions can the Coach take? | `CoachCapability[]` |

## Evidence system

Every conclusion includes `Evidence[]` traceable to store data:

```typescript
{
  id: string;
  source: string;      // e.g. "calendar", "water", "workout"
  timestamp: string; // date key from store
  metric: string;
  value: string | number;
  description: string; // structured token, not coaching copy
}
```

Evidence is never fabricated. If insufficient data exists, engines return empty arrays or skip individual conclusions.

## Confidence heuristic

Numeric confidence ranges from `0.0` to `1.0`, mapped to `ConfidenceLevel`:

| Level | Range |
|-------|-------|
| `low` | < 0.35 |
| `moderate` | 0.35 – 0.54 |
| `high` | 0.55 – 0.74 |
| `very_high` | ≥ 0.75 |

**Observation-based confidence** (`confidenceFromObservations`):

- 1 observation → capped at 0.25
- 2 observations → capped at 0.40
- 3–4 observations → capped at 0.55
- 5+ observations → 0.45 + rate×0.35 + volume bonus
- 10+ observations over 14+ days at ≥60% rate → up to 0.95

**Trend confidence** (`confidenceFromTrendWindow`):

- Requires ≥3 days in each 14-day window
- Scales with sample size and delta magnitude

## Behavior Engine

Explains observed relationships as chains — never claims causation:

```
trigger → action → outcome
```

Example: `sleep_below_goal → morning_routine_incomplete → workout_not_completed`

Behavior insights link back to supporting patterns via `relatedPatternIds`.

## Prediction Engine

Deterministic near-future estimates (not ML):

| Type | Signal |
|------|--------|
| `workout_likelihood` | Recent workout rate, weekday pattern, morning state |
| `hydration_risk` | Goal miss rate, trend direction, weekday dip |
| `streak_maintenance` | Current streak, today progress, consistency trend |
| `momentum` | Good-day rate delta across rolling windows |

Each prediction references supporting patterns, behaviors, and trends.

## Recommendation pipeline

Recommendations consume all upstream signals and require evidence:

1. Declining/plateau trends → domain-specific actions
2. High-confidence patterns → routine adjustments
3. Elevated prediction risk → proactive actions
4. Early identity stage + consistency signal → logging focus

Recommendations without evidence are discarded.

## Dependency rules

- Identity Engine **cannot** import Prompt Builder
- Pattern / Trend / Behavior / Prediction / Recommendation engines **cannot** import Gemini or Vertex AI
- Context Engine **cannot** import UI components
- Prompt Builder **cannot** read Zustand stores directly
- Gemini knowledge is isolated to Prompt Builder
- No circular dependencies

Import from `@/lib/brain` rather than individual engines when possible.

## Public entry point

```typescript
import { runForgeBrain } from "@/lib/brain";

const result = runForgeBrain();
// result.patterns, result.trends, result.behaviors,
// result.predictions, result.recommendations

const withQuestion = runForgeBrain({ question: "How was my week?" });
// withQuestion.promptPayload — structured, not yet sent to Gemini
```

## Sprint 6 — Vertex AI integration

Sprint 6 will add Coach UI and an API route that:

1. Calls `runForgeBrain({ question, capabilityId })`
2. Passes `result.promptPayload` to Vertex AI / Gemini
3. Uses `listCapabilities()` and `requiredPatterns` / `requiredBehaviors` / `requiredPredictions` for routing
4. Never bypasses the Brain to read stores or invent context

The Brain remains deterministic and testable without network calls.
