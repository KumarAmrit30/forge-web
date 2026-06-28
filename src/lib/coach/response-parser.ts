import type { CoachResponse } from "@/lib/coach/coach-types";
import type { ParsedCoachResponse } from "@/lib/coach/coach-types";

/** Map validated CoachResponse JSON to UI-facing parsed response. */
export function parseCoachResponse(response: CoachResponse): ParsedCoachResponse {
  return {
    summary: response.summary,
    insights: response.insights,
    recommendations: response.recommendations,
    suggestedQuestions: response.followUpQuestions,
    actions: response.actions.map((action) => ({
      id: action.id,
      label: action.label,
      actionType: action.actionType,
    })),
    confidence: response.confidence,
  };
}

/** Flatten a parsed response into display text for MessageBubble fallback. */
export function formatParsedResponse(parsed: ParsedCoachResponse): string {
  const sections = [parsed.summary];

  if (parsed.insights.length > 0) {
    sections.push(parsed.insights.map((item) => `• ${item}`).join("\n"));
  }

  if (parsed.recommendations.length > 0) {
    sections.push(
      parsed.recommendations.map((item) => `→ ${item}`).join("\n")
    );
  }

  return sections.join("\n\n");
}
