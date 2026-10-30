import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Tone = 'neutral' | 'violet' | 'blue' | 'moss' | 'amber' | 'clay'

const tones: Record<Tone, string> = {
  neutral: 'bg-sand text-muted border-line',
  violet: 'bg-violet-soft text-violet-deep border-violet/25',
  blue: 'bg-blue-soft text-blue border-blue/25',
  moss: 'bg-moss-soft text-moss border-moss/25',
  amber: 'bg-amber-soft text-amber border-amber/25',
  clay: 'bg-clay-soft text-clay border-clay/25',
}

export function Badge({
  tone = 'neutral',
  icon,
  children,
  className,
}: {
  tone?: Tone
  icon?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}
