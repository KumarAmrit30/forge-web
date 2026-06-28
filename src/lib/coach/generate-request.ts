import { buildCoachPromptFromMessage } from "@/lib/coach/coach-pipeline";
import { buildDefaultServerForgeContext } from "@/lib/coach/server-context";
import type { CoachCapabilityId } from "@/lib/brain";
import type {
  CoachConversationTurn,
  ForgeCoachPrompt,
} from "@/lib/coach/coach-types";

export type CoachGenerateRequestErrorCode =
  | "invalid_prompt"
  | "invalid_message";

export type ResolveCoachGenerateRequestResult =
  | { ok: true; prompt: ForgeCoachPrompt; stream: boolean }
  | {
      ok: false;
      code: CoachGenerateRequestErrorCode;
      message: string;
    };

export function isForgeCoachPrompt(value: unknown): value is ForgeCoachPrompt {
  if (typeof value !== "object" || value === null) return false;
  const prompt = value as ForgeCoachPrompt;
  return (
    typeof prompt.systemInstruction === "string" &&
    prompt.systemInstruction.length > 0 &&
    typeof prompt.userContent === "string" &&
    typeof prompt.responseJsonSchema === "object" &&
    prompt.responseJsonSchema !== null &&
    typeof prompt.modelConfig === "object" &&
    prompt.modelConfig !== null &&
    typeof prompt.modelConfig.model === "string" &&
    typeof prompt.strict === "boolean"
  );
}

function isCoachConversationTurn(value: unknown): value is CoachConversationTurn {
  if (typeof value !== "object" || value === null) return false;
  const turn = value as CoachConversationTurn;
  return (
    (turn.role === "user" || turn.role === "assistant") &&
    typeof turn.content === "string"
  );
}

function parseConversationHistory(value: unknown): CoachConversationTurn[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isCoachConversationTurn);
}

/**
 * Accept either a pre-built ForgeCoachPrompt (browser client path) or a
 * user message that runs the upstream coach pipeline on the server.
 */
export function resolveCoachGenerateRequest(
  body: unknown
): ResolveCoachGenerateRequestResult {
  if (typeof body !== "object" || body === null) {
    return {
      ok: false,
      code: "invalid_prompt",
      message: "Request body must be a JSON object.",
    };
  }

  const record = body as Record<string, unknown>;
  const stream = record.stream === true;

  if (isForgeCoachPrompt(record.prompt)) {
    return { ok: true, prompt: record.prompt, stream };
  }

  if (typeof record.message === "string") {
    const trimmed = record.message.trim();
    if (!trimmed) {
      return {
        ok: false,
        code: "invalid_message",
        message: "Message cannot be empty.",
      };
    }

    const capabilityId =
      typeof record.capabilityId === "string"
        ? (record.capabilityId as CoachCapabilityId)
        : undefined;

    const pipeline = buildCoachPromptFromMessage({
      message: trimmed,
      capabilityId,
      conversationHistory: parseConversationHistory(
        record.conversationHistory
      ),
      context: buildDefaultServerForgeContext(),
    });

    return { ok: true, prompt: pipeline.prompt, stream };
  }

  if (record.prompt !== undefined) {
    return {
      ok: false,
      code: "invalid_prompt",
      message: "Invalid coach prompt.",
    };
  }

  return {
    ok: false,
    code: "invalid_prompt",
    message:
      "Request must include either a valid `prompt` or a non-empty `message`.",
  };
}
