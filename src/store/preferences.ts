/**
 * Preferences: theme + editor settings. Persisted to localStorage.
 * Same rehydration guarantees as the profile store — defaults never
 * overwrite saved values.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EditorPreferences, Preferences, ThemeMode } from '@/types'
import { STORE_KEYS } from '@/services/storage'
import { clamp } from '@/lib/utils'

const DEFAULT_EDITOR: EditorPreferences = {
  fontSize: 17,
  width: 'comfortable',
  spellcheck: true,
  autosave: true,
}

interface PreferencesState extends Preferences {
  setTheme: (theme: ThemeMode) => void
  setEditor: (patch: Partial<EditorPreferences>) => void
  reset: () => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'system',
      editor: DEFAULT_EDITOR,
      setTheme: (theme) => set({ theme }),
      setEditor: (patch) =>
        set((s) => {
          const next = { ...s.editor, ...patch }
          if (typeof next.fontSize === 'number') {
            next.fontSize = clamp(Math.round(next.fontSize), 14, 22)
          }
          return { editor: next }
        }),
      reset: () => set({ theme: 'system', editor: DEFAULT_EDITOR }),
    }),
    {
      name: STORE_KEYS.preferences,
      version: 1,
      partialize: (s) => ({ theme: s.theme, editor: s.editor }),
    },
  ),
)
