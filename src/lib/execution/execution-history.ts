import { generateId } from "@/lib/id";
import type {
  ExecutionHistoryEntry,
  ExecutionMetadata,
  ExecutionSource,
  ExecutionValueSnapshot,
  ExecutionHandlerId,
  ExecutionCategory,
} from "@/lib/execution/execution-types";

const historyEntries: ExecutionHistoryEntry[] = [];

/** Record a successful execution for analytics, sync, and undo. */
export function recordExecutionHistory(input: {
  requestId: string;
  handlerId: ExecutionHandlerId;
  category: ExecutionCategory;
  source: ExecutionSource;
  previousValues: ExecutionValueSnapshot;
  newValues: ExecutionValueSnapshot;
  metadata?: ExecutionMetadata;
  undoAvailable: boolean;
}): ExecutionHistoryEntry {
  const entry: ExecutionHistoryEntry = {
    id: generateId(),
    requestId: input.requestId,
    handlerId: input.handlerId,
    category: input.category,
    timestamp: new Date().toISOString(),
    source: input.source,
    previousValues: input.previousValues,
    newValues: input.newValues,
    metadata: input.metadata,
    undoAvailable: input.undoAvailable,
    undone: false,
  };

  historyEntries.unshift(entry);
  return entry;
}

/** Mark a history entry as undone. */
export function markHistoryUndone(historyEntryId: string): boolean {
  const entry = historyEntries.find((item) => item.id === historyEntryId);
  if (!entry || entry.undone) return false;
  entry.undone = true;
  return true;
}

/** Retrieve a history entry by id. */
export function getHistoryEntry(
  historyEntryId: string
): ExecutionHistoryEntry | undefined {
  return historyEntries.find((entry) => entry.id === historyEntryId);
}

/** List history entries — newest first. Designed for future persistence adapter. */
export function listExecutionHistory(limit = 50): ExecutionHistoryEntry[] {
  return historyEntries.slice(0, limit);
}

/** Clear in-memory history — for tests or session reset. */
export function clearExecutionHistory(): void {
  historyEntries.length = 0;
}

/** Export history snapshot for future cloud sync — deep-cloned for JSON safety. */
export function exportExecutionHistory(): ExecutionHistoryEntry[] {
  return cloneHistoryEntries(historyEntries);
}

/** Deep-clone history entries via JSON — verifies serializability. */
export function cloneHistoryEntries(
  entries: ExecutionHistoryEntry[]
): ExecutionHistoryEntry[] {
  return JSON.parse(JSON.stringify(entries)) as ExecutionHistoryEntry[];
}

/** Import history snapshot from future sync adapter. */
export function importExecutionHistory(entries: ExecutionHistoryEntry[]): void {
  historyEntries.splice(0, historyEntries.length, ...cloneHistoryEntries(entries));
}
