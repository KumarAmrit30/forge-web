import { getCapability } from "@/lib/brain";
import type { CoachCapability, CoachCapabilityId } from "@/lib/brain";
import type { ResolvedCapability } from "@/lib/coach/coach-types";

const ROUTING_RULES: Array<{
  capabilityId: CoachCapabilityId;
  patterns: RegExp[];
}> = [
  {
    capabilityId: "review-today",
    patterns: [/\btoday\b/i, /\bso far\b/i, /\bright now\b/i],
  },
  {
    capabilityId: "plan-tomorrow",
    patterns: [/\btomorrow\b/i, /\bnext day\b/i],
  },
  {
    capabilityId: "review-week",
    patterns: [/\bweek\b/i, /\bweekly\b/i, /\bpast 7\b/i, /\blast seven\b/i],
  },
  {
    capabilityId: "review-month",
    patterns: [
      /\bmonth\b/i,
      /\bmonthly\b/i,
      /\bprogress\b/i,
      /\bimprovement\b/i,
    ],
  },
  {
    capabilityId: "explain-trend",
    patterns: [/\btrend\b/i, /\bexplain\b/i, /\bdeclining\b/i, /\bimproving\b/i],
  },
  {
    capabilityId: "analyze-workout",
    patterns: [
      /\bworkout\b/i,
      /\btrain(?:ing)?\b/i,
      /\bgym\b/i,
      /\bsession\b/i,
    ],
  },
  {
    capabilityId: "analyze-hydration",
    patterns: [/\bhydration\b/i, /\bwater\b/i, /\bdrink\b/i],
  },
  {
    capabilityId: "adjust-routine",
    patterns: [/\bsleep\b/i, /\brest\b/i, /\broutine\b/i, /\bmorning\b/i],
  },
  {
    capabilityId: "generate-reflection",
    patterns: [/\breflect\b/i, /\bjournal\b/i, /\bevening\b/i],
  },
];

function matchCapability(message: string): CoachCapabilityId | null {
  for (const rule of ROUTING_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(message))) {
      return rule.capabilityId;
    }
  }
  return null;
}

function toResolved(
  capability: CoachCapability,
  source: ResolvedCapability["source"]
): ResolvedCapability {
  return {
    id: capability.id,
    title: capability.title,
    description: capability.description,
    capability,
    source,
  };
}

/**
 * Deterministic capability routing — never uses AI.
 */
export function resolveCapability(
  message: string,
  explicitCapabilityId?: CoachCapabilityId
): ResolvedCapability {
  if (explicitCapabilityId) {
    const capability = getCapability(explicitCapabilityId);
    if (capability) {
      return toResolved(capability, "explicit");
    }
  }

  const matchedId = matchCapability(message);
  if (matchedId) {
    const capability = getCapability(matchedId);
    if (capability) {
      return toResolved(capability, "keyword");
    }
  }

  return {
    id: null,
    title: "Free Question",
    description: "Open-ended Forge conversation.",
    capability: null,
    source: "free-question",
  };
}
