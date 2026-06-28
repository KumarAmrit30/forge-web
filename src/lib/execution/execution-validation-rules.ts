/**
 * Single source of truth for execution validation bounds.
 * Used by execution-validator.ts — do not duplicate these values elsewhere.
 */
export const VALIDATION_RULES = {
  waterGoal: {
    minMl: 500,
    maxMl: 10_000,
    defaultDeltaMl: 250,
    fallbackCurrentMl: 3500,
  },
  sleepGoal: {
    minHours: 4,
    maxHours: 12,
  },
  proteinGoal: {
    minGrams: 50,
    maxGrams: 400,
  },
  workoutShift: {
    minDays: -7,
    maxDays: 7,
    defaultDays: 1,
  },
  calendarDate: {
    pattern: /^\d{4}-\d{2}-\d{2}$/,
  },
  reflection: {
    allowedModes: ["guided", "freeform"] as const,
  },
} as const;

/**
 * Human-readable documentation for every validation rule.
 * Auditors and tests reference this map — keep in sync with execution-validator.ts.
 */
export const VALIDATION_RULE_DOCS: Record<string, string> = {
  client_unavailable:
    "Execution requires a browser environment with Zustand store access.",
  unknown_handler: "handlerId must exist in EXECUTION_REGISTRY.",
  category_mismatch: "request.category must match the registry entry category.",
  permission_denied:
    "source must be conversation-action, conversation-recommendation, manual, system, or undo.",
  invalid_water_goal: `Resolved water goal must be ${VALIDATION_RULES.waterGoal.minMl}–${VALIDATION_RULES.waterGoal.maxMl} ml.`,
  invalid_sleep_goal: `Sleep targetHours must be ${VALIDATION_RULES.sleepGoal.minHours}–${VALIDATION_RULES.sleepGoal.maxHours}.`,
  invalid_protein_goal: `Protein targetGrams must be ${VALIDATION_RULES.proteinGoal.minGrams}–${VALIDATION_RULES.proteinGoal.maxGrams}.`,
  missing_payload: "Required payload field is absent for this handler.",
  schedule_conflict: `Workout shiftDays must be ${VALIDATION_RULES.workoutShift.minDays} to ${VALIDATION_RULES.workoutShift.maxDays}.`,
  invalid_date: "Calendar date must match YYYY-MM-DD format.",
  invalid_routine: "Routine morning/night arrays must contain only strings.",
  invalid_profile: "Settings profile patch must be a non-null object.",
  invalid_reflection_mode: `Reflection mode must be one of: ${VALIDATION_RULES.reflection.allowedModes.join(", ")}.`,
  not_implemented: "Placeholder handlers reject execution until implemented.",
};
