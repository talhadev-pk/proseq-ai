import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface DropdownProps {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode
  children: ReactNode | ((close: () => void) => ReactNode)
  align?: 'left' | 'right'
  width?: string
  label?: string
}

/** Lightweight accessible dropdown menu with click-outside + ESC handling. */
export function Dropdown({ trigger, children, align = 'right', width = 'w-56', label }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const close = () => setOpen(false)
  const toggle = () => setOpen((o) => !o)

  return (
    <div ref={rootRef} className="relative">
      {trigger({ open, toggle })}
      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            aria-label={label}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className={cn(
              'absolute z-40 mt-2 overflow-hidden rounded-xl border border-line bg-paper p-1.5 shadow-lifted',
              width,
              align === 'right' ? 'right-0' : 'left-0',
            )}
          >
            {typeof children === 'function' ? (children as (c: () => void) => ReactNode)(close) : children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export function DropdownItem({
  icon,
  children,
  onClick,
  destructive,
  disabled,
}: {
  icon?: ReactNode
  children: ReactNode
  onClick?: () => void
  destructive?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors',
        destructive ? 'text-clay hover:bg-clay-soft' : 'text-ink hover:bg-sand',
        disabled && 'pointer-events-none opacity-40',
      )}
    >
      {icon ? <span className="shrink-0 text-faint">{icon}</span> : null}
      {children}
    </button>
  )
}
