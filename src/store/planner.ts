/** Content planner — persisted to localStorage. */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DocumentCategory, PlannerEntry, PlannerStatus } from '@/types'
import { STORE_KEYS } from '@/services/storage'
import { uid } from '@/lib/utils'
import { useActivityStore } from './activity'

export interface PlannerDraft {
  title: string
  date: string
  category: DocumentCategory
  status: PlannerStatus
  notes: string
}

interface PlannerState {
  entries: PlannerEntry[]
  createEntry: (draft: PlannerDraft) => PlannerEntry | null
  updateEntry: (id: string, draft: PlannerDraft) => boolean
  setStatus: (id: string, status: PlannerStatus) => boolean
  deleteEntry: (id: string) => boolean
  forMonth: (year: number, month: number) => PlannerEntry[]
  replaceAll: (entries: PlannerEntry[]) => void
  clearAll: () => void
}

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      entries: [],

      createEntry: (draft) => {
        const title = draft.title.trim()
        if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(draft.date)) return null
        const now = new Date().toISOString()
        const entry: PlannerEntry = {
          id: uid('plan'),
          title,
          date: draft.date,
          category: draft.category,
          status: draft.status,
          notes: draft.notes.trim(),
          createdAt: now,
          updatedAt: now,
        }
        set((s) => ({ entries: [...s.entries, entry] }))
        useActivityStore.getState().log('planner-updated', `Scheduled “${entry.title}”`)
        return entry
      },

      updateEntry: (id, draft) => {
        const title = draft.title.trim()
        if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(draft.date)) return false
        let ok = false
        set((s) => ({
          entries: s.entries.map((e) => {
            if (e.id !== id) return e
            ok = true
            return { ...e, title, date: draft.date, category: draft.category, status: draft.status, notes: draft.notes.trim(), updatedAt: new Date().toISOString() }
          }),
        }))
        if (ok) useActivityStore.getState().log('planner-updated', `Updated “${title}”`)
        return ok
      },

      setStatus: (id, status) => {
        let ok = false
        set((s) => ({
          entries: s.entries.map((e) => {
            if (e.id !== id) return e
            ok = true
            return { ...e, status, updatedAt: new Date().toISOString() }
          }),
        }))
        return ok
      },

      deleteEntry: (id) => {
        const entry = get().entries.find((e) => e.id === id)
        if (!entry) return false
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }))
        useActivityStore.getState().log('planner-updated', `Removed “${entry.title}” from the planner`)
        return true
      },

      forMonth: (year, month) =>
        get().entries.filter((e) => {
          const [y, m] = e.date.split('-').map(Number)
          return y === year && m === month + 1
        }),

      replaceAll: (entries) => set({ entries }),

      clearAll: () => set({ entries: [] }),
    }),
    {
      name: STORE_KEYS.planner,
      version: 1,
      partialize: (s) => ({ entries: s.entries }),
    },
  ),
)
