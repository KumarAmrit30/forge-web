import { todayKey } from "@/lib/date-utils";
import { VALIDATION_RULES } from "@/lib/execution/execution-validation-rules";
import { buildDefaultDayRecord } from "@/lib/sync-day";
import type { DayRecord } from "@/types";
import type {
  AffectedScreen,
  AffectedStore,
  ExecutionHandler,
  ExecutionHandlerId,
  ExecutionValueSnapshot,
  ExecutorOutput,
} from "@/lib/execution/execution-types";
import { getCalendarSnapshot, useCalendarStore } from "@/stores/calendarStore";
import { getSettingsSnapshot, useSettingsStore } from "@/stores/settingsStore";
import { importLegacyRoutineArrays } from "@/lib/routine-sync";
import { getWorkoutSnapshot, useWorkoutStore } from "@/stores/workoutStore";

function output(
  previousValues: ExecutionValueSnapshot,
  newValues: ExecutionValueSnapshot,
  affectedStores: AffectedStore[],
  affectedScreens: AffectedScreen[]
): ExecutorOutput {
  return { previousValues, newValues, affectedStores, affectedScreens };
}

const updateWaterGoalHandler: ExecutionHandler = {
  id: "update-water-goal",
  category: "hydration",
  supported: true,
  execute(payload) {
    const settings = getSettingsSnapshot();
    const previous = settings.profile.dailyWaterGoal;
    const delta =
      typeof payload.deltaMl === "number"
        ? payload.deltaMl
        : VALIDATION_RULES.waterGoal.defaultDeltaMl;
    const target =
      typeof payload.targetMl === "number" ? payload.targetMl : previous + delta;

    useSettingsStore.getState().setProfile({ dailyWaterGoal: target });

    return output(
      { dailyWaterGoal: previous },
      { dailyWaterGoal: target },
      ["settings"],
      ["today", "home", "progress"]
    );
  },
  undo(previousValues, _newValues) {
    const previous = previousValues.dailyWaterGoal;
    if (typeof previous !== "number") {
      return output({}, {}, [], []);
    }
    useSettingsStore.getState().setProfile({ dailyWaterGoal: previous });
    return output(
      _newValues,
      { dailyWaterGoal: previous },
      ["settings"],
      ["today", "home", "progress"]
    );
  },
};

const moveWorkoutScheduleHandler: ExecutionHandler = {
  id: "move-workout-schedule",
  category: "workout",
  supported: true,
  execute(payload) {
    const snapshot = getWorkoutSnapshot();
    const ids = snapshot.plan.days.map((day) => day.id);
    if (ids.length < 2) {
      return output({}, {}, [], []);
    }

    const shift =
      typeof payload.shiftDays === "number"
        ? payload.shiftDays
        : 1;
    const normalized = ((shift % ids.length) + ids.length) % ids.length;
    const rotated = [...ids.slice(normalized), ...ids.slice(0, normalized)];

    useWorkoutStore.getState().reorderDays(rotated);

    return output(
      { dayOrder: ids, cycle: snapshot.cycle },
      { dayOrder: rotated },
      ["workout"],
      ["today", "calendar"]
    );
  },
  undo(previousValues, _newValues) {
    const dayOrder = previousValues.dayOrder;
    if (!Array.isArray(dayOrder)) {
      return output({}, {}, [], []);
    }
    useWorkoutStore.getState().reorderDays(dayOrder as string[]);
    return output(
      _newValues,
      { dayOrder },
      ["workout"],
      ["today", "calendar"]
    );
  },
};

const updateSleepGoalHandler: ExecutionHandler = {
  id: "update-sleep-goal",
  category: "sleep",
  supported: true,
  execute(payload) {
    const settings = getSettingsSnapshot();
    const previous = settings.profile.dailySleepGoal;
    const target =
      typeof payload.targetHours === "number"
        ? payload.targetHours
        : previous;

    useSettingsStore.getState().setProfile({ dailySleepGoal: target });

    return output(
      { dailySleepGoal: previous },
      { dailySleepGoal: target },
      ["settings"],
      ["today", "home"]
    );
  },
  undo(previousValues, _newValues) {
    const previous = previousValues.dailySleepGoal;
    if (typeof previous !== "number") {
      return output({}, {}, [], []);
    }
    useSettingsStore.getState().setProfile({ dailySleepGoal: previous });
    return output(
      _newValues,
      { dailySleepGoal: previous },
      ["settings"],
      ["today", "home"]
    );
  },
};

const updateProteinGoalHandler: ExecutionHandler = {
  id: "update-protein-goal",
  category: "nutrition",
  supported: true,
  execute(payload) {
    const settings = getSettingsSnapshot();
    const previous = settings.profile.dailyProteinGoal;
    const target =
      typeof payload.targetGrams === "number"
        ? payload.targetGrams
        : previous + 10;

    useSettingsStore.getState().setProfile({ dailyProteinGoal: target });

    return output(
      { dailyProteinGoal: previous },
      { dailyProteinGoal: target },
      ["settings"],
      ["today", "progress"]
    );
  },
  undo(previousValues, _newValues) {
    const previous = previousValues.dailyProteinGoal;
    if (typeof previous !== "number") {
      return output({}, {}, [], []);
    }
    useSettingsStore.getState().setProfile({ dailyProteinGoal: previous });
    return output(
      _newValues,
      { dailyProteinGoal: previous },
      ["settings"],
      ["today", "progress"]
    );
  },
};

const openReflectionHandler: ExecutionHandler = {
  id: "open-reflection",
  category: "reflection",
  supported: true,
  execute(payload) {
    const startedAt = new Date().toISOString();
    return output(
      {},
      {
        reflectionStartedAt: startedAt,
        mode: payload.mode ?? "guided",
      },
      [],
      ["forge", "progress"]
    );
  },
  undo(previousValues, newValues) {
    return output(newValues, previousValues, [], ["forge", "progress"]);
  },
};

const updateRoutineHandler: ExecutionHandler = {
  id: "update-routine",
  category: "routine",
  supported: true,
  execute(payload) {
    const settings = getSettingsSnapshot();
    const morning =
      Array.isArray(payload.morning) && payload.morning.every((v) => typeof v === "string")
        ? (payload.morning as string[])
        : settings.morningRoutineItems;
    const night =
      Array.isArray(payload.night) && payload.night.every((v) => typeof v === "string")
        ? (payload.night as string[])
        : settings.nightRoutineItems;

    useSettingsStore.getState().setRoutineItems(morning, night);
    importLegacyRoutineArrays(morning, night);

    return output(
      {
        morningRoutineItems: settings.morningRoutineItems,
        nightRoutineItems: settings.nightRoutineItems,
      },
      { morningRoutineItems: morning, nightRoutineItems: night },
      ["settings"],
      ["today", "home"]
    );
  },
  undo(previousValues, _newValues) {
    const morning = previousValues.morningRoutineItems;
    const night = previousValues.nightRoutineItems;
    if (!Array.isArray(morning) || !Array.isArray(night)) {
      return output({}, {}, [], []);
    }
    useSettingsStore.getState().setRoutineItems(
      morning as string[],
      night as string[]
    );
    importLegacyRoutineArrays(morning as string[], night as string[]);
    return output(
      _newValues,
      { morningRoutineItems: morning, nightRoutineItems: night },
      ["settings"],
      ["today", "home"]
    );
  },
};

const updateSettingsProfileHandler: ExecutionHandler = {
  id: "update-settings-profile",
  category: "settings",
  supported: true,
  execute(payload) {
    const settings = getSettingsSnapshot();
    const patch = payload.profile;
    if (typeof patch !== "object" || patch === null) {
      return output({}, {}, [], []);
    }

    useSettingsStore.getState().setProfile(patch as Record<string, unknown>);

    return output(
      { profile: settings.profile },
      { profile: { ...settings.profile, ...(patch as object) } },
      ["settings"],
      ["settings", "home"]
    );
  },
  undo(previousValues, _newValues) {
    const profile = previousValues.profile;
    if (typeof profile !== "object" || profile === null) {
      return output({}, {}, [], []);
    }
    useSettingsStore.getState().setProfile(profile as Record<string, unknown>);
    return output(_newValues, { profile }, ["settings"], ["settings", "home"]);
  },
};

const markCalendarDayHandler: ExecutionHandler = {
  id: "mark-calendar-day",
  category: "calendar",
  supported: true,
  execute(payload) {
    const date =
      typeof payload.date === "string" ? payload.date : todayKey();
    const calendar = getCalendarSnapshot();
    const existing = calendar.days[date];
    const note =
      typeof payload.note === "string" ? payload.note : "Forge execution mark";

    const record: DayRecord = existing
      ? { ...existing, notes: note }
      : { ...buildDefaultDayRecord(date), notes: note };

    useCalendarStore.getState().upsertDay(record);

    return output(
      { date, previous: existing ?? null },
      { date, record },
      ["calendar"],
      ["calendar", "today", "progress"]
    );
  },
  undo(previousValues, _newValues) {
    const date = previousValues.date;
    if (typeof date !== "string") {
      return output({}, {}, [], []);
    }

    const previous = previousValues.previous;
    if (previous === null) {
      const calendar = getCalendarSnapshot();
      const nextDays = Object.fromEntries(
        Object.entries(calendar.days).filter(([key]) => key !== date)
      );
      useCalendarStore.getState().setDays(nextDays);
    } else {
      useCalendarStore.getState().upsertDay(previous as DayRecord);
    }

    return output(_newValues, { date, previous }, ["calendar"], [
      "calendar",
      "today",
      "progress",
    ]);
  },
};

const scheduleNotificationHandler: ExecutionHandler = {
  id: "schedule-notification",
  category: "notifications",
  supported: false,
  execute() {
    return output({}, {}, [], []);
  },
  undo() {
    return output({}, {}, [], []);
  },
};

const queueSyncHandler: ExecutionHandler = {
  id: "queue-sync",
  category: "sync",
  supported: false,
  execute() {
    return output({}, {}, [], []);
  },
  undo() {
    return output({}, {}, [], []);
  },
};

const HANDLERS: Record<ExecutionHandlerId, ExecutionHandler> = {
  "update-water-goal": updateWaterGoalHandler,
  "move-workout-schedule": moveWorkoutScheduleHandler,
  "update-sleep-goal": updateSleepGoalHandler,
  "update-protein-goal": updateProteinGoalHandler,
  "open-reflection": openReflectionHandler,
  "update-routine": updateRoutineHandler,
  "update-settings-profile": updateSettingsProfileHandler,
  "mark-calendar-day": markCalendarDayHandler,
  "schedule-notification": scheduleNotificationHandler,
  "queue-sync": queueSyncHandler,
};

/** Retrieve a handler implementation by id. */
export function getExecutionHandler(
  handlerId: ExecutionHandlerId
): ExecutionHandler | undefined {
  return HANDLERS[handlerId];
}

/** Execute a validated handler — mutations only, no validation or history. */
export function executeHandler(
  handlerId: ExecutionHandlerId,
  payload: ExecutionValueSnapshot
): ExecutorOutput {
  const handler = HANDLERS[handlerId];
  if (!handler) {
    return { previousValues: {}, newValues: {}, affectedStores: [], affectedScreens: [] };
  }
  return handler.execute(payload);
}

/** Undo a handler using stored value snapshots. */
export function undoHandler(
  handlerId: ExecutionHandlerId,
  previousValues: ExecutionValueSnapshot,
  newValues: ExecutionValueSnapshot
): ExecutorOutput {
  const handler = HANDLERS[handlerId];
  if (!handler) {
    return { previousValues: {}, newValues: {}, affectedStores: [], affectedScreens: [] };
  }
  return handler.undo(previousValues, newValues);
}

/** Whether a handler performs real store mutations. */
export function isHandlerSupported(handlerId: ExecutionHandlerId): boolean {
  return HANDLERS[handlerId]?.supported ?? false;
}
