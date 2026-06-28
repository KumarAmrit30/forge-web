import type { CoachCapability, CoachCapabilityId, ForgeBrainResult } from "@/lib/brain";
import type { MessageExperience } from "@/lib/coach/conversation-experience";
import type {
  ConversationMemory,
  ConversationPlan,
} from "@/lib/conversation/conversation-types";

/** Validated JSON contract returned by Gemini. */
export type CoachResponse = {
  summary: string;
  insights: string[];
  recommendations: string[];
  actions: Array<{
    id: string;
    label: string;
    actionType: string;
  }>;
  followUpQuestions: string[];
  confidence: number;
};

/** Deterministic capability resolution result. */
export type ResolvedCapability = {
  id: CoachCapabilityId | null;
  title: string;
  description: string;
  capability: CoachCapability | null;
  source: "explicit" | "keyword" | "free-question";
};

/** Conversation turn for prompt history. */
export type CoachConversationTurn = {
  role: "user" | "assistant";
  content: string;
};

/** Brain slices selected for a specific capability. */
export type OptimizedBrainContext = {
  today: string;
  settings: {
    profile: {
      name: string;
      dailyWaterGoal: number;
      dailySleepGoal: number;
      dailyProteinGoal: number;
      startDate: string;
    };
    streak: number;
    morningRoutineItems: string[];
    nightRoutineItems: string[];
  };
  identity: {
    title: string;
    stage: string;
    level: string;
    forgeInsight: string;
    monthlyReflection?: {
      title: string;
      summary: string;
      highlights: string[];
    };
  };
  dayRecords: Array<Record<string, unknown>>;
  monthRecords: Array<Record<string, unknown>>;
  workout: {
    sessions: Record<string, unknown>;
    nextWorkoutDayId: string;
  };
  water: {
    dailyLogs: Record<string, { date: string; totalMl: number }>;
    currentStreak: number;
    longestStreak: number;
  };
  progress: {
    weightLogCount: number;
    strengthLogCount: number;
    latestWeightKg: number | null;
  } | null;
  patterns: Array<Record<string, unknown>>;
  trends: Array<Record<string, unknown>>;
  behaviors: Array<Record<string, unknown>>;
  predictions: Array<Record<string, unknown>>;
  recommendations: Array<Record<string, unknown>>;
  memory: Array<Record<string, unknown>>;
};

/** Fixed-order prompt payload sent to the LLM layer. */
export type ForgeCoachPrompt = {
  systemInstruction: string;
  userContent: string;
  responseJsonSchema: Record<string, unknown>;
  modelConfig: {
    model: string;
    temperature: number;
    maxOutputTokens: number;
    topP: number;
    streaming: boolean;
    jsonMode: boolean;
  };
  strict: boolean;
};

/** Role of a message in the Forge conversation. */
export type CoachMessageRole = "user" | "assistant";

/** A single message in the conversation thread. */
export type CoachMessage = {
  id: string;
  role: CoachMessageRole;
  content: string;
  timestamp: string;
  parsed?: ParsedCoachResponse;
  experience?: MessageExperience;
};

/** Structured coach response after parsing validated JSON. */
export type ParsedCoachResponse = {
  summary: string;
  insights: string[];
  recommendations: string[];
  suggestedQuestions: string[];
  actions: CoachAction[];
  confidence: number;
};

/** Action surfaced from a coach response for CoachActionCard. */
export type CoachAction = {
  id: string;
  label: string;
  actionType: string;
  capabilityId?: CoachCapabilityId;
};

/** Pre-defined conversation starter shown before the first message. */
export type ConversationStarter = {
  id: string;
  label: string;
  capabilityId: CoachCapabilityId | null;
  question: string;
  priority: number;
};

/** Hero section data derived from the Forge Brain. */
export type ForgeCoachHero = {
  greeting: string;
  identityTitle: string;
  contextualSummary: string;
  illustration: string;
};

/** Full coach screen view model. */
export type ForgeCoachViewModel = {
  hero: ForgeCoachHero;
  starters: ConversationStarter[];
  brain: ForgeBrainResult;
};

/** Conversation thread state managed by the Conversation Manager. */
export type ConversationState = {
  messages: CoachMessage[];
  isThinking: boolean;
  isStreaming: boolean;
  partialResponse: string;
  thinkingMessage: string | null;
  brain: ForgeBrainResult | null;
  viewModel: ForgeCoachViewModel | null;
  sessionMemory: ConversationMemory;
  conversationPlan: ConversationPlan | null;
  dismissedActionIds: string[];
};

/** Request passed to the LLM client façade (pre-built prompt from the browser). */
export type LLMClientRequest = {
  prompt: ForgeCoachPrompt;
  stream?: boolean;
};

/** Request accepted by POST /api/coach/generate — prompt or message path. */
export type CoachGenerateApiRequest =
  | { prompt: ForgeCoachPrompt; stream?: boolean }
  | {
      message: string;
      capabilityId?: CoachCapabilityId;
      conversationHistory?: CoachConversationTurn[];
      stream?: boolean;
    };

/** Normalized LLM client error codes. */
export type LLMClientErrorCode =
  | "configuration"
  | "authentication"
  | "network"
  | "rate_limit"
  | "timeout"
  | "empty_response"
  | "invalid_json"
  | "unknown_provider"
  | "streaming_interrupted"
  | "unknown";

/** Response from the LLM client. */
export type LLMClientResponse = {
  rawText: string;
  model: string;
  streamed: boolean;
  error?: {
    code: LLMClientErrorCode;
    message: string;
  };
};

export type LLMStreamHandlers = {
  onPartial?: (partialText: string) => void;
};

/** LLM client interface — provider-agnostic browser façade. */
export type LLMClient = {
  complete: (
    request: LLMClientRequest,
    handlers?: LLMStreamHandlers
  ) => Promise<LLMClientResponse>;
};

/** @deprecated Use LLMClientRequest */
export type VertexClientRequest = LLMClientRequest;

/** @deprecated Use LLMClientErrorCode */
export type VertexClientErrorCode = LLMClientErrorCode;

/** @deprecated Use LLMClientResponse */
export type VertexClientResponse = LLMClientResponse;

/** @deprecated Use LLMStreamHandlers */
export type VertexStreamHandlers = LLMStreamHandlers;

/** @deprecated Use LLMClient */
export type VertexClient = LLMClient;

/** Validated generation result from the API route. */
export type CoachGenerationResult = {
  rawText: string;
  model: string;
  coachResponse: CoachResponse;
  streamed: boolean;
};
