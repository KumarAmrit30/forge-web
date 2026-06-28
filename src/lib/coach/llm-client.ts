import type {
  CoachGenerationResult,
  CoachResponse,
  LLMClient,
  LLMClientRequest,
  LLMClientResponse,
  LLMStreamHandlers,
} from "@/lib/coach/coach-types";

type StreamEvent =
  | { type: "partial"; text: string }
  | { type: "complete"; result: CoachGenerationResult }
  | {
      type: "error";
      error: { code: string; message: string };
      graceful: CoachResponse;
    };

function normalizeErrorCode(code: string): LLMClientResponse["error"] extends infer E
  ? E extends { code: infer C }
    ? C
    : never
  : never {
  const allowed = new Set([
    "configuration",
    "authentication",
    "network",
    "rate_limit",
    "timeout",
    "empty_response",
    "invalid_json",
    "unknown_provider",
    "streaming_interrupted",
    "unknown",
  ]);
  if (allowed.has(code)) {
    return code as LLMClientResponse["error"] extends { code: infer C }
      ? C
      : never;
  }
  return "unknown";
}

async function readStreamResponse(
  response: Response,
  handlers?: LLMStreamHandlers
): Promise<LLMClientResponse> {
  const reader = response.body?.getReader();
  if (!reader) {
    return {
      rawText: "",
      model: "unknown",
      streamed: true,
      error: {
        code: "streaming_interrupted",
        message: "Forge received an empty streaming response.",
      },
    };
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let finalResult: CoachGenerationResult | null = null;
  let streamError: LLMClientResponse["error"] | undefined;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) continue;
      const event = JSON.parse(line) as StreamEvent;
      if (event.type === "partial") {
        handlers?.onPartial?.(event.text);
      }
      if (event.type === "complete") {
        finalResult = event.result;
      }
      if (event.type === "error") {
        streamError = {
          code: normalizeErrorCode(event.error.code),
          message: event.error.message,
        };
        finalResult = {
          rawText: JSON.stringify(event.graceful),
          model: "unknown",
          coachResponse: event.graceful,
          streamed: false,
        };
      }
    }
  }

  if (finalResult) {
    return {
      rawText: finalResult.rawText,
      model: finalResult.model,
      streamed: finalResult.streamed,
      error: streamError,
    };
  }

  return {
    rawText: "",
    model: "unknown",
    streamed: true,
    error: streamError ?? {
      code: "streaming_interrupted",
      message: "Forge did not receive a complete response.",
    },
  };
}

function mapFetchError(error: unknown): LLMClientResponse["error"] {
  if (error instanceof Error && error.name === "AbortError") {
    return {
      code: "timeout",
      message: "Forge timed out while waiting for a response.",
    };
  }
  return { code: "network", message: "Forge could not reach the coach service." };
}

/** Browser-side LLM client façade — calls the server API route only. */
export function createLLMClient(): LLMClient {
  return {
    async complete(
      request: LLMClientRequest,
      handlers?: LLMStreamHandlers
    ): Promise<LLMClientResponse> {
      try {
        const response = await fetch("/api/coach/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: request.prompt,
            stream: request.stream ?? true,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json()) as {
            error?: { code?: string; message?: string };
          };
          return {
            rawText: "",
            model: request.prompt.modelConfig.model,
            streamed: false,
            error: {
              code: normalizeErrorCode(payload.error?.code ?? "unknown"),
              message:
                payload.error?.message ??
                "Forge could not complete the request.",
            },
          };
        }

        const contentType = response.headers.get("Content-Type") ?? "";
        if (contentType.includes("application/x-ndjson")) {
          return readStreamResponse(response, handlers);
        }

        const result = (await response.json()) as CoachGenerationResult & {
          error?: { code: string; message: string };
        };

        return {
          rawText: result.rawText,
          model: result.model,
          streamed: result.streamed,
          error: result.error
            ? {
                code: normalizeErrorCode(result.error.code),
                message: result.error.message,
              }
            : undefined,
        };
      } catch (error) {
        return {
          rawText: "",
          model: request.prompt.modelConfig.model,
          streamed: false,
          error: mapFetchError(error),
        };
      }
    },
  };
}

export const llmClient: LLMClient = createLLMClient();
