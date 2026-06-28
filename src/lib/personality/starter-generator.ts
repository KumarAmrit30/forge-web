import type { CoachCapabilityId, ForgeBrainResult } from "@/lib/brain";
import { getTimeOfDay } from "@/lib/home-data";
import type {
  ConversationStarter,
} from "@/lib/coach/coach-types";
import type {
  DayOfWeek,
  StarterStrategy,
  StarterTimeOfDay,
} from "@/lib/personality/personality-types";

/** All starter candidates with typed surfacing strategies — no hardcoded weekday logic. */
export const STARTER_STRATEGIES: StarterStrategy[] = [
  {
    id: "review-today",
    label: "Review Today",
    capabilityId: "review-today",
    question: "Review my day so far.",
    contextBoosts: [
      { times: ["afternoon", "evening"], boost: 2 },
      { days: [5], times: ["evening", "night"], boost: 3 },
    ],
  },
  {
    id: "plan-tomorrow",
    label: "Plan Tomorrow",
    capabilityId: "plan-tomorrow",
    question: "Help me plan tomorrow.",
    contextBoosts: [
      { times: ["evening", "night"], boost: 3 },
      { days: [5], times: ["afternoon", "evening"], boost: 2 },
    ],
  },
  {
    id: "weekly-reflection",
    label: "Weekly Reflection",
    capabilityId: "review-week",
    question: "Reflect on my week.",
    contextBoosts: [
      { days: [1], times: ["morning", "afternoon"], boost: 3 },
      { days: [0, 6], boost: 2 },
    ],
  },
  {
    id: "plan-this-week",
    label: "Plan This Week",
    capabilityId: "plan-next-week",
    question: "Help me plan this week.",
    contextBoosts: [
      { days: [1], times: ["morning"], boost: 3 },
    ],
  },
  {
    id: "explain-progress",
    label: "Explain My Progress",
    capabilityId: "explain-trend",
    question: "Explain my recent progress.",
    contextBoosts: [
      { times: ["afternoon"], boost: 1 },
      { days: [5], times: ["evening"], boost: 2 },
    ],
  },
  {
    id: "improve-sleep",
    label: "Improve My Sleep",
    capabilityId: "adjust-routine",
    question: "How can I improve my sleep?",
    contextBoosts: [],
  },
  {
    id: "analyze-workout",
    label: "Analyze My Workout",
    capabilityId: "analyze-workout",
    question: "Analyze my workout consistency.",
    contextBoosts: [],
  },
  {
    id: "reflect-on-change",
    label: "How Have I Changed?",
    capabilityId: "generate-reflection",
    question: "How have I changed recently?",
    contextBoosts: [
      { days: [0, 6], boost: 3 },
    ],
  },
  {
    id: "review-consistency",
    label: "Review Consistency",
    capabilityId: "review-week",
    question: "Review my consistency this week.",
    contextBoosts: [
      { days: [0, 6], boost: 2 },
    ],
  },
  {
    id: "ask-forge",
    label: "Ask Forge",
    capabilityId: null,
    question: "",
    contextBoosts: [],
  },
];

function getCurrentContext(date = new Date()): {
  dayOfWeek: DayOfWeek;
  timeOfDay: StarterTimeOfDay;
} {
  return {
    dayOfWeek: date.getDay() as DayOfWeek,
    timeOfDay: getTimeOfDay(date),
  };
}

/** Score a context boost against the current time context. */
function matchesContextBoost(
  boost: StarterStrategy["contextBoosts"][number],
  dayOfWeek: DayOfWeek,
  timeOfDay: StarterTimeOfDay
): boolean {
  const dayMatch = !boost.days || boost.days.includes(dayOfWeek);
  const timeMatch = !boost.times || boost.times.includes(timeOfDay);
  return dayMatch && timeMatch;
}

/** Score a starter based on Brain signals — Brain determines what is possible. */
function scoreBrainSignals(
  capabilityId: CoachCapabilityId | null,
  brain: ForgeBrainResult
): number {
  if (!capabilityId) return 0;
  let score = 0;

  if (capabilityId === "analyze-workout") {
    const workoutTrend = brain.trends.find(
      (trend) => trend.metric === "workout_completion_rate"
    );
    if (workoutTrend?.direction === "declining") score += 3;
    if (brain.patterns.some((pattern) => pattern.category === "workout")) {
      score += 2;
    }
  }

  if (capabilityId === "adjust-routine") {
    const sleepTrend = brain.trends.find(
      (trend) =>
        trend.metric === "sleep_avg_hours" ||
        trend.metric === "sleep_goal_hit_rate"
    );
    if (
      sleepTrend?.direction === "declining" ||
      sleepTrend?.direction === "plateau"
    ) {
      score += 3;
    }
  }

  if (capabilityId === "explain-trend") {
    if (brain.trends.length > 0) score += 2;
  }

  if (capabilityId === "review-today") score += 1;
  if (capabilityId === "plan-tomorrow") score += 1;
  if (capabilityId === "generate-reflection" && brain.patterns.length > 2) {
    score += 2;
  }

  if (capabilityId === "review-week" && brain.trends.length > 0) {
    score += 1;
  }

  return score;
}

/** Score context-based boosts from typed strategy configuration. */
function scoreContextBoosts(
  strategy: StarterStrategy,
  dayOfWeek: DayOfWeek,
  timeOfDay: StarterTimeOfDay
): number {
  return strategy.contextBoosts.reduce((total, boost) => {
    if (matchesContextBoost(boost, dayOfWeek, timeOfDay)) {
      return total + boost.boost;
    }
    return total;
  }, 0);
}

/** Compute total priority for a starter strategy. */
export function scoreStarterStrategy(
  strategy: StarterStrategy,
  brain: ForgeBrainResult,
  date = new Date()
): number {
  const { dayOfWeek, timeOfDay } = getCurrentContext(date);
  return (
    scoreBrainSignals(strategy.capabilityId, brain) +
    scoreContextBoosts(strategy, dayOfWeek, timeOfDay)
  );
}

/** Rank starter strategies into conversation starters for the Coach UI. */
export function rankConversationStarters(
  brain: ForgeBrainResult,
  date = new Date()
): ConversationStarter[] {
  return STARTER_STRATEGIES.map((strategy) => ({
    id: strategy.id,
    label: strategy.label,
    capabilityId: strategy.capabilityId,
    question: strategy.question,
    priority: scoreStarterStrategy(strategy, brain, date),
  }))
    .sort((a, b) => b.priority - a.priority)
    .map((starter, index) => ({ ...starter, priority: index }));
}

/** Resolve the question text for a starter chip. */
export function resolveStarterQuestionText(
  starter: ConversationStarter,
  customQuestion?: string
): string {
  if (starter.id === "ask-forge") {
    return customQuestion?.trim() ?? "";
  }
  return starter.question;
}

/** Resolve capability id from a starter. */
export function capabilityForStarterStrategy(
  starter: ConversationStarter
): CoachCapabilityId | undefined {
  return starter.capabilityId ?? undefined;
}
