import type { ForgeCoachPrompt } from "@/lib/coach/coach-types";

/** Supported LLM provider identifiers. */
export type LLMProviderName = "groq" | "vertex";

/** Normalized LLM error codes exposed to the coach pipeline. */
export type LLMProviderErrorCode =
  | "configuration"
  | "authentication"
  | "network"
  | "rate_limit"
  | "timeout"
  | "empty_response"
  | "invalid_json"
  | "unknown_provider"
  | "streaming_interrupted"
  | "unknown";

/** Normalized provider error — never contains SDK stack traces. */
export type LLMProviderError = {
  code: LLMProviderErrorCode;
  message: string;
};

/** Request forwarded to an LLM provider implementation. */
export type LLMGenerateRequest = {
  prompt: ForgeCoachPrompt;
};

/** Raw text result from a provider — no parsing or validation. */
export type LLMGenerateResult = {
  rawText: string;
  model: string;
};

/** Streaming events emitted by provider implementations. */
export type LLMStreamEvent =
  | { type: "partial"; text: string }
  | { type: "complete"; result: LLMGenerateResult }
  | { type: "error"; error: LLMProviderError };

/** Health check result for a provider instance. */
export type LLMHealthCheckResult =
  | { ok: true }
  | { ok: false; error: LLMProviderError };

/**
 * Provider-agnostic LLM communication contract.
 * Implementations handle SDK details only — no Brain, prompt, or validation logic.
 */
export type LLMProvider = {
  readonly providerName: LLMProviderName;
  generate: (request: LLMGenerateRequest) => Promise<LLMGenerateResult>;
  stream: (request: LLMGenerateRequest) => AsyncGenerator<LLMStreamEvent>;
  healthCheck: () => Promise<LLMHealthCheckResult>;
};

/** Thrown when LLM_PROVIDER is missing or unsupported. */
export class ProviderConfigurationError extends Error {
  readonly code: LLMProviderErrorCode = "unknown_provider";

  constructor(message: string) {
    super(message);
    this.name = "ProviderConfigurationError";
  }
}
