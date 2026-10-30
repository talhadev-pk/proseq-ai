/** Ephemeral + persisted UI state (sidebar, drawers, command palette). */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORE_KEYS } from '@/services/storage'

interface UIState {
  sidebarCollapsed: boolean
  mobileNavOpen: boolean
  searchOpen: boolean
  toggleSidebar: () => void
  setMobileNav: (open: boolean) => void
  setSearchOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileNavOpen: false,
      searchOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setMobileNav: (open) => set({ mobileNavOpen: open }),
      setSearchOpen: (open) => set({ searchOpen: open }),
    }),
    {
      name: STORE_KEYS.ui,
      version: 1,
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    },
  ),
)
