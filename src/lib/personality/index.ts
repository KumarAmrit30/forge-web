import type { CoachCapabilityId } from "@/lib/brain";
import {
  CONVERSATION_MODES,
  formatConversationMode,
  getConversationMode,
  listConversationModeIds,
  resolveConversationMode,
} from "@/lib/personality/conversation-modes";
import {
  FORGE_PERSONALITY,
  formatCommunicationPrinciples,
  formatPersonalityIdentity,
} from "@/lib/personality/forge-personality";
import { formatGuardrails, GUARDRAILS } from "@/lib/personality/guardrails";
import type {
  PersonalityPromptInput,
  PersonalityPromptSections,
} from "@/lib/personality/personality-types";
import { formatResponseGuidelines } from "@/lib/personality/response-guidelines";
import {
  formatWritingRules,
  getForbiddenPhrases,
  WRITING_RULES,
} from "@/lib/personality/writing-rules";
import {
  capabilityForStarterStrategy,
  rankConversationStarters,
  resolveStarterQuestionText,
  scoreStarterStrategy,
  STARTER_STRATEGIES,
} from "@/lib/personality/starter-generator";
import { STYLE_EXAMPLES } from "@/lib/personality/style-examples";

export type {
  CommunicationPrinciple,
  ConversationMode,
  ConversationModeId,
  ConversationTone,
  DayOfWeek,
  EndingStyle,
  EvidenceUsage,
  ForgePersonality,
  Guardrail,
  IntensityLevel,
  PersonalityPromptInput,
  PersonalityPromptSections,
  ResponseLength,
  ResponseSectionConfig,
  ResponseStructure,
  ResponseStructureSection,
  StarterContextBoost,
  StarterStrategy,
  StarterTimeOfDay,
  StyleExample,
  WritingRule,
} from "@/lib/personality/personality-types";

export {
  CONVERSATION_MODES,
  FORGE_PERSONALITY,
  GUARDRAILS,
  STARTER_STRATEGIES,
  STYLE_EXAMPLES,
  WRITING_RULES,
  capabilityForStarterStrategy,
  formatCommunicationPrinciples,
  formatConversationMode,
  formatGuardrails,
  formatPersonalityIdentity,
  formatResponseGuidelines,
  formatWritingRules,
  getConversationMode,
  getForbiddenPhrases,
  listConversationModeIds,
  rankConversationStarters,
  resolveConversationMode,
  resolveStarterQuestionText,
  scoreStarterStrategy,
};

/**
 * Assemble personality guidance sections for Prompt Builder.
 * Consumes structured configuration — never duplicates rule text inline.
 */
export function buildPersonalityPromptSections(
  input: PersonalityPromptInput
): PersonalityPromptSections {
  const mode = getConversationMode(input.modeId);
  const strictNote = input.strict
    ? "\nReturn ONLY valid JSON. No markdown fences."
    : "";

  return {
    identity: formatPersonalityIdentity() + strictNote,
    principles: formatCommunicationPrinciples(),
    writingRules: formatWritingRules(),
    conversationMode: formatConversationMode(mode),
    guardrails: formatGuardrails(),
    responseGuidelines: formatResponseGuidelines(mode),
  };
}

/** Resolve conversation mode from capability and build prompt sections. */
export function buildPersonalityPromptForCapability(
  capabilityId: CoachCapabilityId | null,
  strict?: boolean
): PersonalityPromptSections {
  const mode = resolveConversationMode(capabilityId);
  return buildPersonalityPromptSections({ modeId: mode.id, strict });
}

/** Flatten personality sections into ordered strings for prompt assembly. */
export function flattenPersonalitySections(
  sections: PersonalityPromptSections
): string[] {
  return [
    "FORGE PERSONALITY",
    sections.identity,
    "COMMUNICATION PRINCIPLES",
    sections.principles,
    "WRITING RULES",
    sections.writingRules,
    "CONVERSATION MODE",
    sections.conversationMode,
    "GUARDRAILS",
    sections.guardrails,
    "RESPONSE GUIDELINES",
    sections.responseGuidelines,
  ];
}
