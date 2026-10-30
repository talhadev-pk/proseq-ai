import { useEffect, useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import type { ThemeMode } from '@/types'
import { usePreferencesStore } from '@/store/preferences'
import { useActivityStore } from '@/store/activity'
import { toast } from '@/store/notifications'
import { cn } from '@/lib/utils'

/** Segmented light / system / dark control. */
export function ThemeToggle({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const theme = usePreferencesStore((s) => s.theme)
  const setTheme = usePreferencesStore((s) => s.setTheme)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const options: Array<{ id: ThemeMode; icon: typeof Sun; label: string }> = [
    { id: 'light', icon: Sun, label: 'Light theme' },
    { id: 'system', icon: Monitor, label: 'System theme' },
    { id: 'dark', icon: Moon, label: 'Dark theme' },
  ]

  if (!mounted) {
    return <span className={cn('inline-block', size === 'sm' ? 'h-8 w-[88px]' : 'h-10 w-[104px]')} aria-hidden />
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex items-center gap-0.5 rounded-full border border-line bg-sand/70 p-0.5"
    >
      {options.map(({ id, icon: Icon, label }) => {
        const active = theme === id
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => {
              if (theme === id) return
              setTheme(id)
              useActivityStore.getState().log('settings-changed', `Switched to the ${id} theme`)
              toast.success('Theme updated', `Saved — the ${id} theme now persists.`)
            }}
            className={cn(
              'flex items-center justify-center rounded-full transition-all',
              size === 'sm' ? 'size-7' : 'size-8',
              active
                ? 'bg-paper text-ink shadow-soft'
                : 'text-faint hover:text-muted',
            )}
          >
            <Icon className={size === 'sm' ? 'size-3.5' : 'size-4'} />
          </button>
        )
      })}
    </div>
  )
}
