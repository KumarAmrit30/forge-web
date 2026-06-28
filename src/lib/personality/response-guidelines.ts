import type {
  ResponseStructure,
  ResponseStructureSection,
} from "@/lib/personality/personality-types";
import type { ConversationMode } from "@/lib/personality/personality-types";

/** Standard response flow and section definitions. */
export const RESPONSE_STRUCTURE: ResponseStructure = {
  defaultFlow: ["observation", "explanation", "recommendation", "reflection"],
  sectionDescriptions: {
    observation:
      "State what the data shows — today's status, recent patterns, or notable changes. No judgment.",
    explanation:
      "Explain why the observation matters, connecting evidence to context. No invented causation.",
    recommendation:
      "Offer one or two focused, actionable suggestions grounded in evidence. Use possibility language.",
    reflection:
      "Close with a thoughtful observation about identity, growth, or trajectory. No hype.",
  },
};

/** Mode-specific notes on how sections should be weighted. */
const MODE_SECTION_NOTES: Record<
  string,
  Partial<Record<ResponseStructureSection, string>>
> = {
  planning: {
    reflection: "Skip reflection. End with a forward-focused next step.",
    recommendation: "Lead with concrete, time-bound suggestions for tomorrow or next week.",
  },
  reflection: {
    recommendation: "Skip recommendations. Focus on observational reflection.",
    reflection: "This section carries the response. Connect patterns to identity growth.",
  },
  explanation: {
    explanation: "This section carries the response. Cite specific metrics and trends.",
    recommendation: "Skip unless the user explicitly asks what to do.",
  },
  celebration: {
    observation: "Acknowledge specific progress with evidence. No exaggerated praise.",
    explanation: "Skip unless context requires brief context.",
    recommendation: "Skip recommendations during celebration.",
    reflection: "Close with a grounded observation about what this progress suggests.",
  },
  "monthly-reflection": {
    recommendation: "Minimize recommendations. Monthly reflection is observational, not prescriptive.",
    reflection: "Emphasize identity arc and longer-term consistency patterns.",
  },
  "daily-review": {
    reflection: "Skip reflection unless the day had notable identity-relevant events.",
  },
};

/** Serialize response guidelines for a specific conversation mode. */
export function formatResponseGuidelines(mode: ConversationMode): string {
  const enabledSections = RESPONSE_STRUCTURE.defaultFlow.filter(
    (section) => mode.responseSections[section]
  );

  const flowDescription = enabledSections
    .map((section, index) => {
      const desc = RESPONSE_STRUCTURE.sectionDescriptions[section];
      const note = MODE_SECTION_NOTES[mode.id]?.[section];
      const prefix = `${index + 1}. ${section.toUpperCase()}`;
      return note ? `${prefix}: ${desc} ${note}` : `${prefix}: ${desc}`;
    })
    .join("\n");

  const disabledSections = RESPONSE_STRUCTURE.defaultFlow.filter(
    (section) => !mode.responseSections[section]
  );

  const omitNote =
    disabledSections.length > 0
      ? `\nOmit these sections: ${disabledSections.join(", ")}.`
      : "";

  return `Response structure for ${mode.name}:\n${flowDescription}${omitNote}`;
}

/** Return the enabled section flow for a mode. */
export function getEnabledSections(
  mode: ConversationMode
): ResponseStructureSection[] {
  return RESPONSE_STRUCTURE.defaultFlow.filter(
    (section) => mode.responseSections[section]
  );
}
