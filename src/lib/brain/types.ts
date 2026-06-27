import type { DayRecord, Profile, WorkoutSession } from "@/types";

/** Day record with normalized hydration for brain engines. */
export type IdentityDayRecord = DayRecord & { waterMl: number };

/** Lifecycle stage derived from habit consistency and logged history. */
export type GrowthStage = "early" | "forming" | "establishing" | "forged";

/** Coach-facing identity maturity band, aligned with but distinct from growth stage. */
export type IdentityLevel = "emerging" | "developing" | "established" | "forged";

/** Domain grouping for detected behavioral patterns. */
export type PatternCategory =
  | "routine"
  | "workout"
  | "hydration"
  | "sleep"
  | "reflection"
  | "consistency";

/** Direction of long-term metric movement. */
export type TrendDirection =
  | "improving"
  | "stable"
  | "declining"
  | "plateau"
  | "recovering";

/** Urgency band for structured coach recommendations. */
export type RecommendationPriority = "low" | "medium" | "high";

/** Discrete confidence band derived from numeric confidence scores. */
export type ConfidenceLevel = "low" | "moderate" | "high" | "very_high";

/** Classification of observed behavioral chain relationships. */
export type BehaviorType =
  | "routine_chain"
  | "recovery_chain"
  | "hydration_chain"
  | "consistency_chain"
  | "reflection_chain";

/** Classification of near-future outcome estimates. */
export type PredictionType =
  | "workout_likelihood"
  | "hydration_risk"
  | "streak_maintenance"
  | "momentum";

/** Life-context category stored by the memory engine. */
export type MemoryCategory =
  | "exam"
  | "travel"
  | "vacation"
  | "injury"
  | "career"
  | "routine-reset"
  | "other";

/**
 * Traceable fact supporting a pattern, trend, behavior, prediction, or recommendation.
 * Must originate from existing store data — never fabricated.
 */
export type Evidence = {
  id: string;
  source: string;
  timestamp: string;
  metric: string;
  value: string | number;
  description: string;
};

/** Normalized calendar slice within ForgeContext. */
export type ForgeCalendarContext = {
  days: Record<string, DayRecord>;
};

/** Normalized workout slice within ForgeContext. */
export type ForgeWorkoutContext = {
  sessions: Record<string, WorkoutSession>;
  nextWorkoutDayId: string;
  currentCycleIndex: number;
};

/** Normalized hydration slice within ForgeContext. */
export type ForgeWaterContext = {
  dailyLogs: Record<string, { date: string; totalMl: number }>;
  currentStreak: number;
  longestStreak: number;
};

/** Normalized settings slice within ForgeContext. */
export type ForgeSettingsContext = {
  profile: Profile;
  streak: number;
  lastActiveDate: string | null;
  morningRoutineItems: string[];
  nightRoutineItems: string[];
};

/** Normalized progress-tracking slice within ForgeContext. */
export type ForgeProgressContext = {
  weightLogCount: number;
  strengthLogCount: number;
  latestWeightKg: number | null;
};

/**
 * Structured snapshot of current application state.
 * Produced by the Context Engine only — no intelligence or recommendations.
 */
export type ForgeContext = {
  generatedAt: string;
  today: string;
  calendar: ForgeCalendarContext;
  workout: ForgeWorkoutContext;
  water: ForgeWaterContext;
  settings: ForgeSettingsContext;
  progress: ForgeProgressContext;
  dayRecords: IdentityDayRecord[];
  monthRecords: IdentityDayRecord[];
  prevMonthRecords: IdentityDayRecord[];
};

/**
 * Aggregated identity state consumed by Coach, Progress, and Recommendation engines.
 */
export type IdentityProfile = {
  title: string;
  illustration: string;
  stage: GrowthStage;
  level: IdentityLevel;
  heroReflection: string[];
  monthlyReflection: {
    label: string;
    title: string;
    summary: string;
    highlights: string[];
  };
  timelineEvents: Array<{
    id: string;
    label: string;
    date?: string;
    isHighlight?: boolean;
  }>;
  habitEvolution: Array<{
    id: string;
    personality: string;
    habit: string;
    metric: string;
    summary: string;
  }>;
  milestones: Array<{
    id: string;
    icon: string;
    label: string;
    achieved: boolean;
  }>;
  forgeInsight: string;
};

/**
 * Structured recurring relationship between habits or metrics.
 * Never contains natural-language coaching copy.
 */
export type Pattern = {
  id: string;
  category: PatternCategory;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  description: string;
  relatedMetrics: string[];
  evidence: Evidence[];
};

/**
 * Long-term movement signal for a habit or metric.
 */
export type Trend = {
  id: string;
  metric: string;
  direction: TrendDirection;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  windowDays: number;
  deltaPercent: number | null;
  evidence: Evidence[];
};

/**
 * Observed behavioral relationship chain: trigger → action → outcome.
 * Describes correlation, not causation.
 */
export type BehaviorInsight = {
  id: string;
  type: BehaviorType;
  trigger: string;
  action: string;
  outcome: string;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  evidence: Evidence[];
  relatedPatternIds: string[];
};

/**
 * Deterministic near-future outcome estimate derived from patterns, behaviors, and trends.
 */
export type Prediction = {
  id: string;
  type: PredictionType;
  likelihood: number;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  supportingPatternIds: string[];
  supportingBehaviorIds: string[];
  supportingTrendIds: string[];
  evidence: Evidence[];
};

/**
 * Structured coach recommendation before language generation.
 * Always backed by evidence from upstream engines.
 */
export type Recommendation = {
  id: string;
  priority: RecommendationPriority;
  category: PatternCategory;
  reason: string;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  recommendedAction: string;
  evidence: Evidence[];
  supportingPatternIds: string[];
  supportingBehaviorIds: string[];
  supportingPredictionIds: string[];
};

/**
 * Long-term user life context — not conversation memory.
 */
export type MemoryEntry = {
  id: string;
  category: MemoryCategory;
  title: string;
  description: string;
  startDate: string;
  endDate: string | null;
  active: boolean;
  createdAt: string;
};

/** Approved Coach capability identifier. */
export type CoachCapabilityId =
  | "review-today"
  | "review-week"
  | "review-month"
  | "explain-trend"
  | "analyze-workout"
  | "analyze-hydration"
  | "plan-tomorrow"
  | "plan-next-week"
  | "adjust-routine"
  | "compare-months"
  | "generate-reflection";

/** Context slices required before a capability can run. */
export type RequiredContextSlice =
  | "forge-context"
  | "identity"
  | "patterns"
  | "trends"
  | "behaviors"
  | "predictions"
  | "recommendations"
  | "memory";

/**
 * Approved Coach action exposed to Gemini through the capability registry.
 */
export type CoachCapability = {
  id: CoachCapabilityId;
  title: string;
  description: string;
  requiredContext: RequiredContextSlice[];
  requiredPermissions: string[];
  requiredPatterns?: PatternCategory[];
  requiredBehaviors?: BehaviorType[];
  requiredPredictions?: PredictionType[];
  handlerName: string;
};

/**
 * Structured payload handed to Gemini by the Prompt Builder.
 * Phase 2 extends the contract — no prompt text is generated yet.
 */
export type PromptPayload = {
  question: string;
  capabilityId: CoachCapabilityId | null;
  context: ForgeContext;
  identity: IdentityProfile;
  patterns: Pattern[];
  trends: Trend[];
  behaviors: BehaviorInsight[];
  predictions: Prediction[];
  recommendations: Recommendation[];
  memory: MemoryEntry[];
  capabilities: CoachCapability[];
  systemInstructions: string;
  userContent: string;
};

/** Full output of a Forge Brain run. */
export type ForgeBrainResult = {
  context: ForgeContext;
  identity: IdentityProfile;
  patterns: Pattern[];
  trends: Trend[];
  behaviors: BehaviorInsight[];
  predictions: Prediction[];
  recommendations: Recommendation[];
  memory: MemoryEntry[];
  promptPayload: PromptPayload | null;
};
