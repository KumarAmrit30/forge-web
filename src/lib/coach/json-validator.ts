import type { CoachResponse } from "@/lib/coach/coach-types";

export const COACH_RESPONSE_JSON_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    insights: { type: "array", items: { type: "string" } },
    recommendations: { type: "array", items: { type: "string" } },
    actions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          label: { type: "string" },
          actionType: { type: "string" },
        },
        required: ["id", "label", "actionType"],
      },
    },
    followUpQuestions: { type: "array", items: { type: "string" } },
    confidence: { type: "number" },
  },
  required: [
    "summary",
    "insights",
    "recommendations",
    "actions",
    "followUpQuestions",
    "confidence",
  ],
} as const;

export type CoachResponseValidationResult =
  | { valid: true; data: CoachResponse }
  | { valid: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function parseActions(value: unknown): CoachResponse["actions"] | null {
  if (!Array.isArray(value)) return null;
  const actions: CoachResponse["actions"] = [];
  for (const item of value) {
    if (!isRecord(item)) return null;
    if (
      typeof item.id !== "string" ||
      typeof item.label !== "string" ||
      typeof item.actionType !== "string"
    ) {
      return null;
    }
    actions.push({
      id: item.id,
      label: item.label,
      actionType: item.actionType,
    });
  }
  return actions;
}

function extractJsonCandidate(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{")) return trimmed;

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch?.[1]) return fenceMatch[1].trim();

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }
  return trimmed;
}

/** Validate model JSON output against the CoachResponse contract. */
export function validateCoachResponseJson(
  raw: string
): CoachResponseValidationResult {
  if (!raw.trim()) {
    return { valid: false, error: "empty_response" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJsonCandidate(raw));
  } catch {
    return { valid: false, error: "invalid_json" };
  }

  if (!isRecord(parsed)) {
    return { valid: false, error: "invalid_root_type" };
  }

  if (typeof parsed.summary !== "string" || !parsed.summary.trim()) {
    return { valid: false, error: "missing_summary" };
  }

  if (!isStringArray(parsed.insights)) {
    return { valid: false, error: "invalid_insights" };
  }

  if (!isStringArray(parsed.recommendations)) {
    return { valid: false, error: "invalid_recommendations" };
  }

  const actions = parseActions(parsed.actions);
  if (!actions) {
    return { valid: false, error: "invalid_actions" };
  }

  if (!isStringArray(parsed.followUpQuestions)) {
    return { valid: false, error: "invalid_follow_up_questions" };
  }

  if (
    typeof parsed.confidence !== "number" ||
    parsed.confidence < 0 ||
    parsed.confidence > 1
  ) {
    return { valid: false, error: "invalid_confidence" };
  }

  return {
    valid: true,
    data: {
      summary: parsed.summary.trim(),
      insights: parsed.insights,
      recommendations: parsed.recommendations,
      actions,
      followUpQuestions: parsed.followUpQuestions,
      confidence: parsed.confidence,
    },
  };
}

/** Graceful fallback when validation and retry both fail. */
export function createGracefulErrorResponse(): CoachResponse {
  return {
    summary:
      "Forge could not produce a structured response right now. Your data is still available — try again in a moment.",
    insights: [],
    recommendations: [],
    actions: [],
    followUpQuestions: ["Review my day", "What patterns has Forge noticed?"],
    confidence: 0,
  };
}

export const STRICT_JSON_RETRY_INSTRUCTION =
  "Return ONLY valid JSON matching the schema exactly. No markdown. No prose outside JSON. All arrays required.";
