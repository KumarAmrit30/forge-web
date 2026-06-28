import type {
  LLMGenerateRequest,
  LLMGenerateResult,
  LLMHealthCheckResult,
  LLMProvider,
  LLMStreamEvent,
} from "@/lib/coach/providers/base-provider";

const NOT_IMPLEMENTED = "Vertex provider not implemented.";

/**
 * Vertex AI provider placeholder.
 * Re-implement using the LLMProvider interface when Vertex support returns.
 */
export class VertexProvider implements LLMProvider {
  readonly providerName = "vertex" as const;

  async generate(_request: LLMGenerateRequest): Promise<LLMGenerateResult> {
    void _request;
    throw new Error(NOT_IMPLEMENTED);
  }

  async *stream(_request: LLMGenerateRequest): AsyncGenerator<LLMStreamEvent> {
    void _request;
    throw new Error(NOT_IMPLEMENTED);
  }

  async healthCheck(): Promise<LLMHealthCheckResult> {
    return {
      ok: false,
      error: {
        code: "unknown_provider",
        message: NOT_IMPLEMENTED,
      },
    };
  }
}
