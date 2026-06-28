# Forge Coach — LLM Provider Pipeline

The Forge Coach converts Forge Brain reasoning into natural language through a **provider-agnostic** AI pipeline. Gemini, Groq, and future models are interchangeable — the Brain and Conversation Manager never depend on a specific vendor.

## Architecture

```
User Message
  ↓
Capability Resolver (deterministic)
  ↓
runForgeBrain()
  ↓
Context Optimizer
  ↓
Prompt Builder (provider-independent)
  ↓
LLM Client (browser façade)
  ↓
POST /api/coach/generate
  ↓
LLM Service
  ↓
Provider Factory → LLM_PROVIDER
  ↓
Groq Provider (MVP) | Vertex Provider (placeholder)
  ↓
JSON Validator (+ single retry)
  ↓
Response Parser
  ↓
Conversation Manager → UI
```

## Separation of responsibilities

| Layer | Responsibility |
|-------|----------------|
| **Forge Brain** | Reasoning, patterns, trends, recommendations |
| **Prompt Builder** | Fixed-order prompt assembly — no provider knowledge |
| **LLM Provider** | API communication only — no validation, no Brain logic |
| **JSON Validator** | Schema validation + graceful fallback |
| **Response Parser** | Validated JSON → UI model |
| **LLM Client** | Browser façade — forwards to API route |

## Provider abstraction

All providers implement `LLMProvider`:

```typescript
interface LLMProvider {
  providerName: "groq" | "vertex";
  generate(request): Promise<{ rawText, model }>;
  stream(request): AsyncGenerator<StreamEvent>;
  healthCheck(): Promise<HealthResult>;
}
```

### Provider Factory

Reads `LLM_PROVIDER` and instantiates the correct implementation.

| Value | Status |
|-------|--------|
| `groq` | **Active MVP** |
| `vertex` | Placeholder — throws "Vertex provider not implemented." |

Unsupported values throw a descriptive configuration error. **Never silently falls back.**

### Adding a new provider

1. Create `src/lib/coach/providers/<name>-provider.ts` implementing `LLMProvider`
2. Register in `provider-factory.ts`
3. Add env vars to `.env.example`
4. No changes to Brain, Prompt Builder, JSON Validator, or UI

## Current provider: Groq

```bash
LLM_PROVIDER=groq
GROQ_API_KEY=your_key
LLM_MODEL=llama-3.3-70b-versatile
```

Model parameters come from `model-config.ts` (`LLM_MODEL_CONFIG`) — never hardcoded inside providers.

## Future provider: Vertex AI

Vertex variables are retained for future re-integration:

```bash
LLM_PROVIDER=vertex
GOOGLE_CLOUD_PROJECT=
GOOGLE_CLOUD_LOCATION=
VERTEX_MODEL=
GOOGLE_APPLICATION_CREDENTIALS=
```

Implement `VertexProvider` using the same `LLMProvider` interface — no architectural changes required.

## Modules

| Module | Role |
|--------|------|
| `providers/base-provider.ts` | `LLMProvider` interface |
| `providers/groq-provider.ts` | Groq SDK communication |
| `providers/vertex-provider.ts` | Future Vertex placeholder |
| `providers/provider-factory.ts` | Provider instantiation |
| `llm-client.ts` | Browser façade → API route |
| `llm-service.ts` | Server orchestration + validation retry |
| `model-config.ts` | Provider-independent generation config |
| `capability-resolver.ts` | Deterministic capability routing |
| `context-optimizer.ts` | Capability-scoped brain slices |
| `prompt-builder.ts` | Fixed-order prompt assembly |
| `json-validator.ts` | CoachResponse validation |
| `response-parser.ts` | Validated JSON → UI model |
| `conversation-manager.ts` | Full client-side orchestration |

## Response contract

Providers return **raw JSON text only**. Validation and parsing happen upstream:

- `summary`, `insights[]`, `recommendations[]`, `actions[]`, `followUpQuestions[]`, `confidence`

## Streaming

The LLM client requests streaming by default. The API route emits NDJSON:

- `{ type: "partial", text }` — accumulated JSON
- `{ type: "complete", result }` — validated response
- `{ type: "error", error, graceful }` — normalized failure

Conversation Manager exposes `isStreaming` and `partialResponse`.

## Security

- API keys and SDK usage are **server-only**
- No prompt or response logging in production
- Development logs error codes only
- Client never receives SDK stack traces

## API

`POST /api/coach/generate`

```json
{
  "prompt": { "...": "ForgeCoachPrompt" },
  "stream": true
}
```

Returns NDJSON stream or JSON `CoachGenerationResult`.
