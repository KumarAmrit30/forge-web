import type {
  ExecutionHandlerId,
  ExecutionRequest,
  ExecutionValidationError,
  ExecutionValidationResult,
  ValidationContext,
} from "@/lib/execution/execution-types";
import { getRegistryEntryByHandlerId } from "@/lib/execution/execution-registry";
import {
  VALIDATION_RULES,
} from "@/lib/execution/execution-validation-rules";
import { getSettingsSnapshot } from "@/stores/settingsStore";

function error(
  code: string,
  message: string,
  field?: string
): ExecutionValidationError {
  return { code, message, field };
}

function validateClient(context: ValidationContext): ExecutionValidationError[] {
  if (!context.clientAvailable) {
    return [
      error(
        "client_unavailable",
        "Execution requires a client environment with store access."
      ),
    ];
  }
  return [];
}

function validateHandlerRegistered(
  request: ExecutionRequest
): ExecutionValidationError[] {
  const entry = getRegistryEntryByHandlerId(request.handlerId);
  if (!entry) {
    return [
      error(
        "unknown_handler",
        `No registry entry for handler "${request.handlerId}".`
      ),
    ];
  }
  if (entry.category !== request.category) {
    return [
      error(
        "category_mismatch",
        `Handler category "${entry.category}" does not match request category "${request.category}".`
      ),
    ];
  }
  return [];
}

function validatePermissions(request: ExecutionRequest): ExecutionValidationError[] {
  if (
    request.source === "system" ||
    request.source === "conversation-action" ||
    request.source === "conversation-recommendation" ||
    request.source === "manual" ||
    request.source === "undo"
  ) {
    return [];
  }
  return [error("permission_denied", `Source "${request.source}" is not permitted.`)];
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function validateHydration(
  request: ExecutionRequest,
  context: ValidationContext
): ExecutionValidationError[] {
  if (request.handlerId !== "update-water-goal") return [];

  const { minMl, maxMl, defaultDeltaMl, fallbackCurrentMl } =
    VALIDATION_RULES.waterGoal;
  if (
    "targetMl" in request.payload &&
    !isFiniteNumber(request.payload.targetMl)
  ) {
    return [
      error(
        "invalid_water_goal",
        "Water goal targetMl must be a finite number.",
        "targetMl"
      ),
    ];
  }

  if (
    "deltaMl" in request.payload &&
    !isFiniteNumber(request.payload.deltaMl)
  ) {
    return [
      error(
        "invalid_water_goal",
        "Water goal deltaMl must be a finite number.",
        "deltaMl"
      ),
    ];
  }

  const target = isFiniteNumber(request.payload.targetMl)
    ? request.payload.targetMl
    : undefined;
  const delta = isFiniteNumber(request.payload.deltaMl)
    ? request.payload.deltaMl
    : defaultDeltaMl;

  const current = context.settingsGoal?.dailyWaterGoal ?? fallbackCurrentMl;
  const resolved = target ?? current + delta;

  if (resolved < minMl || resolved > maxMl) {
    return [
      error(
        "invalid_water_goal",
        `Water goal must be between ${minMl}ml and ${maxMl}ml.`,
        "targetMl"
      ),
    ];
  }

  return [];
}

function validateSleep(request: ExecutionRequest): ExecutionValidationError[] {
  if (request.handlerId !== "update-sleep-goal") return [];

  const { minHours, maxHours } = VALIDATION_RULES.sleepGoal;
  const hours = isFiniteNumber(request.payload.targetHours)
    ? request.payload.targetHours
    : undefined;

  if (hours === undefined) {
    return [
      error(
        "missing_payload",
        "Sleep goal updates require targetHours in payload.",
        "targetHours"
      ),
    ];
  }

  if (hours < minHours || hours > maxHours) {
    return [
      error(
        "invalid_sleep_goal",
        `Sleep goal must be between ${minHours} and ${maxHours} hours.`,
        "targetHours"
      ),
    ];
  }

  return [];
}

function validateProtein(request: ExecutionRequest): ExecutionValidationError[] {
  if (request.handlerId !== "update-protein-goal") return [];

  const { minGrams, maxGrams } = VALIDATION_RULES.proteinGoal;
  const grams = isFiniteNumber(request.payload.targetGrams)
    ? request.payload.targetGrams
    : undefined;

  if (grams === undefined) {
    return [
      error(
        "missing_payload",
        "Protein goal updates require targetGrams in payload.",
        "targetGrams"
      ),
    ];
  }

  if (grams < minGrams || grams > maxGrams) {
    return [
      error(
        "invalid_protein_goal",
        `Protein goal must be between ${minGrams}g and ${maxGrams}g.`,
        "targetGrams"
      ),
    ];
  }

  return [];
}

function validateWorkoutSchedule(
  request: ExecutionRequest
): ExecutionValidationError[] {
  if (request.handlerId !== "move-workout-schedule") return [];

  const shift = request.payload.shiftDays;
  if (shift === undefined) return [];

  if (shift !== undefined && !isFiniteNumber(shift)) {
    return [
      error(
        "missing_payload",
        "Workout shiftDays must be a number when provided.",
        "shiftDays"
      ),
    ];
  }

  const { minDays, maxDays } = VALIDATION_RULES.workoutShift;
  if (shift < minDays || shift > maxDays) {
    return [
      error(
        "schedule_conflict",
        `Workout schedule shift must be within ±${Math.abs(maxDays)} days.`,
        "shiftDays"
      ),
    ];
  }

  return [];
}

function validateReflection(request: ExecutionRequest): ExecutionValidationError[] {
  if (request.handlerId !== "open-reflection") return [];

  const mode = request.payload.mode;
  if (mode === undefined) return [];

  if (typeof mode !== "string") {
    return [
      error(
        "invalid_reflection_mode",
        "Reflection mode must be a string.",
        "mode"
      ),
    ];
  }

  if (
    !VALIDATION_RULES.reflection.allowedModes.includes(
      mode as (typeof VALIDATION_RULES.reflection.allowedModes)[number]
    )
  ) {
    return [
      error(
        "invalid_reflection_mode",
        `Reflection mode must be one of: ${VALIDATION_RULES.reflection.allowedModes.join(", ")}.`,
        "mode"
      ),
    ];
  }

  return [];
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function validateRoutine(request: ExecutionRequest): ExecutionValidationError[] {
  if (request.handlerId !== "update-routine") return [];

  const { morning, night } = request.payload;
  if (morning === undefined && night === undefined) return [];

  if (morning !== undefined && !isStringArray(morning)) {
    return [
      error(
        "invalid_routine",
        "Routine morning array must contain only strings.",
        "morning"
      ),
    ];
  }

  if (night !== undefined && !isStringArray(night)) {
    return [
      error(
        "invalid_routine",
        "Routine night array must contain only strings.",
        "night"
      ),
    ];
  }

  return [];
}

function validateSettingsProfile(
  request: ExecutionRequest
): ExecutionValidationError[] {
  if (request.handlerId !== "update-settings-profile") return [];

  const profile = request.payload.profile;
  if (typeof profile !== "object" || profile === null) {
    return [
      error(
        "invalid_profile",
        "Settings profile updates require a profile object in payload.",
        "profile"
      ),
    ];
  }

  return [];
}

function validateCalendarDay(request: ExecutionRequest): ExecutionValidationError[] {
  if (request.handlerId !== "mark-calendar-day") return [];

  const date = request.payload.date;
  if (date === undefined) return [];

  if (
    typeof date !== "string" ||
    !VALIDATION_RULES.calendarDate.pattern.test(date)
  ) {
    return [
      error(
        "invalid_date",
        "Calendar date must match YYYY-MM-DD format.",
        "date"
      ),
    ];
  }

  return [];
}

function validatePlaceholderHandlers(
  handlerId: ExecutionHandlerId
): ExecutionValidationError[] {
  if (handlerId === "schedule-notification" || handlerId === "queue-sync") {
    return [
      error(
        "not_implemented",
        `Handler "${handlerId}" is registered but not yet implemented.`
      ),
    ];
  }
  return [];
}

/** Payload rules skipped for undo — snapshots were validated at original execution. */
function validateHandlerPayload(
  request: ExecutionRequest,
  context: ValidationContext
): ExecutionValidationError[] {
  if (request.source === "undo") {
    return [];
  }

  return [
    ...validateHydration(request, context),
    ...validateSleep(request),
    ...validateProtein(request),
    ...validateWorkoutSchedule(request),
    ...validateReflection(request),
    ...validateRoutine(request),
    ...validateSettingsProfile(request),
    ...validateCalendarDay(request),
  ];
}

/** Build validation context from current client store snapshots. */
export function buildValidationContext(): ValidationContext {
  const clientAvailable = typeof window !== "undefined";

  if (!clientAvailable) {
    return { clientAvailable: false };
  }

  const settings = getSettingsSnapshot();
  return {
    clientAvailable: true,
    settingsGoal: {
      dailyWaterGoal: settings.profile.dailyWaterGoal,
      dailySleepGoal: settings.profile.dailySleepGoal,
      dailyProteinGoal: settings.profile.dailyProteinGoal,
    },
  };
}

/** Validate an execution request — returns structured errors, never throws. */
export function validateExecutionRequest(
  request: ExecutionRequest,
  context: ValidationContext = buildValidationContext()
): ExecutionValidationResult {
  try {
    const errors: ExecutionValidationError[] = [
      ...validateClient(context),
      ...validateHandlerRegistered(request),
      ...validatePermissions(request),
      ...validateHandlerPayload(request, context),
      ...validatePlaceholderHandlers(request.handlerId),
    ];

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true };
  } catch {
    return {
      valid: false,
      errors: [
        error(
          "validation_internal_error",
          "Validation encountered an unexpected error."
        ),
      ],
    };
  }
}
