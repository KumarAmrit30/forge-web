import { generateId } from "@/lib/id";
import type { ForgeContext, MemoryEntry } from "@/lib/brain/types";

export type MemoryStore = {
  list: () => MemoryEntry[];
  getActive: () => MemoryEntry[];
  add: (entry: Omit<MemoryEntry, "id" | "createdAt">) => MemoryEntry;
  update: (id: string, patch: Partial<MemoryEntry>) => MemoryEntry | null;
  remove: (id: string) => boolean;
};

const memoryEntries: MemoryEntry[] = [];

/** In-memory placeholder store for user life context. Replaced by Firestore in a later phase. */
export function createMemoryStore(): MemoryStore {
  return {
    list: () => [...memoryEntries],
    getActive: () => memoryEntries.filter((entry) => entry.active),
    add: (entry) => {
      const stored: MemoryEntry = {
        ...entry,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      memoryEntries.push(stored);
      return stored;
    },
    update: (id, patch) => {
      const index = memoryEntries.findIndex((entry) => entry.id === id);
      if (index < 0) return null;
      memoryEntries[index] = { ...memoryEntries[index], ...patch };
      return memoryEntries[index];
    },
    remove: (id) => {
      const index = memoryEntries.findIndex((entry) => entry.id === id);
      if (index < 0) return false;
      memoryEntries.splice(index, 1);
      return true;
    },
  };
}

const defaultStore = createMemoryStore();

/** Return active life-context entries relevant to the current moment. */
export function getActiveMemory(
  context: ForgeContext,
  store: MemoryStore = defaultStore
): MemoryEntry[] {
  void context;
  return store.getActive();
}

export { defaultStore as memoryStore };
