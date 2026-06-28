import type { CoachCapabilityId } from "@/lib/brain";
import type {
  ConversationMode,
  ConversationModeId,
} from "@/lib/personality/personality-types";

/** All conversation mode profiles — structured configuration, no prompt text. */
export const CONVERSATION_MODES: Record<ConversationModeId, ConversationMode> = {
  "daily-review": {
    id: "daily-review",
    name: "Daily Review",
    purpose: "Summarize today's habits, progress, and open loops with calm observation.",
    tone: ["calm", "observational"],
    length: "moderate",
    recommendationIntensity: 2,
    reflectionIntensity: 1,
    evidenceUsage: "balanced",
    endingStyle: "gentle-next-step",
    responseSections: {
      observation: true,
      explanation: true,
      recommendation: true,
      reflection: false,
    },
    capabilityIds: ["review-today"],
  },
  "weekly-review": {
    id: "weekly-review",
    name: "Weekly Review",
    purpose: "Analyze the past seven days — patterns, consistency, and momentum.",
    tone: ["observational", "analytical"],
    length: "extended",
    recommendationIntensity: 2,
    reflectionIntensity: 2,
    evidenceUsage: "emphasized",
    endingStyle: "open-question",
    responseSections: {
      observation: true,
      explanation: true,
      recommendation: true,
      reflection: true,
    },
    capabilityIds: ["review-week"],
  },
  "monthly-reflection": {
    id: "monthly-reflection",
    name: "Monthly Reflection",
    purpose: "Reflect on monthly consistency, identity growth, and longer arcs.",
    tone: ["reflective", "observational"],
    length: "extended",
    recommendationIntensity: 1,
    reflectionIntensity: 3,
    evidenceUsage: "emphasized",
    endingStyle: "observation-only",
    responseSections: {
      observation: true,
      explanation: true,
      recommendation: false,
      reflection: true,
    },
    capabilityIds: ["review-month", "compare-months"],
  },
  planning: {
    id: "planning",
    name: "Planning",
    purpose: "Suggest a focused plan for tomorrow or the coming week.",
    tone: ["forward-looking", "supportive"],
    length: "moderate",
    recommendationIntensity: 3,
    reflectionIntensity: 0,
    evidenceUsage: "balanced",
    endingStyle: "forward-focus",
    responseSections: {
      observation: true,
      explanation: true,
      recommendation: true,
      reflection: false,
    },
    capabilityIds: ["plan-tomorrow", "plan-next-week", "adjust-routine"],
  },
  explanation: {
    id: "explanation",
    name: "Explanation",
    purpose: "Explain a trend, metric, or pattern in plain, evidence-backed language.",
    tone: ["analytical", "calm"],
    length: "moderate",
    recommendationIntensity: 1,
    reflectionIntensity: 0,
    evidenceUsage: "emphasized",
    endingStyle: "open-question",
    responseSections: {
      observation: true,
      explanation: true,
      recommendation: false,
      reflection: false,
    },
    capabilityIds: ["explain-trend", "analyze-workout", "analyze-hydration"],
  },
  reflection: {
    id: "reflection",
    name: "Reflection",
    purpose: "Produce an observational reflection on identity growth and recent change.",
    tone: ["reflective", "quietly-optimistic"],
    length: "extended",
    recommendationIntensity: 0,
    reflectionIntensity: 3,
    evidenceUsage: "balanced",
    endingStyle: "observation-only",
    responseSections: {
      observation: true,
      explanation: true,
      recommendation: false,
      reflection: true,
    },
    capabilityIds: ["generate-reflection"],
  },
  celebration: {
    id: "celebration",
    name: "Celebration",
    purpose: "Acknowledge meaningful progress without exaggeration or hype.",
    tone: ["quietly-optimistic", "supportive"],
    length: "brief",
    recommendationIntensity: 0,
    reflectionIntensity: 2,
    evidenceUsage: "emphasized",
    endingStyle: "observation-only",
    responseSections: {
      observation: true,
      explanation: false,
      recommendation: false,
      reflection: true,
    },
    capabilityIds: [],
  },
  "open-conversation": {
    id: "open-conversation",
    name: "Open Conversation",
    purpose: "Respond to free-form questions with Forge's default calm, evidence-aware voice.",
    tone: ["calm", "observational", "supportive"],
    length: "moderate",
    recommendationIntensity: 1,
    reflectionIntensity: 1,
    evidenceUsage: "balanced",
    endingStyle: "open-question",
    responseSections: {
      observation: true,
      explanation: true,
      recommendation: true,
      reflection: true,
    },
    capabilityIds: [],
  },
};

const CAPABILITY_TO_MODE = new Map<CoachCapabilityId, ConversationModeId>(
  Object.values(CONVERSATION_MODES).flatMap((mode) =>
    mode.capabilityIds.map((id) => [id, mode.id] as const)
  )
);

/** Resolve the conversation mode for a capability id, defaulting to open conversation. */
export function resolveConversationMode(
  capabilityId: CoachCapabilityId | null
): ConversationMode {
  if (capabilityId) {
    const modeId = CAPABILITY_TO_MODE.get(capabilityId);
    if (modeId) {
      return CONVERSATION_MODES[modeId];
    }
  }
  return CONVERSATION_MODES["open-conversation"];
}

/** Get a conversation mode by its id. */
export function getConversationMode(id: ConversationModeId): ConversationMode {
  return CONVERSATION_MODES[id];
}

/** Serialize a conversation mode for prompt assembly. */
export function formatConversationMode(mode: ConversationMode): string {
  const sections = Object.entries(mode.responseSections)
    .filter(([, enabled]) => enabled)
    .map(([section]) => section)
    .join(" → ");

  return [
    `Mode: ${mode.name}`,
    `Purpose: ${mode.purpose}`,
    `Tone: ${mode.tone.join(", ")}`,
    `Length: ${mode.length}`,
    `Recommendation intensity: ${mode.recommendationIntensity}/3`,
    `Reflection intensity: ${mode.reflectionIntensity}/3`,
    `Evidence usage: ${mode.evidenceUsage}`,
    `Ending style: ${mode.endingStyle}`,
    `Response flow: ${sections || "observation only"}`,
  ].join("\n");
}

/** Return all mode ids for verification and documentation. */
export function listConversationModeIds(): ConversationModeId[] {
  return Object.keys(CONVERSATION_MODES) as ConversationModeId[];
}
