import {
  createGracefulErrorResponse,
  STRICT_JSON_RETRY_INSTRUCTION,
  validateCoachResponseJson,
} from "@/lib/coach/json-validator";
import {
  ProviderConfigurationError,
  type LLMProviderError,
} from "@/lib/coach/providers/base-provider";
import { createLLMProvider } from "@/lib/coach/providers/provider-factory";
import type {
  CoachGenerationResult,
  CoachResponse,
  ForgeCoachPrompt,
} from "@/lib/coach/coach-types";

export type LLMServiceError = LLMProviderError;

function logDevError(code: string): void {
  if (process.env.NODE_ENV === "development") {
    process.stderr.write(`[forge-coach] ${code}\n`);
  }
}

function mapProviderError(error: unknown): LLMServiceError {
  if (error instanceof ProviderConfigurationError) {
    return { code: error.code, message: error.message };
  }
  if (
    error instanceof Error &&
    "code" in error &&
    (error as { code: string }).code === "configuration"
  ) {
    return { code: "configuration", message: error.message };
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  ) {
    return error as LLMServiceError;
  }
  if (error instanceof Error && error.message.includes("GROQ_API_KEY")) {
    return {
      code: "configuration",
      message: "Groq is not configured. Set GROQ_API_KEY.",
    };
  }
  if (error instanceof Error && error.message.includes("not implemented")) {
    return { code: "unknown_provider", message: error.message };
  }
  return {
    code: "unknown",
    message: "Forge encountered an unexpected error.",
  };
}

async function generateRawText(
  prompt: ForgeCoachPrompt
): Promise<{ rawText: string; model: string }> {
  const provider = createLLMProvider();
  const result = await provider.generate({ prompt });
  return result;
}

async function generateWithValidation(
  prompt: ForgeCoachPrompt
): Promise<CoachResponse> {
  const first = await generateRawText(prompt);
  const firstValidation = validateCoachResponseJson(first.rawText);
  if (firstValidation.valid) {
    return firstValidation.data;
  }

  const strictPrompt: ForgeCoachPrompt = {
    ...prompt,
    strict: true,
    systemInstruction: `${prompt.systemInstruction}\n\n${STRICT_JSON_RETRY_INSTRUCTION}`,
  };

  const retry = await generateRawText(strictPrompt);
  const retryValidation = validateCoachResponseJson(retry.rawText);
  if (retryValidation.valid) {
    return retryValidation.data;
  }

  return createGracefulErrorResponse();
}

export async function executeCoachGeneration(
  prompt: ForgeCoachPrompt
): Promise<
  | { ok: true; result: CoachGenerationResult }
  | { ok: false; error: LLMServiceError; graceful: CoachResponse }
> {
  try {
    const coachResponse = await generateWithValidation(prompt);
    return {
      ok: true,
      result: {
        rawText: JSON.stringify(coachResponse),
        model: prompt.modelConfig.model,
        coachResponse,
        streamed: false,
      },
    };
  } catch (error) {
    const normalized = mapProviderError(error);
    logDevError(normalized.code);
    return {
      ok: false,
      error: normalized,
      graceful: createGracefulErrorResponse(),
    };
  }
}

export async function* streamCoachGeneration(
  prompt: ForgeCoachPrompt
): AsyncGenerator<
  | { type: "partial"; text: string }
  | { type: "complete"; result: CoachGenerationResult }
  | { type: "error"; error: LLMServiceError; graceful: CoachResponse }
> {
  try {
    const provider = createLLMProvider();
    let accumulated = "";

    for await (const event of provider.stream({ prompt })) {
      if (event.type === "partial") {
        accumulated = event.text;
        yield event;
      }
      if (event.type === "error") {
        yield {
          type: "error",
          error: event.error,
          graceful: createGracefulErrorResponse(),
        };
        return;
      }
      if (event.type === "complete") {
        accumulated = event.result.rawText;
      }
    }

    if (!accumulated.trim()) {
      yield {
        type: "error",
        error: {
          code: "empty_response",
          message: "Forge received an empty response.",
        },
        graceful: createGracefulErrorResponse(),
      };
      return;
    }

    const validation = validateCoachResponseJson(accumulated);
    if (validation.valid) {
      yield {
        type: "complete",
        result: {
          rawText: accumulated,
          model: prompt.modelConfig.model,
          coachResponse: validation.data,
          streamed: true,
        },
      };
      return;
    }

    const strictPrompt: ForgeCoachPrompt = {
      ...prompt,
      strict: true,
      systemInstruction: `${prompt.systemInstruction}\n\n${STRICT_JSON_RETRY_INSTRUCTION}`,
    };
    const retryResponse = await generateWithValidation(strictPrompt);

    yield {
      type: "complete",
      result: {
        rawText: JSON.stringify(retryResponse),
        model: prompt.modelConfig.model,
        coachResponse: retryResponse,
        streamed: false,
      },
    };
  } catch (error) {
    const normalized = mapProviderError(error);
    logDevError(normalized.code);
    yield {
      type: "error",
      error: normalized,
      graceful: createGracefulErrorResponse(),
    };
  }
}
