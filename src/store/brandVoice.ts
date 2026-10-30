/** Brand voice profiles — persisted to localStorage. */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BrandVoice, ToneId } from '@/types'
import { STORE_KEYS } from '@/services/storage'
import { uid } from '@/lib/utils'
import { useActivityStore } from './activity'

export interface BrandVoiceDraft {
  name: string
  description: string
  tone: ToneId
  audience: string
  preferences: string
  wordsToUse: string[]
  wordsToAvoid: string[]
}

interface BrandVoiceState {
  voices: BrandVoice[]
  createVoice: (draft: BrandVoiceDraft) => BrandVoice | null
  updateVoice: (id: string, draft: BrandVoiceDraft) => boolean
  deleteVoice: (id: string) => boolean
  setActive: (id: string) => boolean
  activeVoice: () => BrandVoice | null
  replaceAll: (voices: BrandVoice[]) => void
  clearAll: () => void
}

export const useBrandVoiceStore = create<BrandVoiceState>()(
  persist(
    (set, get) => ({
      voices: [],

      createVoice: (draft) => {
        const name = draft.name.trim()
        if (!name) return null
        const now = new Date().toISOString()
        const voice: BrandVoice = {
          id: uid('voice'),
          name,
          description: draft.description.trim(),
          tone: draft.tone,
          audience: draft.audience.trim(),
          preferences: draft.preferences.trim(),
          wordsToUse: draft.wordsToUse,
          wordsToAvoid: draft.wordsToAvoid,
          active: get().voices.length === 0,
          createdAt: now,
          updatedAt: now,
        }
        set((s) => ({ voices: [...s.voices, voice] }))
        useActivityStore.getState().log('voice-updated', `Created the “${voice.name}” brand voice`)
        return voice
      },

      updateVoice: (id, draft) => {
        const name = draft.name.trim()
        if (!name) return false
        let ok = false
        set((s) => ({
          voices: s.voices.map((v) => {
            if (v.id !== id) return v
            ok = true
            return {
              ...v,
              name,
              description: draft.description.trim(),
              tone: draft.tone,
              audience: draft.audience.trim(),
              preferences: draft.preferences.trim(),
              wordsToUse: draft.wordsToUse,
              wordsToAvoid: draft.wordsToAvoid,
              updatedAt: new Date().toISOString(),
            }
          }),
        }))
        if (ok) useActivityStore.getState().log('voice-updated', `Updated the “${name}” brand voice`)
        return ok
      },

      deleteVoice: (id) => {
        const voice = get().voices.find((v) => v.id === id)
        if (!voice) return false
        const remaining = get().voices.filter((v) => v.id !== id)
        if (voice.active && remaining.length > 0) remaining[0] = { ...remaining[0], active: true }
        set({ voices: remaining })
        useActivityStore.getState().log('voice-updated', `Deleted the “${voice.name}” brand voice`)
        return true
      },

      setActive: (id) => {
        if (!get().voices.some((v) => v.id === id)) return false
        set((s) => ({
          voices: s.voices.map((v) => (v.id === id ? { ...v, active: true } : { ...v, active: false })),
        }))
        return true
      },

      activeVoice: () => get().voices.find((v) => v.active) ?? null,

      replaceAll: (voices) => set({ voices }),

      clearAll: () => set({ voices: [] }),
    }),
    {
      name: STORE_KEYS.brandVoices,
      version: 1,
      partialize: (s) => ({ voices: s.voices }),
    },
  ),
)
