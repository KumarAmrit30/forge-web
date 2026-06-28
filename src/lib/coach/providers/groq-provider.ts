import Groq from "groq-sdk";
import type {
  LLMGenerateRequest,
  LLMGenerateResult,
  LLMHealthCheckResult,
  LLMProvider,
  LLMProviderError,
  LLMStreamEvent,
} from "@/lib/coach/providers/base-provider";

function normalizeGroqError(error: unknown): LLMProviderError {
  const message =
    error instanceof Error ? error.message : "Groq request failed.";
  const lower = message.toLowerCase();

  if (lower.includes("401") || lower.includes("invalid api key")) {
    return {
      code: "authentication",
      message: "Forge could not authenticate with Groq.",
    };
  }
  if (lower.includes("429") || lower.includes("rate limit")) {
    return {
      code: "rate_limit",
      message: "Forge is temporarily rate limited. Try again shortly.",
    };
  }
  if (lower.includes("timeout") || lower.includes("timed out")) {
    return {
      code: "timeout",
      message: "Forge timed out while waiting for a response.",
    };
  }
  if (lower.includes("fetch failed") || lower.includes("network")) {
    return {
      code: "network",
      message: "Forge could not reach Groq.",
    };
  }

  return { code: "unknown", message: "Forge encountered an unexpected error." };
}

function resolveApiKey(): string {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw Object.assign(new Error("GROQ_API_KEY is not configured."), {
      code: "configuration",
    });
  }
  return apiKey;
}

function buildMessages(prompt: LLMGenerateRequest["prompt"]) {
  return [
    { role: "system" as const, content: prompt.systemInstruction },
    { role: "user" as const, content: prompt.userContent },
  ];
}

function buildCompletionParams(prompt: LLMGenerateRequest["prompt"]) {
  const { modelConfig } = prompt;
  return {
    model: modelConfig.model,
    temperature: modelConfig.temperature,
    max_tokens: modelConfig.maxOutputTokens,
    top_p: modelConfig.topP,
    response_format: modelConfig.jsonMode
      ? ({ type: "json_object" } as const)
      : undefined,
  };
}

/** Groq LLM provider — communication only, no validation or Brain logic. */
export class GroqProvider implements LLMProvider {
  readonly providerName = "groq" as const;
  private readonly client: Groq;

  constructor(apiKey?: string) {
    this.client = new Groq({ apiKey: apiKey ?? resolveApiKey() });
  }

  async generate(request: LLMGenerateRequest): Promise<LLMGenerateResult> {
    try {
      const completion = await this.client.chat.completions.create({
        ...buildCompletionParams(request.prompt),
        messages: buildMessages(request.prompt),
        stream: false,
      });

      const rawText = completion.choices[0]?.message?.content?.trim() ?? "";
      if (!rawText) {
        throw new Error("empty_response");
      }

      return {
        rawText,
        model: request.prompt.modelConfig.model,
      };
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "configuration"
      ) {
        throw error;
      }
      throw normalizeGroqError(error);
    }
  }

  async *stream(request: LLMGenerateRequest): AsyncGenerator<LLMStreamEvent> {
    try {
      const stream = await this.client.chat.completions.create({
        ...buildCompletionParams(request.prompt),
        messages: buildMessages(request.prompt),
        stream: true,
      });

      let accumulated = "";
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? "";
        if (!delta) continue;
        accumulated += delta;
        yield { type: "partial", text: accumulated };
      }

      if (!accumulated.trim()) {
        yield {
          type: "error",
          error: {
            code: "empty_response",
            message: "Forge received an empty response.",
          },
        };
        return;
      }

      yield {
        type: "complete",
        result: {
          rawText: accumulated,
          model: request.prompt.modelConfig.model,
        },
      };
    } catch (error) {
      yield {
        type: "error",
        error: normalizeGroqError(error),
      };
    }
  }

  async healthCheck(): Promise<LLMHealthCheckResult> {
    try {
      resolveApiKey();
      return { ok: true };
    } catch {
      return {
        ok: false,
        error: {
          code: "configuration",
          message: "Groq is not configured. Set GROQ_API_KEY.",
        },
      };
    }
  }
}
