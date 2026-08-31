import type { NikolSession } from "@/types";

/**
 * Where a table's session lives between page loads. Backed by localStorage
 * for the demo; a real deployment swaps in an API client so every device at
 * the table reads the same order. Nothing outside this module knows which.
 */
export interface SessionStore {
  load(key: string): NikolSession | null;
  save(key: string, session: NikolSession): void;
  clear(key: string): void;
}

/** One entry per table, so two tables in one browser don't collide. */
export function sessionKey(restaurantId: string, tableNumber: number): string {
  return `nikol:session:${restaurantId}:${tableNumber}`;
}

const VERSION = 1;

interface Envelope {
  version: number;
  session: NikolSession;
}

export const localSessionStore: SessionStore = {
  load(key) {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Envelope;
      // A stale shape from an older build is worse than no session at all.
      if (parsed.version !== VERSION) return null;
      return parsed.session;
    } catch {
      return null;
    }
  },

  save(key, session) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify({ version: VERSION, session }));
    } catch {
      // Private mode or a full quota. The session still works in memory.
    }
  },

  clear(key) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Nothing to do — the in-memory session is still authoritative.
    }
  },
};
