import type { CoachCapabilityId, Recommendation } from "@/lib/brain";
import type { CoachAction } from "@/lib/coach/coach-types";

const ACTION_LABELS: Record<string, string> = {
  increase_daily_water_logging: "Log water now",
  prioritize_morning_routine_before_workout: "Open morning routine",
  protect_sleep_window_before_morning_routine: "Review sleep",
  schedule_evening_reflection_after_dinner: "Start reflection",
  complete_morning_routine_before_training_days: "Complete morning routine",
  set_weekday_hydration_reminder: "Set hydration reminder",
  front_load_water_intake_before_midday: "Add water entry",
  pre_commit_workout_slot_in_calendar: "View workout plan",
  maintain_current_routine_structure: "View today",
  focus_on_daily_logging_consistency: "Open today",
  increase_water_logging: "Log water now",
};

/** Map structured brain recommendations to coach UI actions. */
export function mapRecommendationsToActions(
  recommendations: Recommendation[]
): CoachAction[] {
  return recommendations.slice(0, 3).map((recommendation) => ({
    id: recommendation.id,
    label:
      ACTION_LABELS[recommendation.recommendedAction] ??
      recommendation.recommendedAction.replace(/_/g, " "),
    actionType: recommendation.recommendedAction,
    capabilityId: capabilityForAction(recommendation.recommendedAction),
  }));
}

function capabilityForAction(
  action: string
): CoachCapabilityId | undefined {
  if (action.includes("water") || action.includes("hydration")) {
    return "analyze-hydration";
  }
  if (action.includes("workout") || action.includes("morning_routine")) {
    return "analyze-workout";
  }
  if (action.includes("sleep")) {
    return "adjust-routine";
  }
  if (action.includes("reflection")) {
    return "generate-reflection";
  }
  if (action.includes("logging")) {
    return "review-today";
  }
  return undefined;
}
