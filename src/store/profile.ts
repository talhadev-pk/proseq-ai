/**
 * User profile store.
 *
 * CRITICAL PERSISTENCE RULES:
 * - Defaults (Talha / talhamalikawan@example.com) are only the *initial* state.
 * - zustand's persist middleware rehydrates from localStorage on load and
 *   merges saved values over these defaults — saved edits are never
 *   overwritten by the seed values.
 * - Writes happen only on explicit `updateProfile` calls.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { z } from 'zod'
import type { Profile } from '@/types'
import { STORE_KEYS } from '@/services/storage'
import { uid } from '@/lib/utils'

export const DEFAULT_PROFILE: Profile = {
  displayName: 'Talha',
  email: 'talhamalikawan@example.com',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const profileInputSchema = z.object({
  displayName: z.string().trim().min(2, 'Display name must be at least 2 characters').max(48),
  email: z.string().trim().email('Enter a valid email address'),
})

interface ProfileState {
  profile: Profile
  updateProfile: (input: { displayName: string; email: string }) => { ok: true } | { ok: false; error: string }
  /** Full reset — used only by the explicit "complete reset" action in Settings. */
  resetToDefaults: () => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      updateProfile: (input) => {
        const parsed = profileInputSchema.safeParse(input)
        if (!parsed.success) {
          return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid profile' }
        }
        const prev = get().profile
        set({
          profile: {
            ...prev,
            displayName: parsed.data.displayName,
            email: parsed.data.email.toLowerCase(),
            updatedAt: new Date().toISOString(),
          },
        })
        return { ok: true }
      },
      resetToDefaults: () =>
        set({
          profile: { ...DEFAULT_PROFILE, createdAt: uid('t'), updatedAt: new Date().toISOString() },
        }),
    }),
    {
      name: STORE_KEYS.profile,
      version: 1,
      partialize: (s) => ({ profile: s.profile }),
    },
  ),
)
