import type { ReactNode } from 'react'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/lib/utils'

export function SectionHeading({
  kicker,
  title,
  description,
  align = 'center',
  className,
}: {
  kicker?: string
  title: ReactNode
  description?: ReactNode
  align?: 'center' | 'left'
  className?: string
}) {
  return (
    <Reveal
      className={cn(
        'max-w-2xl',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className,
      )}
    >
      {kicker ? <p className="kicker mb-4">{kicker}</p> : null}
      <h2 className="font-display text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{description}</p>
      ) : null}
    </Reveal>
  )
}
