import type { CoachCapabilityId } from "@/lib/brain";

/** Unique identifier for a Forge conversation mode profile. */
export type ConversationModeId =
  | "daily-review"
  | "weekly-review"
  | "monthly-reflection"
  | "planning"
  | "explanation"
  | "reflection"
  | "celebration"
  | "open-conversation";

/** Intensity scale used across mode configuration (0 = none, 1 = low, 2 = moderate, 3 = high). */
export type IntensityLevel = 0 | 1 | 2 | 3;

/** Tone descriptor for a conversation mode. */
export type ConversationTone =
  | "calm"
  | "observational"
  | "analytical"
  | "supportive"
  | "forward-looking"
  | "reflective"
  | "quietly-optimistic";

/** Target response length guidance for a mode. */
export type ResponseLength = "brief" | "moderate" | "extended";

/** How strongly a mode should cite provided evidence. */
export type EvidenceUsage = "minimal" | "balanced" | "emphasized";

/** How a mode should close a response. */
export type EndingStyle =
  | "open-question"
  | "gentle-next-step"
  | "observation-only"
  | "forward-focus";

/** A named communication principle Forge follows in every response. */
export type CommunicationPrinciple = {
  id: string;
  name: string;
  description: string;
};

/** Core Forge personality definition — the communication constitution. */
export type ForgePersonality = {
  name: string;
  voice: string;
  tone: string;
  mission: string;
  communicationPrinciples: CommunicationPrinciple[];
  allowedBehaviors: string[];
  forbiddenBehaviors: string[];
  preferredVocabulary: string[];
  forbiddenVocabulary: string[];
  emotionalStyle: string;
  responsePhilosophy: string;
};

/** A deterministic writing rule enforced in every Forge response. */
export type WritingRule = {
  id: string;
  category: "forbidden-phrase" | "forbidden-pattern" | "preference" | "constraint";
  rule: string;
  rationale: string;
  examples?: {
    avoid: string;
    prefer: string;
  };
};

/** Structured profile for how Forge communicates in a specific context. */
export type ConversationMode = {
  id: ConversationModeId;
  name: string;
  purpose: string;
  tone: ConversationTone[];
  length: ResponseLength;
  recommendationIntensity: IntensityLevel;
  reflectionIntensity: IntensityLevel;
  evidenceUsage: EvidenceUsage;
  endingStyle: EndingStyle;
  /** Which response sections this mode emphasizes or omits. */
  responseSections: ResponseSectionConfig;
  /** Coach capabilities that route to this mode. */
  capabilityIds: CoachCapabilityId[];
};

/** Which sections appear in a Forge response for a given mode. */
export type ResponseSectionConfig = {
  observation: boolean;
  explanation: boolean;
  recommendation: boolean;
  reflection: boolean;
};

/** Standard response flow section identifiers. */
export type ResponseStructureSection =
  | "observation"
  | "explanation"
  | "recommendation"
  | "reflection";

/** Guidance for how Forge structures responses across modes. */
export type ResponseStructure = {
  defaultFlow: ResponseStructureSection[];
  sectionDescriptions: Record<ResponseStructureSection, string>;
};

/** A communication guardrail Forge must never violate. */
export type Guardrail = {
  id: string;
  category: "forbidden" | "required";
  rule: string;
  rationale: string;
};

/** Before/after style example for documentation — not runtime logic. */
export type StyleExample = {
  id: string;
  category: string;
  bad: string;
  good: string;
  principle: string;
};

/** Time-of-day buckets used for starter surfacing strategies. */
export type StarterTimeOfDay = "morning" | "afternoon" | "evening" | "night";

/** Day-of-week index: 0 = Sunday through 6 = Saturday. */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Context conditions that boost a starter's visibility. */
export type StarterContextBoost = {
  /** Day indices (0–6) where this boost applies. Empty = any day. */
  days?: DayOfWeek[];
  /** Time buckets where this boost applies. Empty = any time. */
  times?: StarterTimeOfDay[];
  /** Priority boost added when conditions match. */
  boost: number;
};

/** A conversation starter candidate with surfacing strategy metadata. */
export type StarterStrategy = {
  id: string;
  label: string;
  capabilityId: CoachCapabilityId | null;
  question: string;
  /** Context-based priority boosts — not hardcoded weekday logic. */
  contextBoosts: StarterContextBoost[];
};

/** Input for assembling personality guidance into an LLM prompt. */
export type PersonalityPromptInput = {
  modeId: ConversationModeId;
  strict?: boolean;
};

/** Serialized personality sections ready for Prompt Builder assembly. */
export type PersonalityPromptSections = {
  identity: string;
  principles: string;
  writingRules: string;
  conversationMode: string;
  guardrails: string;
  responseGuidelines: string;
};
