/** Persisted activity feed (drives the notifications bell). Capped at 40. */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ActivityItem, ActivityType } from '@/types'
import { STORE_KEYS } from '@/services/storage'
import { uid } from '@/lib/utils'

const CAP = 40

interface ActivityState {
  items: ActivityItem[]
  lastSeenAt: string | null
  log: (type: ActivityType, message: string) => void
  markSeen: () => void
  clear: () => void
  replaceAll: (items: ActivityItem[]) => void
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set) => ({
      items: [],
      lastSeenAt: null,
      log: (type, message) =>
        set((s) => ({
          items: [{ id: uid('act'), type, message, at: new Date().toISOString() }, ...s.items].slice(0, CAP),
        })),
      markSeen: () => set({ lastSeenAt: new Date().toISOString() }),
      clear: () => set({ items: [] }),
      replaceAll: (items) => set({ items }),
    }),
    {
      name: STORE_KEYS.activity,
      version: 1,
      partialize: (s) => ({ items: s.items, lastSeenAt: s.lastSeenAt }),
    },
  ),
)
