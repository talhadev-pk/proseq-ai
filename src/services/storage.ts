/**
 * Centralized localStorage access.
 *
 * Every persisted localStorage key in ProseQ AI goes through this module —
 * components and stores never call `localStorage` directly. All reads are
 * guarded (bad JSON, unavailable storage) and keys are namespaced + versioned.
 */

export const STORAGE_PREFIX = 'proseq'

export const STORE_KEYS = {
  meta: `${STORAGE_PREFIX}:meta`,
  profile: `${STORAGE_PREFIX}:profile`,
  preferences: `${STORAGE_PREFIX}:preferences`,
  brandVoices: `${STORAGE_PREFIX}:brand-voices`,
  planner: `${STORAGE_PREFIX}:planner`,
  activity: `${STORAGE_PREFIX}:activity`,
  ui: `${STORAGE_PREFIX}:ui`,
  /** localStorage fallback for the IndexedDB layer */
  dbDocuments: `${STORAGE_PREFIX}:db:documents`,
  dbSnapshots: `${STORAGE_PREFIX}:db:snapshots`,
  contactSubmissions: `${STORAGE_PREFIX}:contact-submissions`,
} as const

function available(): boolean {
  try {
    const probe = `${STORAGE_PREFIX}:probe`
    localStorage.setItem(probe, '1')
    localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

const isAvailable = available()

export const storage = {
  get isAvailable() {
    return isAvailable
  },

  read<T>(key: string): T | null {
    if (!isAvailable) return null
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return null
      return JSON.parse(raw) as T
    } catch {
      // Corrupt entry — remove it so the app can fall back to defaults.
      try {
        localStorage.removeItem(key)
      } catch {
        /* ignore */
      }
      return null
    }
  },

  write<T>(key: string, value: T): boolean {
    if (!isAvailable) return false
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },

  remove(key: string): void {
    if (!isAvailable) return
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  },

  /** Remove every key owned by this app (used by full reset). */
  clearAll(): void {
    if (!isAvailable) return
    try {
      const doomed: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith(`${STORAGE_PREFIX}:`)) doomed.push(k)
      }
      doomed.forEach((k) => localStorage.removeItem(k))
    } catch {
      /* ignore */
    }
  },
}
