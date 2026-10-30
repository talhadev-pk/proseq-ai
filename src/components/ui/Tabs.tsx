import { useId } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface TabItem<T extends string> {
  id: T
  label: string
  icon?: ReactNode
}

/** Animated segmented tabs. */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  size = 'md',
  className,
}: {
  items: Array<TabItem<T>>
  value: T
  onChange: (id: T) => void
  size?: 'sm' | 'md'
  className?: string
}) {
  const groupId = useId()
  return (
    <div
      role="tablist"
      aria-label="Tabs"
      className={cn(
        'inline-flex items-center gap-1 rounded-xl border border-line bg-sand/60 p-1',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === value
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              'relative flex items-center gap-1.5 rounded-lg font-medium transition-colors',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm',
              active ? 'text-ink' : 'text-muted hover:text-ink',
            )}
          >
            {active ? (
              <motion.span
                layoutId={`tab-pill-${groupId}`}
                className="absolute inset-0 rounded-lg bg-paper shadow-soft"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            ) : null}
            <span className="relative z-10 flex items-center gap-1.5">
              {item.icon}
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
