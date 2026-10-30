import { useEffect } from 'react'
import { usePreferencesStore } from '@/store/preferences'

/** Applies the persisted theme (light/dark/system) to <html>. */
export function useThemeEffect(): void {
  const theme = usePreferencesStore((s) => s.theme)
  useEffect(() => {
    const root = document.documentElement
    const apply = () => {
      const dark =
        theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      root.classList.toggle('dark', dark)
    }
    apply()
    if (theme === 'system') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)')
      mql.addEventListener('change', apply)
      return () => mql.removeEventListener('change', apply)
    }
  }, [theme])
}
